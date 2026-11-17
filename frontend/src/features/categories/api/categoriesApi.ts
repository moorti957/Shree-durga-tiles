import { apiClient } from '@/services/apiClient';
import type {
  Category,
  CategoryFilters,
  CategoryListResponse,
} from '@/features/categories/types/category.types';
import {
  normalizePublicProduct,
  type PublicCategoryPayload,
  type PublicProductPayload,
} from '@/features/products/api/productsApi';
import type { Product } from '@/features/products/types/product.types';

interface PublicCategoryResponse extends PublicCategoryPayload {
  description?: string;
  image?: string;
  sortOrder?: number;
  products?: PublicProductPayload[];
}

const normalizeCategory = (category: PublicCategoryResponse): Category => ({
  ...category,
  id: category?.id || category?._id || '',
  slug: category?.slug || '',
  name: category?.name || '',
  description: category?.description || '',
  image: category?.image || '',
  productCount: category?.productCount ?? 0,
  isFeatured: Boolean(category?.showInHeroStrip),
  isActive: true,
});

const fetchPublicCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<{ data: PublicCategoryResponse[] }>('/public/categories');
  return (response.data.data || []).map(normalizeCategory);
};

const fetchCategoryProducts = async (
  slug: string,
  page = 1,
  limit = 12
): Promise<{ products: Product[]; total: number }> => {
  const response = await apiClient.get<{
    data: PublicCategoryResponse;
    meta?: { total?: number };
  }>(
    `/public/categories/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`
  );
  const category = response.data.data;
  return {
    products: (category.products || []).map(normalizePublicProduct),
    total: response.data.meta?.total ?? category.productCount ?? 0,
  };
};

export const categoriesApi = {
  getCategories: async (filters: CategoryFilters = {}): Promise<CategoryListResponse> => {
    let categories = await fetchPublicCategories();
    if (filters.search) {
      const search = filters.search.trim().toLowerCase();
      categories = categories.filter((category) => category.name.toLowerCase().includes(search));
    }
    if (filters.isFeatured !== undefined) {
      categories = categories.filter((category) => category.isFeatured === filters.isFeatured);
    }
    const total = categories.length;
    const page = filters.page || 1;
    const limit = filters.limit || Math.max(total, 1);
    const start = (page - 1) * limit;
    return {
      categories: categories.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / Math.max(limit, 1)),
    };
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const category = (await fetchPublicCategories()).find((item) => item.id === id);
    if (!category) throw new Error('Category not found.');
    return category;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<{ data: PublicCategoryResponse }>(
      `/public/categories/${encodeURIComponent(slug)}`
    );
    return normalizeCategory(response.data.data);
  },

  getFeaturedCategories: async (limit = 6): Promise<Category[]> => {
    const categories = await fetchPublicCategories();
    return categories.filter((category) => category.isFeatured).slice(0, limit);
  },

  getCategoryTree: async (): Promise<Category[]> => fetchPublicCategories(),

  getCategoryProductsById: async (
    id: string,
    page = 1,
    limit = 12
  ): Promise<{ products: Product[]; total: number }> => {
    const category = await categoriesApi.getCategoryById(id);
    return fetchCategoryProducts(category.slug, page, limit);
  },

  getCategoryProductsBySlug: async (
    slug: string,
    page = 1,
    limit = 12
  ): Promise<{ products: Product[]; total: number }> =>
    fetchCategoryProducts(slug, page, limit),
};

export default categoriesApi;
