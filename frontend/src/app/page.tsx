import type { Metadata } from 'next';
import HomePageClient from '@/components/home/HomePageClient';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Marble & Tiles Shop in Alwar | Shree Durga Tiles, Naugaon',
    description: 'Shree Durga Tiles (श्री दुर्गा टाइल्स), Naugaon, Alwar: marble, granite, designer tiles and mandir stone. Visit our showroom or WhatsApp for a free quote.',
    path: '/',
  }),
};

export default function HomePage() {
  return <HomePageClient />;
}
