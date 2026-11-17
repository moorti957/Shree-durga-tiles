'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Eye, FileText, FolderTree, MessageSquare, Package, Users } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

const cards = [
  { key: 'products', label: 'Catalogue products', icon: Package, href: '/products' },
  { key: 'categories', label: 'Visible categories', icon: FolderTree, href: '/categories' },
  { key: 'newEnquiries', label: 'New enquiries', icon: MessageSquare, href: '/enquiries' },
  { key: 'visitorsToday', label: 'Visitors today', icon: Users, href: '/visitors' },
  { key: 'pageViewsToday', label: 'Page views today', icon: Eye, href: '/visitors' },
  { key: 'bills', label: 'Bills recorded', icon: FileText, href: '/bills' },
] as const;

type Enquiry = {
  _id: string;
  name: string;
  phone: string;
  need: string;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
  });
  const enquiriesQuery = useQuery({
    queryKey: ['admin', 'enquiries', 'recent'],
    queryFn: () => adminApi.getEnquiries({ page: 1, limit: 6 }),
  });

  const stats = statsQuery.data;
  const recentEnquiries: Enquiry[] = enquiriesQuery.data?.data || stats?.recentEnquiries || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-cinzel text-2xl font-bold text-admin-text">Dashboard</h1>
        <p className="mt-1 text-sm text-admin-muted">Shree Durga Tiles catalogue, enquiries and visitor activity.</p>
      </header>

      {statsQuery.error && <p role="alert" className="text-sm text-red-600">Dashboard data could not be loaded.</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} href={href} className="group">
            <GlassCard className="h-full transition-colors group-hover:border-admin-primary/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-admin-muted">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-admin-text">
                    {statsQuery.isLoading ? '—' : Number(stats?.[key] || 0).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-xl bg-admin-hover p-3 text-admin-primary"><Icon className="h-5 w-5" /></span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-admin-muted group-hover:text-admin-primary">Open <ArrowRight className="h-3 w-3" /></span>
            </GlassCard>
          </Link>
        ))}
      </section>

      <GlassCard variant="default" padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-admin-border p-4">
          <div>
            <h2 className="font-semibold text-admin-text">Recent enquiries</h2>
            <p className="mt-1 text-xs text-admin-muted">Customer requests needing follow-up.</p>
          </div>
          <Link href="/enquiries" className="text-sm font-medium text-admin-primary hover:underline">View all</Link>
        </div>
        {enquiriesQuery.isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded bg-admin-hover" />)}</div>
        ) : enquiriesQuery.error ? (
          <p role="alert" className="p-5 text-sm text-red-600">Recent enquiries could not be loaded.</p>
        ) : recentEnquiries.length === 0 ? (
          <p className="p-8 text-center text-sm text-admin-muted">No enquiries received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-hover text-xs uppercase text-admin-muted">
                <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Need</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody>
                {recentEnquiries.map((item) => (
                  <tr key={item._id} className="border-t border-admin-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-admin-text">{item.name}</p>
                      <p className="mt-0.5 text-xs text-admin-muted">{item.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-admin-muted">{item.need}</td>
                    <td className="px-4 py-3 text-admin-muted">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-admin-hover px-2.5 py-1 text-xs capitalize text-admin-text">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
