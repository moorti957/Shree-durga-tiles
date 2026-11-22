import { LandingPage } from '@/components/sections/LandingPage';
import { landingPages } from '@/data/landingPages';
import { createPageMetadata } from '@/lib/seo';

const page = landingPages.find((item) => item.slug === 'tiles-shop-naugaon')!;
export const metadata = createPageMetadata({ title: page.title, description: page.description, path: `/${page.slug}` });

export default function TilesShopNaugaonPage() {
  return <LandingPage page={page} />;
}
