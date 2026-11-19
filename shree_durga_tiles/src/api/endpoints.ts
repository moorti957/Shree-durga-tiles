import type { AdminUser, Bill, Category, Enquiry, Paginated, Product, ShopSettings, Visitor } from './types';
import * as FileSystem from 'expo-file-system/legacy';
import { apiRequest } from './client';
import { API_BASE_URL, USE_MOCK_API } from '@/config/env';
import { readAccessToken } from '@/features/auth/authStore';
import { mapBill, mapBillPage } from '@/features/bills/api';

export const authApi = {
  async login(identifier: string, password: string) {
    return apiRequest<{ admin: AdminUser; accessToken: string; refreshToken: string }>({
      method: 'post',
      url: '/admin/auth/login',
      data: { identifier, password },
    });
  },
  logout: () => apiRequest<{ loggedOut: boolean }>({ method: 'post', url: '/admin/auth/logout' }),
  me: () => apiRequest<{ admin: AdminUser }>({ method: 'get', url: '/admin/auth/me' }),
};

export type Dashboard = {
  products: number;
  categories: number;
  newEnquiries: number;
  visitorsToday: number;
  pageViewsToday: number;
  bills: number;
  recentEnquiries: Enquiry[];
  liveVisitors?: number;
  publishedProducts?: number;
  draftProducts?: number;
  paymentDue?: number;
  recentVisitors?: Visitor[];
  recentBills?: Bill[];
};

export const dashboardApi = {
  get: async () => {
    const dashboard = await apiRequest<Dashboard>({ method: 'get', url: '/admin/dashboard' });
    return {
      ...dashboard,
      ...(Array.isArray(dashboard.recentBills)
        ? { recentBills: dashboard.recentBills.map(mapBill) }
        : {}),
    };
  },
};

export const productsApi = {
  list: (params: { page?: number; limit?: number; q?: string; category?: string; status?: string; sort?: string }) =>
    apiRequest<Paginated<Product>>({ method: 'get', url: '/admin/products', params }),
  get: (id: string) => apiRequest<Product>({ method: 'get', url: `/admin/products/${id}` }),
  create: (product: Record<string, unknown>) =>
    apiRequest<Product>({ method: 'post', url: '/admin/products', data: product }),
  update: (id: string, product: Record<string, unknown>) =>
    apiRequest<Product>({ method: 'patch', url: `/admin/products/${id}`, data: product }),
  remove: (id: string) => apiRequest<{ deleted: boolean }>({ method: 'delete', url: `/admin/products/${id}` }),
  upload: async (uri: string, name: string) => {
    const form = new FormData();
    form.append('file', { uri, name, type: 'image/jpeg' } as unknown as Blob);
    return apiRequest<{ url: string; publicId: string }>({
      method: 'post',
      url: '/admin/uploads',
      data: form,
    });
  },
};

export const categoriesApi = {
  list: () => apiRequest<Paginated<Category>>({ method: 'get', url: '/admin/categories', params: { limit: 100 } }),
  create: (category: Record<string, unknown>) =>
    apiRequest<Category>({ method: 'post', url: '/admin/categories', data: category }),
  update: (id: string, category: Record<string, unknown>) =>
    apiRequest<Category>({ method: 'patch', url: `/admin/categories/${id}`, data: category }),
  reorder: (categories: { id: string; sortOrder: number; displayOrder: number }[]) =>
    apiRequest<{ updated: number }>({ method: 'post', url: '/admin/categories/reorder', data: { categories } }),
  remove: (id: string) => apiRequest<{ deleted: boolean }>({ method: 'delete', url: `/admin/categories/${id}` }),
  upload: async (uri: string, name: string) => {
    const form = new FormData();
    form.append('file', { uri, name, type: 'image/jpeg' } as unknown as Blob);
    return apiRequest<{ url: string; publicId: string }>({ method: 'post', url: '/admin/uploads', data: form });
  },
};

export const visitorsApi = {
  list: (params: { page?: number; limit?: number; from?: string; to?: string } = {}) =>
    apiRequest<Paginated<Visitor>>({ method: 'get', url: '/admin/visitors', params }),
  analytics: () => apiRequest<Record<string, unknown>>({ method: 'get', url: '/admin/analytics/visitors' }),
};

export const enquiriesApi = {
  list: (params: { page?: number; limit?: number; status?: string } = {}) =>
    apiRequest<Paginated<Enquiry>>({ method: 'get', url: '/admin/enquiries', params }),
  get: (id: string) => apiRequest<Enquiry>({ method: 'get', url: `/admin/enquiries/${id}` }),
  update: (id: string, data: { status?: Enquiry['status']; adminNote?: string }) =>
    apiRequest<Enquiry>({ method: 'patch', url: `/admin/enquiries/${id}`, data }),
};

export const devicesApi = {
  register: (token: string, platform: 'android' | 'ios') =>
    apiRequest<{ device: { _id: string }; pushDeliveryConfigured: boolean }>({
      method: 'post',
      url: '/admin/devices/register',
      data: { token, platform },
    }),
};

export const billsApi = {
  list: async (params: { page?: number; limit?: number; status?: string; q?: string } = {}) =>
    mapBillPage(await apiRequest<Paginated<unknown>>({ method: 'get', url: '/admin/bills', params })),
  get: async (id: string) =>
    mapBill(await apiRequest<unknown>({ method: 'get', url: `/admin/bills/${id}` })),
  create: async (bill: Record<string, unknown>) =>
    mapBill(await apiRequest<unknown>({
      method: 'post',
      url: '/admin/bills',
      data: bill,
      headers: { 'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    })),
  update: async (id: string, bill: Record<string, unknown>) =>
    mapBill(await apiRequest<unknown>({ method: 'put', url: `/admin/bills/${id}`, data: bill })),
  finalize: async (id: string) =>
    mapBill(await apiRequest<unknown>({ method: 'post', url: `/admin/bills/${id}/finalize` })),
  cancel: async (id: string) =>
    mapBill(await apiRequest<unknown>({ method: 'post', url: `/admin/bills/${id}/cancel` })),
  shareLink: (id: string) =>
    apiRequest<{ url: string; message: string }>({ method: 'post', url: `/admin/bills/${id}/share-link` }),
  downloadPdf: async (id: string) => {
    if (USE_MOCK_API) throw new Error('Server PDF downloads are unavailable in mock mode.');
    const directory = FileSystem.cacheDirectory;
    if (!directory) throw new Error('Device cache storage is unavailable.');
    const url = `${API_BASE_URL}/admin/bills/${encodeURIComponent(id)}/pdf`;
    const destination = `${directory}bill-${encodeURIComponent(id)}-${Date.now()}.pdf`;
    let token = await readAccessToken();
    if (!token) throw new Error('Admin session has expired. Please sign in again.');

    let result = await FileSystem.downloadAsync(url, destination, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (result.status === 401) {
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
      await billsApi.get(id);
      token = await readAccessToken();
      if (!token) throw new Error('Admin session has expired. Please sign in again.');
      result = await FileSystem.downloadAsync(url, destination, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    if (result.status < 200 || result.status >= 300) {
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
      throw new Error(`Could not download bill PDF (HTTP ${result.status}).`);
    }
    return result;
  },
  addPayment: async (id: string, payment: { amount: number; mode: 'upi' | 'cash' | 'bank' | 'cheque' }) =>
    mapBill(await apiRequest<unknown>({
      method: 'post',
      url: `/admin/bills/${id}/payments`,
      data: payment,
      headers: { 'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    })),
  settings: () => apiRequest<ShopSettings>({ method: 'get', url: '/admin/settings' }),
  updateSettings: (settings: Partial<ShopSettings>) =>
    apiRequest<ShopSettings>({ method: 'patch', url: '/admin/settings', data: settings }),
};
