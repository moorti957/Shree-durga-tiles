import { createPageMetadata, getBreadcrumbSchema, JsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact Shree Durga Tiles | Naugaon, Alwar',
  description: 'Call, WhatsApp or visit Shree Durga Tiles on Delhi–Alwar Road, Naugaon. Ask about marble, granite, tiles and project quotes.',
  path: '/contact',
});

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={getBreadcrumbSchema('/contact', 'Contact')} />{children}</>;
}
