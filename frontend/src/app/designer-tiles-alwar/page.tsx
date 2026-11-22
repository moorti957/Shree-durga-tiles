import { LandingPage } from '@/components/sections/LandingPage';
import { landingPages } from '@/data/landingPages';
import { createPageMetadata } from '@/lib/seo';

const page = landingPages.find((item) => item.slug === 'designer-tiles-alwar')!;
export const metadata = createPageMetadata({ title: page.title, description: page.description, path: `/${page.slug}` });

export default function DesignerTilesAlwarPage() {
  return <LandingPage page={page} />;
}
