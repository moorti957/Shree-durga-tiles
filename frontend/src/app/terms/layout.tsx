import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Website Terms | Shree Durga Tiles',
  description: 'Read the terms for using the Shree Durga Tiles website and its product information and quote services.',
  path: '/terms',
});

export default function TermsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/terms', 'Terms')} />{children}</>;
}
