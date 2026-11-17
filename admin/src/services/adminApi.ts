  // admin/src/services/adminApi.ts

  import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
  import { toast } from 'react-hot-toast';

  // ============================================================
  // Types
  // ============================================================
  export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
    errors?: any;
    meta?: { page: number; limit: number; total: number; pages: number };
  }

  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  // ============================================================
  // API Client Setup
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
  const TOKEN_KEY = 'panditji-admin-token';
  const REFRESH_TOKEN_KEY = 'panditji-admin-refresh-token';

  // Create axios instance
  export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ============================================================
  // Token Management
  // ============================================================
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  };

  const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  };

  const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  };

  const setRefreshToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  };

  const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  // ============================================================
  // Request Interceptor
  // ============================================================
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ============================================================
  // Response Interceptor
  // ============================================================
  let refreshPromise: Promise<string> | null = null;

  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Return the data directly (API always returns { success, data, message })
      return response;
    },
    async (error) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const authUrl = originalRequest?.url?.split('?')[0];
      const isAuthRequest =
        authUrl === '/admin/auth/login' || authUrl === '/admin/auth/refresh';
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
        originalRequest._retry = true;
        try {
          if (!refreshPromise) {
            refreshPromise = authApi.refreshToken().finally(() => {
              refreshPromise = null;
            });
          }
          const accessToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient.request(originalRequest);
        } catch {
          removeToken();
          if (typeof window !== 'undefined') window.location.href = '/login';
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  // ============================================================
  // Helper to extract data from response
  // ============================================================
  const extractData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    return response.data.data;
  };

  const extractPaginated = <T>(response: AxiosResponse<ApiResponse<PaginatedResponse<T>>>): PaginatedResponse<T> => {
    return response.data.data;
  };

  const normalizeProduct = (product: any) => {
    if (!product) return product;

    const category = typeof product.category === 'string'
      ? { id: product.category }
      : product.category
        ? {
          ...(product.category || {}),
          id: product.category?._id || product.category?.id || product.category,
        }
        : undefined;

    return {
      ...product,
      id: product._id || product.id,
      _id: product._id || product.id,
      category,
      isNew: product.isNewProduct ?? product.isNew ?? false,
      isActive: product.isActive ?? true,
      inStock: product.inStock ?? (product.stockQuantity > 0),
      status: product.status ?? 'published',
    };
  };

  const normalizeProductList = (products: any[] = []) =>
    (products || []).map((product) => normalizeProduct(product));

  // ============================================================
  // Auth API
  // ============================================================
  export const authApi = {
    login: async (
      identifier: string,
      password: string
    ): Promise<{ user: any; accessToken: string }> => {
      const response = await apiClient.post<
        ApiResponse<{
          admin: { id: string; name: string; identifier: string; role: string };
          accessToken: string;
          refreshToken: string;
        }>
      >('/admin/auth/login', {
        identifier,
        password,
      });
      const data = extractData(response);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return {
        accessToken: data.accessToken,
        user: { ...data.admin, email: data.admin.identifier },
      };
    },

    logout: async (): Promise<void> => {
      try {
        await apiClient.post('/admin/auth/logout');
      } finally {
        removeToken();
      }
    },

    getMe: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<{ admin: any }>>('/admin/auth/me');
      const { admin } = extractData(response);
      return { ...admin, email: admin.identifier };
    },

    refreshToken: async (): Promise<string> => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('Admin refresh token is unavailable.');
      const response = await apiClient.post<
        ApiResponse<{ accessToken: string; refreshToken: string }>
      >('/admin/auth/refresh', { refreshToken });
      const data = extractData(response);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return data.accessToken;
    },
  };

  // ============================================================
  // Dashboard API
  // ============================================================
  export const dashboardApi = {
    getStats: async (period?: string): Promise<any> => {
      void period;
      const response = await apiClient.get<ApiResponse<any>>('/admin/dashboard');
      return extractData(response);
    },

    getRevenueData: async (period?: string): Promise<any> => {
      void period;
      const response = await apiClient.get<ApiResponse<any>>('/admin/analytics/visitors');
      return extractData(response);
    },

    getRecentOrders: async (limit: number = 5): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/admin/enquiries', { params: { limit } });
      return response.data.data;
    },
  };

  // ============================================================
  // Products API
  // ============================================================
  export const productApi = {
    getProducts: async (params?: any): Promise<PaginatedResponse<any>> => {
      const { search, sortBy, sortOrder, ...query } = params || {};
      const response = await apiClient.get<ApiResponse<any[]>>('/admin/products', {
        params: { ...query, q: search, sortBy, sortOrder },
      });
      const products = normalizeProductList(response.data.data || []);
      const meta = response.data.meta;

      return {
        data: products,
        total: meta?.total ?? products.length,
        page: meta?.page ?? 1,
        limit: meta?.limit ?? products.length,
        totalPages: meta?.pages ?? 1,
      };
    },

    getProduct: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/admin/products/${id}`);
      return normalizeProduct(extractData(response));
    },

    createProduct: async (data: any): Promise<any> => {
      const payload = {
        ...data,
        isNewProduct: data?.isNewProduct ?? data?.isNew ?? false,
        isNew: undefined,
      };
      const response = await apiClient.post<ApiResponse<any>>('/admin/products', payload);
      return normalizeProduct(extractData(response));
    },

    updateProduct: async (id: string, data: any): Promise<any> => {
      const payload = {
        ...data,
        isNewProduct: data?.isNewProduct ?? data?.isNew ?? false,
        isNew: undefined,
      };
      const response = await apiClient.patch<ApiResponse<any>>(`/admin/products/${id}`, payload);
      return normalizeProduct(extractData(response));
    },

    deleteProduct: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/products/${id}`);
    },

    bulkDeleteProducts: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/products/bulk', { data: { ids } });
    },

    updateStock: async (id: string, stockQuantity: number): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}/stock`, { stockQuantity });
      return extractData(response);
    },

    toggleFeatured: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}/toggle-featured`);
      return extractData(response);
    },

    toggleNew: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}/toggle-new`);
      return extractData(response);
    },

    uploadImages: async (formData: FormData): Promise<string[]> => {
      const uploadData = new FormData();
      formData.forEach((value, key) => {
        if (key === 'images' || key === 'files') uploadData.append('files', value);
      });
      uploadData.append('folder', 'products');
      const response = await apiClient.post<ApiResponse<Array<{ url: string }>>>('/admin/uploads/multiple', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload = extractData(response);
      return (payload || []).map((item) => item.url);
    },
  };

  // ============================================================
  // Categories API
  // ============================================================
  export const categoryApi = {
    getCategories: async (params?: any): Promise<PaginatedResponse<any>> => {
      const { search, ...query } = params || {};
      const response = await apiClient.get<ApiResponse<any[]>>('/admin/categories', {
        params: { ...query, limit: Math.min(Number(query.limit) || 20, 100), q: search },
      });
      const categories = response.data.data || [];
      const meta = response.data.meta;

      return {
        data: categories,
        total: meta?.total ?? categories.length,
        page: meta?.page ?? 1,
        limit: meta?.limit ?? categories.length,
        totalPages: meta?.pages ?? 1,
      };
    },

    uploadImage: async (formData: FormData): Promise<string[]> => {
      const uploadData = new FormData();
      formData.forEach((value, key) => {
        if (key === 'images' || key === 'files') uploadData.append('files', value);
      });
      uploadData.append('folder', 'categories');
      const response = await apiClient.post<ApiResponse<Array<{ url: string }>>>(
        '/admin/uploads/multiple',
        uploadData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const payload = extractData(response);

      return (payload || []).map((item) => item.url);
    },

    getCategoryTree: async (): Promise<any[]> => {
      return (await categoryApi.getCategories({ limit: 100 })).data;
    },

    getCategory: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/admin/categories/${id}`);
      return extractData(response);
    },

    createCategory: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/admin/categories', data);
      return extractData(response);
    },

    updateCategory: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/admin/categories/${id}`, data);
      return extractData(response);
    },

    deleteCategory: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/categories/${id}`);
    },

    toggleFeatured: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/categories/${id}/toggle-featured`);
      return extractData(response);
    },

    reorder: async (categories: { id: string; displayOrder: number }[]): Promise<void> => {
      await apiClient.put('/categories/reorder', { categories });
    },

    bulkDelete: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/categories/bulk', { data: { ids } });
    },
  };

  // ============================================================
  // Orders API
  // ============================================================
  export const orderApi = {
    getOrders: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any>>('/orders/admin/all', { params });
      const payload = extractData(response);
      const orders = payload?.orders || payload?.data || [];

      return {
        data: orders,
        total: payload?.total ?? orders.length,
        page: payload?.page ?? 1,
        limit: payload?.limit ?? orders.length,
        totalPages: payload?.totalPages ?? 1,
      };
    },

    getOrder: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/orders/${id}`);
      return extractData(response);
    },

    updateOrderStatus: async (id: string, status: string, notes?: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/orders/${id}/status`, { status, notes });
      return extractData(response);
    },

    updatePaymentStatus: async (id: string, paymentStatus: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/orders/${id}/payment-status`, { paymentStatus });
      return extractData(response);
    },

    updateShippingDetails: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/orders/${id}/shipping`, data);
      return extractData(response);
    },

    deleteOrder: async (id: string): Promise<void> => {
      await apiClient.delete(`/orders/${id}`);
    },
  };

  // ============================================================
  // Users API
  // ============================================================
  export const userApi = {
    getUsers: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any>>('/users', { params });
      const payload = extractData(response);
      const users = payload?.users || payload?.data || [];

      return {
        data: users,
        total: payload?.total ?? users.length,
        page: payload?.page ?? 1,
        limit: payload?.limit ?? users.length,
        totalPages: payload?.totalPages ?? 1,
      };
    },

    getUser: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/users/${id}`);
      return extractData(response);
    },

    getUserActivity: async (id: string, params?: any): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/users/${id}/activity`, { params });
      return extractData(response);
    },

    updateUserRole: async (id: string, role: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/users/${id}/role`, { role });
      return extractData(response);
    },

    updateUserStatus: async (id: string, isActive: boolean): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/users/${id}/status`, { isActive });
      return extractData(response);
    },

    deleteUser: async (id: string): Promise<void> => {
      await apiClient.delete(`/users/${id}`);
    },

    bulkDeleteUsers: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/users/bulk', { data: { ids } });
    },

    getUserStats: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/users/stats');
      return extractData(response);
    },
  };

  // ============================================================
  // Settings API
  // ============================================================
  export const settingsApi = {
    getSettings: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/admin/settings');
      const settings = extractData(response);
      return {
        ...settings,
        storeName: settings.shopName || settings.storeName,
        storeEmail: settings.email || settings.storeEmail,
        storePhone: settings.phone || settings.storePhone,
        storeAddress: settings.address || settings.storeAddress,
        storeDescription: settings.aboutText || settings.storeDescription,
        taxRate: settings.defaultGstRate ?? settings.gstPercentage ?? settings.taxRate,
        facebook: settings.social?.facebook || settings.socialLinks?.facebook || '',
        instagram: settings.social?.instagram || settings.socialLinks?.instagram || '',
        youtube: settings.social?.youtube || settings.socialLinks?.youtube || '',
        twitter: settings.social?.twitter || settings.socialLinks?.twitter || '',
        metaTitle: settings.seo?.metaTitle || '',
        metaDescription: settings.seo?.metaDescription || '',
        metaKeywords: settings.seo?.metaKeywords || '',
        googleAnalyticsId: settings.seo?.googleAnalyticsId || '',
        contactEmail: settings.email || settings.contact?.email || '',
        contactPhone: settings.phone || settings.contact?.phone || '',
        contactAddress: settings.address || settings.contact?.address || '',
        whatsappNumber: settings.whatsapp || settings.contact?.whatsapp || '',
      };
    },

    updateStoreSettings: async (data: any): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>('/admin/settings', {
        shopName: data.storeName,
        email: data.storeEmail,
        phone: data.storePhone,
        address: data.storeAddress,
        aboutText: data.storeDescription,
      });
      return extractData(response);
    },

    updatePaymentSettings: async (data: any): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>('/admin/settings', {
        defaultGstRate: data.taxRate,
        gstin: data.gstin,
        upiId: data.upiId,
        invoicePrefix: data.invoicePrefix,
        invoiceTerms: data.invoiceTerms,
        invoiceFooterNote: data.invoiceFooterNote,
        qrMode: data.qrMode,
      });
      return extractData(response);
    },

    updateShippingSettings: async (data: any): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>('/admin/settings', data);
      return extractData(response);
    },

    updateSocialSettings: async (data: any): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>('/admin/settings', { social: data });
      return extractData(response);
    },

    updateSEOSettings: async (data: any): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>('/admin/settings', {
        seo: {
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          googleAnalyticsId: data.googleAnalyticsId,
        },
      });
      return extractData(response);
    },

    updateContactSettings: async (data: any): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>('/admin/settings', {
        email: data.contactEmail,
        phone: data.contactPhone,
        address: data.contactAddress,
        whatsapp: data.whatsappNumber,
      });
      return extractData(response);
    },
  };

  export const enquiryApi = {
    getEnquiries: async (params?: any): Promise<PaginatedResponse<any>> => {
      const { search, ...query } = params || {};
      const response = await apiClient.get<ApiResponse<any[]>>('/admin/enquiries', {
        params: { ...query, q: search },
      });
      const items = response.data.data || [];
      const meta = response.data.meta;
      return {
        data: items,
        total: meta?.total ?? items.length,
        page: meta?.page ?? 1,
        limit: meta?.limit ?? items.length,
        totalPages: meta?.pages ?? 1,
      };
    },
    updateEnquiry: async (id: string, data: { status?: string; adminNote?: string }): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/admin/enquiries/${id}`, data);
      return extractData(response);
    },
  };

  export const visitorApi = {
    getVisitors: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/admin/visitors', { params });
      const items = response.data.data || [];
      const meta = response.data.meta;
      return {
        data: items,
        total: meta?.total ?? items.length,
        page: meta?.page ?? 1,
        limit: meta?.limit ?? items.length,
        totalPages: meta?.pages ?? 1,
      };
    },
    getAnalytics: async (params?: any): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/admin/analytics/visitors', { params });
      return extractData(response);
    },
  };

  export const billApi = {
    getBills: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/admin/bills', { params });
      const items = response.data.data || [];
      const meta = response.data.meta;
      return {
        data: items,
        total: meta?.total ?? items.length,
        page: meta?.page ?? 1,
        limit: meta?.limit ?? items.length,
        totalPages: meta?.pages ?? 1,
      };
    },
    getBill: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/admin/bills/${id}`);
      return extractData(response);
    },
  };
  // ============================================================
  // Gallery API
  // ============================================================
  export const galleryApi = {
    getGallery: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/gallery', { params });
      return extractPaginated(response);
    },

    uploadImages: async (formData: FormData): Promise<string[]> => {
      const response = await apiClient.post<ApiResponse<{ images: string[] }>>('/upload/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response).images;
    },

    deleteImage: async (id: string): Promise<void> => {
      await apiClient.delete(`/gallery/${id}`);
    },

    bulkDelete: async (ids: string[]): Promise<void> => {
      await apiClient.delete('/gallery/bulk', { data: { ids } });
    },
  };

  // ============================================================
  // Banners API
  // ============================================================
  export const bannerApi = {
    getBanners: async (params?: any): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/banners', { params });
      return extractData(response);
    },

    getBanner: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/banners/${id}`);
      return extractData(response);
    },

    createBanner: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/banners', data);
      return extractData(response);
    },

    updateBanner: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/banners/${id}`, data);
      return extractData(response);
    },

    deleteBanner: async (id: string): Promise<void> => {
      await apiClient.delete(`/banners/${id}`);
    },
  };

  // ============================================================
  // Testimonials API
  // ============================================================
  export const testimonialApi = {
    getTestimonials: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/testimonials', { params });
      return extractPaginated(response);
    },

    getTestimonial: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/testimonials/${id}`);
      return extractData(response);
    },

    createTestimonial: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/testimonials', data);
      return extractData(response);
    },

    updateTestimonial: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/testimonials/${id}`, data);
      return extractData(response);
    },

    deleteTestimonial: async (id: string): Promise<void> => {
      await apiClient.delete(`/testimonials/${id}`);
    },

    toggleActive: async (id: string): Promise<any> => {
      const response = await apiClient.patch<ApiResponse<any>>(`/testimonials/${id}/toggle-active`);
      return extractData(response);
    },
  };

  // ============================================================
  // FAQs API
  // ============================================================
  export const faqApi = {
    getFAQs: async (params?: any): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/faqs', { params });
      return extractData(response);
    },

    getFAQ: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/faqs/${id}`);
      return extractData(response);
    },

    createFAQ: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/faqs', data);
      return extractData(response);
    },

    updateFAQ: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/faqs/${id}`, data);
      return extractData(response);
    },

    deleteFAQ: async (id: string): Promise<void> => {
      await apiClient.delete(`/faqs/${id}`);
    },

    reorder: async (faqs: { id: string; displayOrder: number }[]): Promise<void> => {
      await apiClient.put('/faqs/reorder', { faqs });
    },
  };

  // ============================================================
  // Blogs API
  // ============================================================
  export const blogApi = {
    getBlogs: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/blogs', { params });
      return extractPaginated(response);
    },

    getBlog: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/blogs/${id}`);
      return extractData(response);
    },

    createBlog: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/blogs', data);
      return extractData(response);
    },

    updateBlog: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/blogs/${id}`, data);
      return extractData(response);
    },

    deleteBlog: async (id: string): Promise<void> => {
      await apiClient.delete(`/blogs/${id}`);
    },

    uploadImages: async (formData: FormData): Promise<string[]> => {
      const response = await apiClient.post<ApiResponse<{ images: string[] }>>('/upload/blog', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response).images;
    },
  };

  // ============================================================
  // Videos API
  // ============================================================
  export const videoApi = {
    getVideos: async (params?: any): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/videos', { params });
      return extractData(response);
    },

    getVideo: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/videos/${id}`);
      return extractData(response);
    },

    createVideo: async (data: any): Promise<any> => {
      const response = await apiClient.post<ApiResponse<any>>('/videos', data);
      return extractData(response);
    },

    updateVideo: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/videos/${id}`, data);
      return extractData(response);
    },

    deleteVideo: async (id: string): Promise<void> => {
      await apiClient.delete(`/videos/${id}`);
    },
  };

  // ============================================================
  // Homepage Sections API
  // ============================================================
  export const homepageApi = {
    getSections: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/homepage');
      return extractData(response);
    },

    updateSections: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/homepage', data);
      return extractData(response);
    },

    getHero: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/homepage/hero');
      return extractData(response);
    },

    updateHero: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/homepage/hero', data);
      return extractData(response);
    },

    getFeaturedCategories: async (): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>('/homepage/featured-categories');
      return extractData(response);
    },

    updateFeaturedCategories: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/homepage/featured-categories', data);
      return extractData(response);
    },
  };

  // ============================================================
  // SEO API
  // ============================================================
  export const seoApi = {
    getSEO: async (): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>('/seo');
      return extractData(response);
    },

    updateSEO: async (data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>('/seo', data);
      return extractData(response);
    },

    getPageSEO: async (path: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/seo/page`, { params: { path } });
      return extractData(response);
    },

    updatePageSEO: async (path: string, data: any): Promise<any> => {
      const response = await apiClient.put<ApiResponse<any>>(`/seo/page`, { path, ...data });
      return extractData(response);
    },
  };

  // ============================================================
  // Media API
  // ============================================================
  export const mediaApi = {
    uploadFile: async (file: File, folder?: string): Promise<{ url: string; publicId: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      const response = await apiClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },

    uploadMultiple: async (files: File[], folder?: string): Promise<Array<{ url: string; publicId: string }>> => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      if (folder) formData.append('folder', folder);
      const response = await apiClient.post<ApiResponse<Array<{ url: string; publicId: string }>>>('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    },

    deleteFile: async (publicId: string): Promise<void> => {
      await apiClient.delete(`/upload/${publicId}`);
    },

    deleteMultiple: async (publicIds: string[]): Promise<void> => {
      await apiClient.delete('/upload/bulk', { data: { publicIds } });
    },

    getSignedUrl: async (type: string): Promise<{ url: string; fields: Record<string, string> }> => {
      const response = await apiClient.get<ApiResponse<{ url: string; fields: Record<string, string> }>>('/upload/signed-url', {
        params: { type },
      });
      return extractData(response);
    },
  };

  // ============================================================
  // Combined API object for easy import
  // ============================================================
  export const adminApi: any = {
    auth: authApi,
    dashboard: dashboardApi,
    products: productApi,
    categories: categoryApi,
    orders: orderApi,
    users: userApi,
    settings: settingsApi,
    enquiries: enquiryApi,
    visitors: visitorApi,
    bills: billApi,
    gallery: galleryApi,
    banners: bannerApi,
    testimonials: testimonialApi,
    faqs: faqApi,
    blogs: blogApi,
    videos: videoApi,
    homepage: homepageApi,
    seo: seoApi,
    media: mediaApi,

    // Direct access to the underlying axios instance if needed
    client: apiClient,
  };

  // --- Flat convenience proxies for legacy callers ---
  // Categories
  (adminApi as any).uploadCategoryImage = (formData: FormData) =>
    (adminApi as any).categories.uploadImage(formData);
  (adminApi as any).getCategories = (params?: any) => (adminApi as any).categories.getCategories(params);
  (adminApi as any).getCategory = (id: string) => (adminApi as any).categories.getCategory(id);
  (adminApi as any).createCategory = (data: any) => (adminApi as any).categories.createCategory(data);
  (adminApi as any).updateCategory = (id: string, data: any) => (adminApi as any).categories.updateCategory(id, data);
  (adminApi as any).deleteCategory = (id: string) => (adminApi as any).categories.deleteCategory(id);

  // Products
  (adminApi as any).getProducts = (params?: any) => (adminApi as any).products.getProducts(params);
  (adminApi as any).getProduct = (id: string) => (adminApi as any).products.getProduct(id);
  (adminApi as any).createProduct = (data: any) => (adminApi as any).products.createProduct(data);
  (adminApi as any).updateProduct = (id: string, data: any) => (adminApi as any).products.updateProduct(id, data);
  (adminApi as any).deleteProduct = (id: string) => (adminApi as any).products.deleteProduct(id);
  (adminApi as any).uploadProductImages = (formData: FormData) => (adminApi as any).products.uploadImages(formData);

  // Orders
  (adminApi as any).getOrders = (params?: any) => (adminApi as any).orders.getOrders(params);
  (adminApi as any).updateOrderStatus = (id: string, status: string, notes?: string) => (adminApi as any).orders.updateOrderStatus(id, status, notes);

  // Users
  (adminApi as any).getUsers = (params?: any) => (adminApi as any).users.getUsers(params);
  (adminApi as any).getUser = (id: string) => (adminApi as any).users.getUser(id);
  (adminApi as any).getUserActivity = (id: string, params?: any) => (adminApi as any).users.getUserActivity(id, params);
  (adminApi as any).updateUserRole = (id: string, role: string) => (adminApi as any).users.updateUserRole(id, role);
  (adminApi as any).updateUserStatus = (id: string, isActive: boolean) => (adminApi as any).users.updateUserStatus(id, isActive);
  (adminApi as any).deleteUser = (id: string) => (adminApi as any).users.deleteUser(id);

  // Settings
  (adminApi as any).getSettings = () => (adminApi as any).settings.getSettings();
  (adminApi as any).updateStoreSettings = (data: any) =>
    (adminApi as any).settings.updateStoreSettings(data);

  (adminApi as any).updatePaymentSettings = (data: any) =>
    (adminApi as any).settings.updatePaymentSettings(data);

  (adminApi as any).updateShippingSettings = (data: any) =>
    (adminApi as any).settings.updateShippingSettings(data);

  (adminApi as any).updateSocialSettings = (data: any) =>
    (adminApi as any).settings.updateSocialSettings(data);

  (adminApi as any).updateSEOSettings = (data: any) =>
    (adminApi as any).settings.updateSEOSettings(data);

  (adminApi as any).updateContactSettings = (data: any) =>
    (adminApi as any).settings.updateContactSettings(data);

  // Dashboard
  (adminApi as any).getDashboardStats = (period?: string) => (adminApi as any).dashboard.getStats(period);
  (adminApi as any).getRecentOrders = (limit?: number) => (adminApi as any).dashboard.getRecentOrders(limit);
  (adminApi as any).getRevenueData = (period?: string) => (adminApi as any).dashboard.getRevenueData(period);
  (adminApi as any).getEnquiries = (params?: any) => (adminApi as any).enquiries.getEnquiries(params);
  (adminApi as any).updateEnquiry = (id: string, data: any) => (adminApi as any).enquiries.updateEnquiry(id, data);
  (adminApi as any).getVisitors = (params?: any) => (adminApi as any).visitors.getVisitors(params);
  (adminApi as any).getVisitorAnalytics = (params?: any) => (adminApi as any).visitors.getAnalytics(params);
  (adminApi as any).getBills = (params?: any) => (adminApi as any).bills.getBills(params);
  (adminApi as any).getBill = (id: string) => (adminApi as any).bills.getBill(id);

  // ============================================================
  // Default export
  // ============================================================
  export default adminApi;
