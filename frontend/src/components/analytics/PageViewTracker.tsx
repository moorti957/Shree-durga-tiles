'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/services/visitorAnalytics';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) void trackPageView(pathname);
  }, [pathname]);

  return null;
}
