import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Marble & Tiles Gallery | Shree Durga Tiles Alwar',
  description: 'See marble, granite, tile and stone selections for homes and projects from Shree Durga Tiles in Naugaon, Alwar.',
  path: '/gallery',
});

export default function GalleryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/gallery', 'Gallery')} />{children}</>;
}
