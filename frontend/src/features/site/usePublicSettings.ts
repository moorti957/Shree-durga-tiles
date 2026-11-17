'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicSettings } from '@/services/publicSiteApi';

export const usePublicSettings = () =>
  useQuery({
    queryKey: ['public', 'settings'],
    queryFn: getPublicSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
