// frontend/src/features/home/hooks/useHomeData.ts

import { useQuery, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { homeApi } from '@/features/home/api/homeApi';
import type { 
  HomeData, 
  HomeBanner, 
  FeaturedCategory, 
  FeaturedProduct,
  Testimonial,
  FAQ,
  HomeStats,
  InstagramPost,
  YouTubeVideo,
} from '@/features/home/types/home.types';

// ============================================================
// Query Keys
// ============================================================
export const homeQueryKeys = {
  all: ['home'] as const,
  data: () => [...homeQueryKeys.all, 'data'] as const,
  banners: () => [...homeQueryKeys.all, 'banners'] as const,
  categories: () => [...homeQueryKeys.all, 'categories'] as const,
  products: () => [...homeQueryKeys.all, 'products'] as const,
  testimonials: () => [...homeQueryKeys.all, 'testimonials'] as const,
  faqs: () => [...homeQueryKeys.all, 'faqs'] as const,
  stats: () => [...homeQueryKeys.all, 'stats'] as const,
  instagram: () => [...homeQueryKeys.all, 'instagram'] as const,
  youtube: () => [...homeQueryKeys.all, 'youtube'] as const,
};

// ============================================================
// Type Definitions
// ============================================================
export interface UseHomeDataOptions {
  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Stale time in milliseconds
   * @default 5 * 60 * 1000 (5 minutes)
   */
  staleTime?: number;
  /**
   * Cache time in milliseconds
   * @default 10 * 60 * 1000 (10 minutes)
   */
  gcTime?: number;
  /**
   * Refetch interval in milliseconds (for real-time updates)
   * @default undefined
   */
  refetchInterval?: number;
  /**
   * Retry attempts after a failed request
   * @default 1
   */
  retry?: number;
  /**
   * Whether to refetch on window focus
   * @default true
   */
  refetchOnWindowFocus?: boolean;
  /**
   * Whether to refetch on reconnect
   * @default true
   */
  refetchOnReconnect?: boolean;
}

export type UseHomeDataReturn = Omit<UseQueryResult<HomeData, Error>, 'isLoading'> & {
  /**
   * Whether the initial data is loading, or a background refetch is in-flight
   * (widened from the base query's discriminated `isLoading` so it can reflect
   * `isLoading || isFetching`)
   */
  isLoading: boolean;
  /**
   * Alias for data
   */
  homeData: HomeData | undefined;
  /**
   * Featured products
   */
  featuredProducts: FeaturedProduct[] | undefined;
  /**
   * Categories
   */
  categories: FeaturedCategory[] | undefined;
  /**
   * Testimonials
   */
  testimonials: Testimonial[] | undefined;
  /**
   * FAQs
   */
  faqs: FAQ[] | undefined;
  /**
   * Stats
   */
  stats: HomeStats | undefined;
  /**
   * Instagram posts
   */
  instagramPosts: InstagramPost[] | undefined;
  /**
   * YouTube videos
   */
  youtubeVideos: YouTubeVideo[] | undefined;
  /**
   * Banners
   */
  banners: HomeBanner[] | undefined;
  /**
   * Whether the home data is loading
   */
  isLoadingHome: boolean;
};

// ============================================================
// useHomeData Hook
// ============================================================
/**
 * Custom hook to fetch all homepage data using React Query.
 * 
 * @example
 * ```tsx
 * const { homeData, featuredProducts, isLoadingHome } = useHomeData();
 * 
 * if (isLoadingHome) return <HomeSkeleton />;
 * if (error) return <ErrorState />;
 * 
 * return (
 *   <div>
 *     <Hero banners={homeData?.banners} />
 *     <FeaturedProducts products={featuredProducts} />
 *   </div>
 * );
 * ```
 */
export function useHomeData(options: UseHomeDataOptions = {}): UseHomeDataReturn {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
    refetchInterval,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    retry = 1,
  } = options;

  // Fetch home data
  const query = useQuery<HomeData, Error>({
    queryKey: homeQueryKeys.data(),
    queryFn: async () => {
      const data = await homeApi.getHomeData();
      return data;
    },
    enabled,
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnReconnect,
    retry,
  });

  // Destructure data with defaults
  const data = query.data;
  const isLoading = query.isLoading;
  const isFetching = query.isFetching;
  return {
    ...query,
    // Main data
    homeData: data,
    // Featured products
    featuredProducts: data?.featuredProducts,
    // Categories
    categories: data?.categories,
    // Testimonials
    testimonials: data?.testimonials,
    // FAQs
    faqs: data?.faqs,
    // Stats
    stats: data?.stats,
    // Instagram posts
    instagramPosts: data?.instagramPosts,
    // YouTube videos
    youtubeVideos: data?.youtubeVideos,
    // Banners
    banners: data?.banners,
    // Loading state (only initial loading)
    isLoadingHome: isLoading,
    // Alias for backward compatibility
    isLoading: isLoading || isFetching,
  };
}

// ============================================================
// Individual data hooks (for more granular fetching)
// ============================================================

/**
 * Fetch only the home banners
 */
export function useHomeBanners(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.banners(),
    queryFn: homeApi.getBanners,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch only the featured categories
 */
export function useHomeCategories(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.categories(),
    queryFn: homeApi.getCategories,
    staleTime: 10 * 60 * 1000, // Categories don't change often
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch only the featured products
 */
export function useHomeProducts(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.products(),
    queryFn: homeApi.getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch only the testimonials
 */
export function useHomeTestimonials(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.testimonials(),
    queryFn: homeApi.getTestimonials,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch only the FAQs
 */
export function useHomeFAQs(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.faqs(),
    queryFn: homeApi.getFAQs,
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch only the statistics
 */
export function useHomeStats(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.stats(),
    queryFn: homeApi.getStats,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch only Instagram posts
 */
export function useHomeInstagram(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.instagram(),
    queryFn: homeApi.getInstagramPosts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch only YouTube videos
 */
export function useHomeYouTube(options: Omit<UseHomeDataOptions, 'staleTime'> = {}) {
  return useQuery({
    queryKey: homeQueryKeys.youtube(),
    queryFn: homeApi.getYouTubeVideos,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

// ============================================================
// Prefetch function for server-side usage
// ============================================================
/**
 * Prefetch home data for server-side rendering
 * 
 * @example
 * ```tsx
 * // In a server component or getServerSideProps
 * const queryClient = new QueryClient();
 * await prefetchHomeData(queryClient);
 * ```
 */
export async function prefetchHomeData(
  queryClient: QueryClient
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: homeQueryKeys.data(),
    queryFn: homeApi.getHomeData,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch individual home data sections
 */
export async function prefetchHomeSection(
  queryClient: QueryClient,
  section: 'banners' | 'categories' | 'products' | 'testimonials' | 'faqs' | 'stats' | 'instagram' | 'youtube'
): Promise<void> {
  const prefetchSection = {
    banners: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.banners(),
      queryFn: homeApi.getBanners,
      staleTime: 5 * 60 * 1000,
    }),
    categories: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.categories(),
      queryFn: homeApi.getCategories,
      staleTime: 5 * 60 * 1000,
    }),
    products: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.products(),
      queryFn: homeApi.getFeaturedProducts,
      staleTime: 5 * 60 * 1000,
    }),
    testimonials: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.testimonials(),
      queryFn: homeApi.getTestimonials,
      staleTime: 5 * 60 * 1000,
    }),
    faqs: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.faqs(),
      queryFn: homeApi.getFAQs,
      staleTime: 5 * 60 * 1000,
    }),
    stats: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.stats(),
      queryFn: homeApi.getStats,
      staleTime: 5 * 60 * 1000,
    }),
    instagram: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.instagram(),
      queryFn: homeApi.getInstagramPosts,
      staleTime: 5 * 60 * 1000,
    }),
    youtube: () => queryClient.prefetchQuery({
      queryKey: homeQueryKeys.youtube(),
      queryFn: homeApi.getYouTubeVideos,
      staleTime: 5 * 60 * 1000,
    }),
  };

  await prefetchSection[section]();
}

// ============================================================
// Utility functions for home data
// ============================================================

/**
 * Check if home data is stale (needs refresh)
 */
export function isHomeDataStale(lastUpdated: Date | string, maxAgeMinutes: number = 5): boolean {
  const updated = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const now = new Date();
  const diffMinutes = (now.getTime() - updated.getTime()) / (1000 * 60);
  return diffMinutes > maxAgeMinutes;
}

/**
 * Get home data cache size (for monitoring)
 */
export function getHomeDataCacheSize(queryClient: QueryClient): number {
  const query = queryClient.getQueryData(homeQueryKeys.data());
  if (!query) return 0;
  return new Blob([JSON.stringify(query)]).size;
}

// ============================================================
// Default export
// ============================================================
export default useHomeData;