import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Track an Order | Shree Durga Tiles',
  description: 'Contact Shree Durga Tiles in Naugaon, Alwar for help with an order or delivery update.',
  path: '/track-order',
  noIndex: true,
});

export default function TrackOrderLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
