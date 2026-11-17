'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, MessageSquare, Phone, X } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Enquiry = {
  _id: string;
  name: string;
  phone: string;
  need: string;
  message?: string;
  source: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  adminNote?: string;
  createdAt: string;
};

const statuses = ['new', 'contacted', 'converted', 'closed'] as const;

export default function EnquiriesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [note, setNote] = useState('');

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['admin', 'enquiries', page, status, query],
    queryFn: () => adminApi.getEnquiries({
      page,
      limit: 20,
      status: status === 'all' ? undefined : status,
      search: query || undefined,
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (update: { id: string; status: Enquiry['status']; adminNote: string }) =>
      adminApi.updateEnquiry(update.id, { status: update.status, adminNote: update.adminNote }),
    onSuccess: () => {
      toast.success('Enquiry updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] });
      setSelected(null);
    },
    onError: (updateError: unknown) => {
      toast.error(updateError instanceof Error ? updateError.message : 'Could not update enquiry');
    },
  });

  const enquiries = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-admin-text">Enquiries</h1>
          <p className="mt-1 text-sm text-admin-muted">Follow up on customer product and project requests.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-admin-border px-3 py-2 text-sm text-admin-muted hover:bg-admin-hover"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search name or phone"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text"
          aria-label="Filter by enquiry status"
        >
          <option value="all">All statuses</option>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <GlassCard variant="default" padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-12 animate-pulse rounded bg-admin-hover" />)}</div>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">Enquiries could not be loaded. Please retry.</p>
        ) : enquiries.length === 0 ? (
          <div className="p-10 text-center text-sm text-admin-muted">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
            No enquiries match these filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-hover text-xs uppercase text-admin-muted">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Need</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((item: Enquiry) => (
                  <tr key={item._id} className="border-t border-admin-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-admin-text">{item.name}</p>
                      <a href={`tel:${item.phone}`} className="mt-1 inline-flex items-center gap-1 text-xs text-admin-muted hover:text-admin-primary">
                        <Phone className="h-3 w-3" />{item.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-admin-muted">{item.need}</td>
                    <td className="px-4 py-3 text-admin-muted">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-admin-hover px-2.5 py-1 text-xs capitalize text-admin-text">{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => { setSelected(item); setNote(item.adminNote || ''); }}
                        className="rounded-lg border border-admin-border px-3 py-1.5 text-xs text-admin-text hover:bg-admin-hover"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <div className="flex items-center justify-between text-sm text-admin-muted">
        <span>{data?.total ?? 0} enquiries</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-admin-border px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-admin-border px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="enquiry-title" className="w-full max-w-xl rounded-2xl border border-admin-border bg-admin-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="enquiry-title" className="text-lg font-semibold text-admin-text">{selected.name}</h2>
                <p className="mt-1 text-sm text-admin-muted">{selected.phone} · {selected.need}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close enquiry" className="rounded-lg p-2 text-admin-muted hover:bg-admin-hover"><X className="h-4 w-4" /></button>
            </div>
            {selected.message && <p className="mt-5 whitespace-pre-wrap rounded-xl bg-admin-hover p-4 text-sm text-admin-text">{selected.message}</p>}
            <p className="mt-4 text-xs text-admin-muted">Source: {selected.source} · {formatDate(selected.createdAt)}</p>
            <label className="mt-5 block text-sm font-medium text-admin-text">
              Status
              <select
                value={selected.status}
                onChange={(event) => setSelected({ ...selected, status: event.target.value as Enquiry['status'] })}
                className="mt-1 w-full rounded-lg border border-admin-border bg-admin-card px-3 py-2"
              >
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="mt-4 block text-sm font-medium text-admin-text">
              Internal note
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1" maxLength={5000} />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-admin-border px-4 py-2 text-sm text-admin-text">Cancel</button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ id: selected._id, status: selected.status, adminNote: note })}
                className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save update'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
