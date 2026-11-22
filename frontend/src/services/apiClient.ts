// frontend/src/services/apiClient.ts

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { getAuthStore } from '@/store/rootStore'; // Or import from auth store directly
import { getUserFriendlyErrorDetails } from '@/lib/notifications';

// ============================================================
// Types
// ============================================================

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

/**
 * Shape of an error payload returned by the backend API
 */
export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// Constants
// ============================================================

const isPrivateOrLocalHostname = (hostname: string): boolean => {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')) return true;
  const octets = host.split('.').map(Number);
  if (octets.length !== 4 || !octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255)) {
    return false;
  }
  const [first, second] = octets;
  return first === 0 || first === 10 || first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127);
};

const getApiBaseUrl = (): string => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const baseUrl = configuredUrl || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '');
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required. Configure the public HTTPS backend URL for this deployment.');
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL ending in /api.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.pathname.replace(/\/+$/, '').endsWith('/api')) {
    throw new Error('NEXT_PUBLIC_API_URL must be an HTTP(S) URL ending in /api.');
  }
  if (url.username || url.password) {
    throw new Error('NEXT_PUBLIC_API_URL must not contain embedded credentials.');
  }
  if (process.env.NODE_ENV === 'production' &&
    (url.protocol !== 'https:' || isPrivateOrLocalHostname(url.hostname))) {
    throw new Error('Production NEXT_PUBLIC_API_URL must use HTTPS and a public hostname.');
  }
  return baseUrl.replace(/\/+$/, '');
};

const BASE_URL = getApiBaseUrl();
const TOKEN_KEY = 'shree-durga-auth-storage';
const REFRESH_TOKEN_ENDPOINT = '/auth/refresh-token';

// ============================================================
// Token helpers
// ============================================================

const getTokensFromStore = () => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        accessToken: parsed.state?.accessToken || null,
        refreshToken: parsed.state?.refreshToken || null,
      };
    }
  } catch {
    // ignore
  }
  return { accessToken: null, refreshToken: null };
};

const setTokensInStore = (accessToken: string, refreshToken: string) => {
  try {
    // We'll update the auth store directly; this is a fallback
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.state.accessToken = accessToken;
      parsed.state.refreshToken = refreshToken;
      localStorage.setItem(TOKEN_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
};

const clearTokensFromStore = () => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.state.accessToken = null;
      parsed.state.refreshToken = null;
      parsed.state.isAuthenticated = false;
      localStorage.setItem(TOKEN_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
};

// ============================================================
// Create Axios instance
// ============================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================================
// Request Interceptor
// ============================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const { accessToken } = getTokensFromStore();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================
// Response Interceptor with token refresh
// ============================================================

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const { refreshToken } = getTokensFromStore();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      `${BASE_URL}${REFRESH_TOKEN_ENDPOINT}`,
      { refreshToken }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    // Update tokens in storage
    setTokensInStore(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    // Refresh token invalid – clear auth and reject
    clearTokensFromStore();
    // Dispatch logout event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw error;
  }
};

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data directly if it's an ApiResponse, else wrap it
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and not a retry, attempt to refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(REFRESH_TOKEN_ENDPOINT)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        // Update request headers
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        onTokenRefreshed(newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed – reject the original error
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const errorPayload = error.response?.data as ApiErrorPayload | undefined;
    const apiError: ApiError = {
      status: error.response?.status || 0,
      message: errorPayload?.message || (
        !error.response
          ? error.code === 'ECONNABORTED'
            ? 'The API request timed out. Please try again.'
            : 'Unable to reach the API. Check the backend URL and your network connection.'
          : getUserFriendlyErrorDetails(error).title
      ),
      code: errorPayload?.code || error.code,
      errors: errorPayload?.errors || (errorPayload as { details?: Record<string, string[]> } | undefined)?.details,
    };

    // Return a rejected promise with the structured error
    return Promise.reject(apiError);
  }
);

// ============================================================
// Helper functions for common request patterns
// ============================================================

/**
 * GET request with type inference
 */
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.get(url, config).then((res) => res.data);
};

/**
 * POST request
 */
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.post(url, data, config).then((res) => res.data);
};

/**
 * PUT request
 */
export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.put(url, data, config).then((res) => res.data);
};

/**
 * PATCH request
 */
export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.patch(url, data, config).then((res) => res.data);
};

/**
 * DELETE request
 */
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.delete(url, config).then((res) => res.data);
};

// ============================================================
// Upload helper (multipart/form-data)
// ============================================================

export const uploadFile = <T>(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData?: Record<string, unknown>
): Promise<T> => {
  const formData = new FormData();
  formData.append(fieldName, file);
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }
  return apiClient
    .post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data);
};

// ============================================================
// Error handler for components
// ============================================================

export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
};

// ============================================================
// Type guard for API errors
// ============================================================

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
};

// ============================================================
// Default export
// ============================================================

export default apiClient;