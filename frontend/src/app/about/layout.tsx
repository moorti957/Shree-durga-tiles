import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'About Shree Durga Tiles | Naugaon, Alwar',
  description: 'Meet Shree Durga Tiles, a Naugaon showroom for marble, granite, designer tiles and natural stone serving Alwar and nearby areas.',
  path: '/about',
});

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/about', 'About')} />{children}</>;
}
