'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/cards/ProductCard';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProduct } from '@/features/products/hooks/useProduct';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/lib/notifications';
import type { EnquiryNeed } from '@/services/publicSiteApi';
import type { Product } from '@/features/products/types/product.types';

const getEnquiryNeed = (product: { categoryName?: string; material?: string }): EnquiryNeed => {
  const category = `${product.categoryName || ''} ${product.material || ''}`.toLowerCase();
  if (category.includes('granite')) return 'Granite';
  if (category.includes('tile')) return 'Floor/Wall Tiles';
  if (category.includes('kitchen')) return 'Kitchen Top';
  if (category.includes('mandir') || category.includes('pooja')) return 'Mandir/Pooja Room Stone';
  if (category.includes('marble')) return 'Marble';
  return 'Other';
};

export function ProductDetailClient({ slug, initialProduct }: { slug: string; initialProduct?: Product }) {
  const { data: queriedProduct, isLoading: queryLoading, error } = useProduct(slug);
  const product = initialProduct || queriedProduct;
  const isLoading = !initialProduct && queryLoading;
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => setSelectedImage(0), [slug]);

  if (isLoading) {
    return (
      <Container className="grid gap-8 py-12 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <h1 className="font-cinzel text-2xl font-bold text-brown">Product details from Shree Durga Tiles</h1>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-cinzel text-2xl text-brown">Product not found</h1>
        <p className="mt-2 text-brown-light">This item may have been removed from the catalogue.</p>
        <Link href="/products" className="btn-gold mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Browse catalogue
        </Link>
      </Container>
    );
  }

  const images = product.images || [];
  const showImage = (index: number) => {
    if (!images.length) return;
    setSelectedImage((index + images.length) % images.length);
  };
  const shareProduct = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied', 'Share this product with your project team.');
      }
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name !== 'AbortError') {
        toast.error('Unable to share this product', 'Please copy the page link from your browser.');
      }
    }
  };

  return (
    <Container className="py-8 md:py-12">
      <nav className="mb-6 text-sm text-brown-light" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold-dark">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-gold-dark">Catalogue</Link>
        <span className="mx-2">/</span>
        <span className="text-brown" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <section>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage]}
                alt={`${product.name}, Shree Durga Tiles Alwar`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-brown-light">Image coming soon</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => showImage(selectedImage - 1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => showImage(selectedImage + 1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => showImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? 'border-gold' : 'border-transparent'
                  }`}
                >
                  <Image src={image} alt={`${product.name} tile or stone detail, Shree Durga Tiles Alwar`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
                {product.categoryName || product.material || 'Catalogue item'}
              </p>
              <h1 className="mt-2 font-cinzel text-3xl font-bold text-brown md:text-4xl">{product.name}</h1>
            </div>
            <button
              type="button"
              onClick={() => void shareProduct()}
              className="rounded-full border border-gold/20 p-3 hover:bg-gold/10"
              aria-label="Share product"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <p className="font-cinzel text-2xl text-gold-dark">
            {product.quoteOnly || product.price <= 0
              ? 'Price on request'
              : `${formatPrice(product.price)}${product.priceUnit === 'sq_ft' ? ' / sq. ft.' : product.priceUnit ? ` / ${product.priceUnit}` : ''}`}
          </p>

          {product.description && (
            <p className="leading-relaxed text-brown-light">{product.description}</p>
          )}

          {(product.material || product.marbleType || product.finish || product.quality) && (
            <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-line bg-white p-4 text-sm">
              {[
                ['Material', product.material],
                ['Stone type', product.marbleType],
                ['Finish', product.finish],
                ['Quality', product.quality],
              ].filter(([, value]) => value).map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs uppercase tracking-wide text-brown-light">{label}</dt>
                  <dd className="mt-1 font-medium text-brown">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div id="enquire" className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-cinzel text-xl font-semibold text-brown">Ask about this product</h2>
            <EnquiryForm
              compact
              source="product_enquire"
              productId={product.id}
              defaultNeed={getEnquiryNeed(product)}
            />
          </div>
        </section>
      </div>

      {product.specifications?.length ? (
        <section className="mt-12">
          <h2 className="mb-4 font-cinzel text-2xl font-semibold text-brown">Specifications</h2>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {product.specifications.map((specification) => (
              <div key={specification.key} className="flex justify-between gap-4 border-b border-stone-line py-3">
                <dt className="font-medium text-brown">{specification.key}</dt>
                <dd className="text-right text-brown-light">{specification.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {product.relatedProducts?.length ? (
        <section className="mt-14">
          <h2 className="mb-6 font-cinzel text-2xl font-semibold text-brown">Similar products</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
