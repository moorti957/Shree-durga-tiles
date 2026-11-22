import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Checkout | Shree Durga Tiles',
  description: 'Continue your Shree Durga Tiles order.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
