import type { MetadataRoute } from 'next';
import { blogDrafts } from '@/data/blogDrafts';
import { landingPages } from '@/data/landingPages';
import { SITE_URL } from '@/lib/seo';

const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/products',
  '/categories',
  '/gallery',
  '/blogs',
  '/faq',
  '/privacy-policy',
  '/shipping-policy',
  '/refund-policy',
  '/terms',
  ...landingPages.map((page) => `/${page.slug}`),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const updatedAt = new Date();
  const entries: MetadataRoute.Sitemap = publicPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: updatedAt,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path.startsWith('/marble-') || path.startsWith('/granite-') ? 0.85 : 0.7,
  }));
  const draftSlugs = new Set(blogDrafts.map((post) => post.slug));

  entries.push(...blogDrafts.map((post) => ({
    url: `${SITE_URL}/blogs/${post.slug}`,
    ...(post.publishedAt ? { lastModified: new Date(post.publishedAt) } : {}),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  })));

  try {
    const { blogApi } = await import('@/services/blogApi');
    const posts = await blogApi.getAll();
    entries.push(...posts
      .filter((post) => !draftSlugs.has(post.slug))
      .map((post) => ({
        url: `${SITE_URL}/blogs/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.65,
      })));
  } catch (error) {
    console.error('Unable to include live blog posts in the sitemap:', error);
  }

  try {
    const { productsApi } = await import('@/features/products/api/productsApi');
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const result = await productsApi.getAll({ page, limit: 100 });
      totalPages = result.totalPages;
      entries.push(...result.products.filter((product) => product.slug).map((product) => ({
        url: `${SITE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })));
      page += 1;
    }
  } catch (error) {
    console.error('Unable to include live products in the sitemap:', error);
  }

  return entries;
}
