import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Privacy Policy | Shree Durga Tiles',
  description: 'Learn how Shree Durga Tiles handles information submitted through its website and quote forms.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/privacy-policy', 'Privacy Policy')} />{children}</>;
}
