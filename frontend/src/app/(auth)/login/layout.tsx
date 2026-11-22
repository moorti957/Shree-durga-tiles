import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Sign In | Shree Durga Tiles',
  description: 'Sign in to your Shree Durga Tiles account.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
