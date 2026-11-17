"use client";

import * as React from 'react';
import axios from 'axios';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status !== undefined && status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default ReactQueryProvider;
