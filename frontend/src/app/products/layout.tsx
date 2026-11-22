import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Marble, Granite & Tiles Catalogue | Alwar',
  description: 'Browse marble, granite, designer tiles, quartz and stone from Shree Durga Tiles in Naugaon, Alwar.',
  path: '/products',
});

export default function ProductsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/products', 'Products')} />{children}</>;
}
