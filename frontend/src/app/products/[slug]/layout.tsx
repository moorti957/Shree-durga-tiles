import type { Metadata } from 'next';
import { productsApi } from '@/features/products/api/productsApi';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = `/products/${slug}`;

  try {
    const product = await productsApi.getBySlug(slug);
    const title = `${product.name} | Shree Durga Tiles`.slice(0, 60);
    const description = (product.description || `Ask Shree Durga Tiles in Alwar about ${product.name} and delivery.`).slice(0, 155);
    return createPageMetadata({ title, description, path });
  } catch (error) {
    console.error(`Unable to generate product metadata for ${slug}:`, error);
    const productLabel = decodeURIComponent(slug).replace(/[-_]/g, ' ');
    return createPageMetadata({
      title: `${productLabel} | Shree Durga Tiles`.slice(0, 60),
      description: `Ask Shree Durga Tiles in Alwar about ${productLabel} and delivery.`.slice(0, 155),
      path,
    });
  }
}

export default function ProductDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
