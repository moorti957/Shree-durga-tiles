import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Shopping Cart | Shree Durga Tiles',
  description: 'Review selected products from Shree Durga Tiles.',
  path: '/cart',
  noIndex: true,
});

export default function CartLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
