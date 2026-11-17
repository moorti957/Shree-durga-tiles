'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Monitor, RefreshCw, Smartphone, Tablet } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

type Visitor = {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  device: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
  enquiryId?: string;
};

const startOfRange = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
};

const deviceIcon = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
};

export default function VisitorsPage() {
  const [from, setFrom] = useState(startOfRange);
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const params = { from, to };

  const analytics = useQuery({
    queryKey: ['admin', 'visitor-analytics', from, to],
    queryFn: () => adminApi.getVisitorAnalytics(params),
  });
  const visitorsQuery = useQuery({
    queryKey: ['admin', 'visitors', from, to],
    queryFn: () => adminApi.getVisitors({ ...params, page: 1, limit: 50 }),
  });

  const visitors: Visitor[] = visitorsQuery.data?.data || [];
  const analyticsData = analytics.data;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-admin-text">Visitors & Analytics</h1>
          <p className="mt-1 text-sm text-admin-muted">Privacy-conscious traffic and engagement summaries.</p>
        </div>
        <button
          type="button"
          onClick={() => { void analytics.refetch(); void visitorsQuery.refetch(); }}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-admin-border px-3 py-2 text-sm text-admin-muted hover:bg-admin-hover"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-admin-muted">From
          <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="mt-1 block rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text" />
        </label>
        <label className="text-xs font-medium text-admin-muted">To
          <input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="mt-1 block rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text" />
        </label>
      </div>

      {analytics.error && <p role="alert" className="text-sm text-red-600">Analytics could not be loaded.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-admin-muted">Visitors in range</p>
          <p className="mt-2 text-3xl font-semibold text-admin-text">{analyticsData?.visitors ?? '—'}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-admin-muted">Page views in range</p>
          <p className="mt-2 text-3xl font-semibold text-admin-text">{analyticsData?.pageViews ?? '—'}</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="mb-4 text-base font-semibold text-admin-text">Popular pages</h2>
        {analytics.isLoading ? <p className="text-sm text-admin-muted">Loading analytics…</p> : (
          <div className="space-y-3">
            {(analyticsData?.popularPaths || []).map((item: { path: string; views: number; visitors: number }) => (
              <div key={item.path} className="flex items-center justify-between gap-4 border-b border-admin-border pb-3 last:border-0 last:pb-0">
                <span className="truncate text-sm text-admin-text">{item.path}</span>
                <span className="shrink-0 text-xs text-admin-muted">{item.views} views · {item.visitors} visitors</span>
              </div>
            ))}
            {!analyticsData?.popularPaths?.length && <p className="text-sm text-admin-muted">No page views for this range.</p>}
          </div>
        )}
      </GlassCard>

      <GlassCard variant="default" padding="none" className="overflow-hidden">
        <div className="border-b border-admin-border p-4">
          <h2 className="text-base font-semibold text-admin-text">Recent visitors</h2>
        </div>
        {visitorsQuery.isLoading ? <p className="p-5 text-sm text-admin-muted">Loading visitors…</p> : visitorsQuery.error ? (
          <p role="alert" className="p-5 text-sm text-red-600">Visitors could not be loaded.</p>
        ) : visitors.length === 0 ? (
          <div className="p-8 text-center text-sm text-admin-muted"><Eye className="mx-auto mb-2 h-7 w-7 opacity-40" />No visitors recorded for this range.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-hover text-xs uppercase text-admin-muted">
                <tr><th className="px-4 py-3">Device</th><th className="px-4 py-3">Referrer</th><th className="px-4 py-3">First seen</th><th className="px-4 py-3">Last seen</th><th className="px-4 py-3">Enquiry</th></tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => {
                  const Icon = deviceIcon[visitor.device] || Monitor;
                  return (
                    <tr key={visitor.visitorId} className="border-t border-admin-border">
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-2 capitalize text-admin-text"><Icon className="h-4 w-4 text-admin-muted" />{visitor.device}</span></td>
                      <td className="max-w-xs truncate px-4 py-3 text-admin-muted">{visitor.referrer || 'Direct'}</td>
                      <td className="px-4 py-3 text-admin-muted">{formatDate(visitor.firstSeenAt)}</td>
                      <td className="px-4 py-3 text-admin-muted">{formatDate(visitor.lastSeenAt)}</td>
                      <td className="px-4 py-3 text-admin-muted">{visitor.enquiryId ? 'Submitted' : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
