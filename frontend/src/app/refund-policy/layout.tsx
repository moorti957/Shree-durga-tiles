import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Refund Policy | Shree Durga Tiles',
  description: 'Review the refund and cancellation information published by Shree Durga Tiles.',
  path: '/refund-policy',
});

export default function RefundPolicyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/refund-policy', 'Refund Policy')} />{children}</>;
}
