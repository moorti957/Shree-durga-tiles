import { LandingPage } from '@/components/sections/LandingPage';
import { landingPages } from '@/data/landingPages';
import { createPageMetadata } from '@/lib/seo';

const page = landingPages.find((item) => item.slug === 'marble-tiles-alwar')!;
export const metadata = createPageMetadata({ title: page.title, description: page.description, path: `/${page.slug}` });

export default function MarbleTilesAlwarPage() {
  return <LandingPage page={page} />;
}
