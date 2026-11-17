import { apiClient } from '@/services/apiClient';
import {
  normalizePublicProduct,
  type PublicCategoryPayload,
  type PublicProductPayload,
} from '@/features/products/api/productsApi';
import type {
  HomeData,
  HomeBanner,
  FeaturedCategory,
  FeaturedProduct,
  Testimonial,
  FAQ,
  HomeStats,
} from '@/features/home/types/home.types';

interface PublicBannerPayload {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  sortOrder?: number;
}

interface PublicTestimonialPayload {
  id: string;
  name: string;
  avatar?: string;
  text?: string;
  city?: string;
}

interface PublicStats {
  happyCustomers?: number;
  projectsSupplied?: number;
  yearsExperience?: number;
}

interface PublicHomePayload {
  settings?: { stats?: PublicStats };
  heroImages?: PublicBannerPayload[];
  categories?: PublicCategoryPayload[];
  featuredProducts?: PublicProductPayload[];
  latestProducts?: PublicProductPayload[];
  testimonials?: PublicTestimonialPayload[];
  faqs?: FAQ[];
}

const fetchData = async <T>(path: string): Promise<T> => {
  const response = await apiClient.get<{ data: T }>(path);
  return response.data.data;
};

const mapBanner = (banner: PublicBannerPayload): HomeBanner => ({
  id: banner.id,
  title: banner.title,
  subtitle: banner.subtitle,
  imageUrl: banner.image || '',
  displayOrder: banner.sortOrder,
});

const mapCategory = (category: PublicCategoryPayload): FeaturedCategory => ({
  id: category.id || category._id || '',
  _id: category.id || category._id,
  name: category.name || '',
  slug: category.slug || '',
  image: category.image,
  productCount: category.productCount,
});

const mapProduct = (product: PublicProductPayload): FeaturedProduct => {
  const normalized = normalizePublicProduct(product);
  return {
    ...normalized,
    price: normalized.price,
    originalPrice: product.originalPrice,
    images: normalized.images,
  };
};

const mapTestimonial = (testimonial: PublicTestimonialPayload): Testimonial => ({
  id: testimonial.id,
  name: testimonial.name,
  avatar: testimonial.avatar,
  rating: 5,
  comment: testimonial.text || '',
  location: testimonial.city || '',
});

const mapStats = (stats: PublicStats | undefined, categories: FeaturedCategory[]): HomeStats => ({
  totalCustomers: stats?.happyCustomers,
  totalProducts: categories.reduce((total, category) => total + (category.productCount || 0), 0),
  projectsSupplied: stats?.projectsSupplied,
  yearsOfExperience: stats?.yearsExperience,
});

export const homeApi = {
  getHomeData: async (): Promise<HomeData> => {
    const home = await fetchData<PublicHomePayload>('/public/home');
    const categories = (home.categories || []).map(mapCategory);
    return {
      banners: (home.heroImages || []).map(mapBanner),
      featuredProducts: (home.featuredProducts || []).map(mapProduct),
      trendingProducts: [],
      latestProducts: (home.latestProducts || []).map(mapProduct),
      categories,
      testimonials: (home.testimonials || []).map(mapTestimonial),
      faqs: home.faqs || [],
      stats: mapStats(home.settings?.stats, categories),
      instagramPosts: [],
      youtubeVideos: [],
    };
  },

  getBanners: async (): Promise<HomeBanner[]> =>
    (await fetchData<PublicBannerPayload[]>('/public/hero-images')).map(mapBanner),

  getCategories: async (): Promise<FeaturedCategory[]> =>
    (await fetchData<PublicCategoryPayload[]>('/public/categories')).map(mapCategory),

  getFeaturedProducts: async (): Promise<FeaturedProduct[]> => {
    const response = await apiClient.get<{ data: PublicProductPayload[] }>(
      '/public/products?featured=true&limit=8'
    );
    return (response.data.data || []).map(mapProduct);
  },

  getTestimonials: async (): Promise<Testimonial[]> =>
    (await fetchData<PublicTestimonialPayload[]>('/public/testimonials')).map(mapTestimonial),

  getFAQs: async (): Promise<FAQ[]> => fetchData('/public/faqs'),

  getStats: async (): Promise<HomeStats> => {
    const [stats, categories] = await Promise.all([
      fetchData<PublicStats>('/public/stats'),
      fetchData<PublicCategoryPayload[]>('/public/categories'),
    ]);
    return mapStats(stats, categories.map(mapCategory));
  },

  getInstagramPosts: async () => [],

  getYouTubeVideos: async () => [],
};

export default homeApi;
