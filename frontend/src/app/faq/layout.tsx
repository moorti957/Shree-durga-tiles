import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Marble & Tile FAQs | Shree Durga Tiles Alwar',
  description: 'Answers about visiting our Naugaon showroom, comparing products, requesting a quote and arranging delivery from Alwar.',
  path: '/faq',
});

export default function FAQLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/faq', 'FAQs')} />{children}</>;
}
