import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Marble & Tile Guides | Shree Durga Tiles Alwar',
  description: 'Read practical Hindi and English guides on marble, bathroom tiles and choosing stone from Shree Durga Tiles, Alwar.',
  path: '/blogs',
});

export default function BlogsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/blogs', 'Blog')} />{children}</>;
}
