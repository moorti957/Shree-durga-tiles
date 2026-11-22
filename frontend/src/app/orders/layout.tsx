import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Your Orders | Shree Durga Tiles',
  description: 'View order information from Shree Durga Tiles.',
  path: '/orders',
  noIndex: true,
});

export default function OrdersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
