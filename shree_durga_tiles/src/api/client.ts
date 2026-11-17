import axios, { AxiosHeaders, create, type AxiosError, type AxiosRequestConfig } from 'axios';
import { API_BASE_URL, USE_MOCK_API } from '@/config/env';
import { mockAdapter } from './mockAdapter';
import { normalizeApiError } from './errors';
import { readAccessToken, readRefreshToken, useAuthStore } from '@/features/auth/authStore';

type RetryConfig = AxiosRequestConfig & { _retry?: boolean; _attempt?: number };
const client = create({
  baseURL: API_BASE_URL || (USE_MOCK_API ? 'https://mock.local/api' : undefined),
  timeout: 20_000,
  adapter: USE_MOCK_API ? mockAdapter : undefined,
  headers: { Accept: 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await readAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    config.headers.delete?.('Content-Type');
  } else {
    config.headers['Content-Type'] ??= 'application/json';
  }
  if (config.url?.includes('/uploads')) config.timeout = 60_000;
  return config;
});

let refreshTask: Promise<string> | null = null;
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const url = config?.url ?? '';
    if (error.response?.status === 401 && config && !config._retry && !url.includes('/admin/auth/')) {
      config._retry = true;
      config.headers = config.headers ?? new AxiosHeaders();
      try {
        if (!refreshTask) {
          refreshTask = (async () => {
            const refreshToken = await readRefreshToken();
            if (!refreshToken) throw new Error('Refresh token is unavailable.');
            const response = await axios.post(
              `${API_BASE_URL}/admin/auth/refresh`,
              { refreshToken },
              USE_MOCK_API ? { adapter: mockAdapter } : undefined
            );
            const data = response.data.data as { accessToken: string; refreshToken: string };
            const user = useAuthStore.getState().user ?? {
              id: '',
              name: '',
              identifier: '',
              role: 'owner',
            };
            await useAuthStore.getState().setSession(user, data.accessToken, data.refreshToken);
            return data.accessToken;
          })().finally(() => {
            refreshTask = null;
          });
        }
        config.headers.Authorization = `Bearer ${await refreshTask}`;
        return client.request(config);
      } catch {
        await useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }
    }

    if (config && config.method?.toLowerCase() === 'get' && !config._retry && !error.response) {
      config._attempt = (config._attempt ?? 0) + 1;
      if (config._attempt <= 2) {
        config._retry = true;
        await new Promise((resolve) => setTimeout(resolve, 350 * 2 ** (config._attempt! - 1)));
        config._retry = false;
        return client.request(config);
      }
    }
    return Promise.reject(normalizeApiError(error));
  }
);

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await client.request<{ data: T; meta?: PaginatedMeta }>(config);
    if (response.data.meta) {
      return { data: response.data.data, meta: response.data.meta } as T;
    }
    return response.data.data;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
      throw error;
    }
    throw normalizeApiError(error);
  }
};

type PaginatedMeta = { page: number; limit: number; total: number; pages: number };

export default client;
