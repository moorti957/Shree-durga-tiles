'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, MousePointerClick } from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/services/adminApi';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'visitor-analytics', 'default'],
    queryFn: () => adminApi.getVisitorAnalytics(),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-admin-text">Analytics</h1>
          <p className="mt-1 text-sm text-admin-muted">Visitor engagement for the last 30 days.</p>
        </div>
        <Link href="/visitors" className="text-sm font-medium text-admin-primary hover:underline">Visitor details</Link>
      </header>

      {error && <p role="alert" className="text-sm text-red-600">Analytics could not be loaded.</p>}

      <section className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-admin-muted">Visitors</p>
          <p className="mt-2 text-3xl font-semibold text-admin-text">{isLoading ? '—' : data?.visitors ?? 0}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-admin-muted">Page views</p>
          <p className="mt-2 text-3xl font-semibold text-admin-text">{isLoading ? '—' : data?.pageViews ?? 0}</p>
        </GlassCard>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-admin-text"><BarChart3 className="h-4 w-4 text-admin-primary" />Devices</h2>
          <div className="space-y-3">
            {(data?.devices || []).map((item: { _id: string; visitors: number }) => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="capitalize text-admin-text">{item._id || 'Unknown'}</span>
                <span className="text-admin-muted">{item.visitors}</span>
              </div>
            ))}
            {!isLoading && !data?.devices?.length && <p className="text-sm text-admin-muted">No device data available.</p>}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-admin-text"><MousePointerClick className="h-4 w-4 text-admin-primary" />Contact actions</h2>
          <div className="space-y-3">
            {(data?.events || []).map((item: { _id: string; count: number }) => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="capitalize text-admin-text">{item._id.replace('_', ' ')}</span>
                <span className="text-admin-muted">{item.count}</span>
              </div>
            ))}
            {!isLoading && !data?.events?.length && <p className="text-sm text-admin-muted">No contact clicks recorded.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
