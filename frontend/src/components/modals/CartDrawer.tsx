// frontend/src/components/modals/CartDrawer.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';

import { useCartStore } from '@/features/cart/store/cartStore';
import { formatPrice } from '@/lib/utils';

// ============================================================
// CartDrawer Component
// ============================================================
export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
  } = useCartStore();
  const hasUnpricedItems = items.some(
    ({ product }) => product.quoteOnly || product.price <= 0,
  );

  // Subscribe to cart open/close state (if you have a global store for drawer)
  // For now we'll use a simple local state, but you can integrate with Zustand

  // Open/close methods (exposed via store or context)
  // We'll add a global cart drawer store later, but for now we'll use a simple approach
  // with a function to open the drawer from anywhere.
  // We'll also add a useEffect to listen for custom events.

  // For this implementation, we'll use a simple state and expose functions.
  // You can replace with a dedicated store.

  // Listen for custom event to open drawer
  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('openCartDrawer', handleOpenCart);
    return () => window.removeEventListener('openCartDrawer', handleOpenCart);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const subtotal = totalPrice;

  // Overlay and drawer variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-white dark:bg-brown-dark shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold/10 dark:border-gold/5 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-dark" />
                <h2 className="font-cinzel text-lg font-bold text-brown dark:text-ivory">
                  Your Cart
                </h2>
                <span className="text-xs text-brown-light dark:text-ivory/50 bg-sand/60 dark:bg-brown/60 px-2 py-0.5 rounded-full">
                  {totalItems} items
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gold/10 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-brown-light dark:text-ivory/70" />
              </button>
            </div>

            {/* Cart Items (scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-gold/40" />
                  </div>
                  <h3 className="font-cinzel text-lg text-brown dark:text-ivory">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-brown-light dark:text-ivory/50 mt-2">
                    Explore our stone and tile collections.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-gold mt-4 text-sm px-6 py-2"
                  >
                    Browse Collection
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 bg-sand/30 dark:bg-brown/30 rounded-xl p-3 border border-gold/5"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand dark:bg-brown flex-shrink-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={`${item.product.name}, Shree Durga Tiles Alwar`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium text-sm text-brown dark:text-ivory hover:text-gold-dark transition-colors line-clamp-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-brown-light dark:text-ivory/50">
                          {item.product.material || 'Handcrafted'}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-cinzel text-sm text-gold-dark dark:text-gold">
                            {item.product.quoteOnly || item.product.price <= 0
                              ? 'Price on request'
                              : formatPrice(item.product.price)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="p-0.5 rounded-full hover:bg-gold/10 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3 text-brown-light" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium text-brown dark:text-ivory">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="p-0.5 rounded-full hover:bg-gold/10 transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3 text-brown-light" />
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-1 ml-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-brown-light hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer (summary + checkout) */}
            {items.length > 0 && (
              <div className="border-t border-gold/10 dark:border-gold/5 p-4 bg-white dark:bg-brown-dark shrink-0">
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-brown-light dark:text-ivory/60">Product subtotal</span>
                    <span className="font-medium text-brown dark:text-ivory">
                      {hasUnpricedItems ? 'Price to be confirmed' : formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <p className="mb-4 border-t border-gold/10 pt-3 text-xs leading-relaxed text-brown-light dark:text-ivory/60">
                  Delivery charges and applicable taxes are confirmed with your quote.
                </p>

                <div className="flex gap-3">
                  <Link
                    href="/products"
                    className="flex-1 btn-outline-gold text-center py-2.5 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Keep browsing
                  </Link>
                  <Link
                    href="/contact"
                    className="flex-1 btn-gold text-center py-2.5 text-sm flex items-center justify-center gap-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Request a quote
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Helper: Open cart drawer from anywhere
// ============================================================
export function openCartDrawer() {
  window.dispatchEvent(new Event('openCartDrawer'));
}

// ============================================================
// Default export
// ============================================================
export { CartDrawer };