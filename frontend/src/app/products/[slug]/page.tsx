import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { JsonLd, getBreadcrumbSchema, SITE_URL } from '@/lib/seo';
import { productsApi } from '@/features/products/api/productsApi';
import type { Product } from '@/features/products/types/product.types';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: Product | undefined;

  try {
    product = await productsApi.getBySlug(slug);
  } catch (error) {
    console.error(`Unable to pre-render product ${slug}:`, error);
  }

  const productSchema = product && product.price > 0 && product.images?.[0]
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images[0],
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/products/${slug}`,
          priceCurrency: 'INR',
          price: product.price,
        },
      }
    : null;

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(`/products/${slug}`, product?.name || 'Product')} />
      {productSchema && <JsonLd data={productSchema} />}
      <ProductDetailClient slug={slug} initialProduct={product} />
    </>
  );
}
