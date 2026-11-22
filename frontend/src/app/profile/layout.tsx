import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Your Profile | Shree Durga Tiles',
  description: 'Manage your Shree Durga Tiles account profile.',
  path: '/profile',
  noIndex: true,
});

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
