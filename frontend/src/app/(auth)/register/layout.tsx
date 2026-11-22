import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Create Account | Shree Durga Tiles',
  description: 'Create an account to manage your Shree Durga Tiles enquiries.',
  path: '/register',
  noIndex: true,
});

export default function RegisterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
