// admin/src/services/api.ts

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { apiClient as sharedApiClient } from './adminApi';

// ============================================================
// Types
// ============================================================
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

// ============================================================
// Constants
// ============================================================
const TOKEN_KEY = 'panditji-admin-token';

// ============================================================
// Token Helpers
// ============================================================
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// ============================================================
// Both service modules share the admin API client's auth interceptors and base URL.
export const apiClient: AxiosInstance = sharedApiClient;

// ============================================================
// API Client Methods (for convenience)
// ============================================================
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.get(url, config).then((res) => res.data);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.post(url, data, config).then((res) => res.data);
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.put(url, data, config).then((res) => res.data);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.patch(url, data, config).then((res) => res.data);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.delete(url, config).then((res) => res.data);
  },

  /**
   * Upload file (multipart/form-data)
   */
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    }).then((res) => res.data);
  },
};

// ============================================================
// Error Handler Helper
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

export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'status' in error && 'message' in error;
};

// ============================================================
// Default export
// ============================================================
export default api;