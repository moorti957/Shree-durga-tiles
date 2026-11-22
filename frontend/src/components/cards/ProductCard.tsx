'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -6, transition: { duration: 0.25, ease: 'easeOut' } },
};

function ProductPrice({ product }: { product: Product }) {
  if (product.quoteOnly || product.price <= 0) {
    return <span className="font-semibold text-gold-dark">Price on request</span>;
  }

  const unitLabels = { sq_ft: '/ sq. ft.', box: '/ box', piece: '/ piece' };
  return (
    <span className="font-cinzel text-lg text-gold-dark">
      {formatPrice(product.price)} {product.priceUnit ? unitLabels[product.priceUnit] : ''}
    </span>
  );
}

export function ProductCard({
  product,
  viewMode = 'grid',
  className,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const categoryLabel = product.categoryName || product.material || 'Stone & tile';
  const image = product.images?.[0];
  const textureClass = `${categoryLabel} ${product.name}`.toLowerCase().includes('granite')
    ? 'tx-granite'
    : `${categoryLabel} ${product.name}`.toLowerCase().includes('tile')
      ? 'tx-tile'
      : `${categoryLabel} ${product.name}`.toLowerCase().includes('quartz')
        ? 'tx-quartz'
        : 'tx-marble';

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={cn(
        'product-card group overflow-hidden rounded-[24px] border border-stone-line bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl',
        className
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className={viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'block'}
        aria-label={`View ${product.name}`}
      >
        <div className={cn(
          'relative overflow-hidden bg-sand',
          viewMode === 'list'
            ? 'aspect-[4/3] shrink-0 sm:aspect-square sm:w-48 md:w-56'
            : 'aspect-[4/3]'
        )}>
          {image ? (
            <Image
              src={image}
              alt={`${product.name}, Shree Durga Tiles Alwar`}
              fill
              className={cn(
                'object-cover transition-transform duration-700 group-hover:scale-105',
                !imageLoaded && 'scale-105 blur-sm'
              )}
              sizes={viewMode === 'list'
                ? '(max-width: 640px) 100vw, 224px'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div aria-hidden="true" className={`absolute inset-0 ${textureClass}`} />
          )}
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-white">
              New
            </span>
          )}
        </div>

        <div className={cn('flex flex-col justify-between p-4', viewMode === 'list' && 'flex-1')}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brown-light">
              {categoryLabel}
            </p>
            <h3 className="mt-1 line-clamp-2 font-cinzel text-lg font-semibold text-brown transition-colors group-hover:text-gold-dark">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brown-light">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-gold/10 pt-3">
            <ProductPrice product={product} />
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-maroon px-4 text-sm font-semibold text-white transition group-hover:bg-maroon-dark">
              Enquire <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductCard;
