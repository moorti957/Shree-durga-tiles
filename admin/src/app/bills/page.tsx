'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, RefreshCw } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { formatDate, formatPrice } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

type BillRecord = {
  _id: string;
  billNo?: string;
  billDate: string;
  customerName: string;
  customerPhone?: string;
  grandTotal: number | { $numberDecimal: string };
  status: 'draft' | 'final' | 'cancelled';
};

const moneyValue = (value: BillRecord['grandTotal']) =>
  Number(typeof value === 'object' ? value.$numberDecimal : value);

export default function BillsPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['admin', 'bills', page],
    queryFn: () => adminApi.getBills({ page, limit: 20 }),
  });
  const bills: BillRecord[] = query.data?.data || [];
  const totalPages = query.data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-admin-text">Bills</h1>
          <p className="mt-1 text-sm text-admin-muted">Review issued and draft GST bills.</p>
        </div>
        <button type="button" onClick={() => query.refetch()} className="inline-flex items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm text-admin-muted hover:bg-admin-hover">
          <RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {query.error && <p role="alert" className="text-sm text-red-600">Bills could not be loaded.</p>}

      <GlassCard variant="default" padding="none" className="overflow-hidden">
        {query.isLoading ? <p className="p-6 text-sm text-admin-muted">Loading bills…</p> : bills.length === 0 ? (
          <div className="p-10 text-center text-sm text-admin-muted">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
            No bills recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-hover text-xs uppercase text-admin-muted">
                <tr><th className="px-4 py-3">Bill</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill._id} className="border-t border-admin-border">
                    <td className="px-4 py-3 font-medium text-admin-text">{bill.billNo || 'Draft'}</td>
                    <td className="px-4 py-3">
                      <p className="text-admin-text">{bill.customerName}</p>
                      {bill.customerPhone && <p className="mt-0.5 text-xs text-admin-muted">{bill.customerPhone}</p>}
                    </td>
                    <td className="px-4 py-3 text-admin-muted">{formatDate(bill.billDate)}</td>
                    <td className="px-4 py-3 font-medium text-admin-text">{formatPrice(moneyValue(bill.grandTotal))}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-admin-hover px-2.5 py-1 text-xs capitalize text-admin-text">{bill.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <div className="flex items-center justify-between text-sm text-admin-muted">
        <span>{query.data?.total ?? 0} bills</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-admin-border px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-admin-border px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      </div>

      <p className="text-xs text-admin-muted">Bill creation, payment recording and PDF/QR actions are implemented with the billing workflow phase.</p>
    </div>
  );
}
