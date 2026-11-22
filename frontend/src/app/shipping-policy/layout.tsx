import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Shipping Policy | Shree Durga Tiles',
  description: 'Review delivery and shipping information for marble, granite, tile and stone orders from Shree Durga Tiles.',
  path: '/shipping-policy',
});

export default function ShippingPolicyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/shipping-policy', 'Shipping Policy')} />{children}</>;
}
