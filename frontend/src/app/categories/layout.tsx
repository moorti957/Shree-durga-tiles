import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Marble, Granite & Tile Categories | Alwar',
  description: 'Explore marble, granite, PGVT tiles, bathroom tiles and stone collections at Shree Durga Tiles, Naugaon, Alwar.',
  path: '/categories',
});

export default function CategoriesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/categories', 'Categories')} />{children}</>;
}
