import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Your Wishlist | Shree Durga Tiles',
  description: 'Review products saved in your Shree Durga Tiles wishlist.',
  path: '/wishlist',
  noIndex: true,
});

export default function WishlistLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
