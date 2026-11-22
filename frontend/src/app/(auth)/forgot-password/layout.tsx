import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Reset Password | Shree Durga Tiles',
  description: 'Reset access to your Shree Durga Tiles account.',
  path: '/forgot-password',
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
