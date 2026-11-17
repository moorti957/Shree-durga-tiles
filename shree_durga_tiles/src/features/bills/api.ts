import type { Bill, BillItem, Payment, Paginated } from '@/api/types';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (isRecord(value)) {
    for (const key of ['$numberDecimal', '$numberLong', '$numberInt']) {
      if (key in value) return toNumber(value[key], fallback);
    }
  }
  return fallback;
};

const toDateString = (value: unknown): string => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  return typeof value === 'string' ? value : '';
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1) return true;
  return false;
};

const mapItem = (value: unknown): BillItem | null => {
  if (!isRecord(value)) return null;
  const unit = value.unit === 'sq_ft' || value.unit === 'box' || value.unit === 'piece'
    ? value.unit
    : 'piece';
  return {
    name: firstString(value.name) ?? 'Item',
    ...(typeof value.size === 'string' ? { size: value.size } : {}),
    qty: toNumber(value.qty, 0),
    unit,
    rate: toNumber(value.rate, 0),
    amount: toNumber(value.amount, 0),
  };
};

const mapPayment = (value: unknown): Payment | null => {
  if (!isRecord(value)) return null;
  const mode = value.mode;
  if (mode !== 'upi' && mode !== 'cash' && mode !== 'bank' && mode !== 'cheque') return null;
  return {
    amount: toNumber(value.amount, 0),
    mode,
    ...(typeof value.paidAt === 'string' ? { paidAt: value.paidAt } : {}),
  };
};

const unwrapBill = (input: unknown): JsonRecord => {
  let value = input;
  for (let depth = 0; depth < 4; depth += 1) {
    if (!isRecord(value)) break;
    if (firstString(value._id, value.id)) return value;
    if (isRecord(value.bill)) {
      value = value.bill;
      continue;
    }
    if (isRecord(value.data)) {
      value = value.data;
      continue;
    }
    break;
  }
  throw new Error('Bill response does not contain a valid bill ID.');
};

export const mapBill = (input: unknown): Bill => {
  const raw = unwrapBill(input);
  const id = firstString(raw._id, raw.id);
  if (!id) throw new Error('Bill response does not contain a valid bill ID.');

  const status = raw.status === 'final' || raw.status === 'cancelled' ? raw.status : 'draft';
  const items = Array.isArray(raw.items) ? raw.items.map(mapItem).filter((item): item is BillItem => item !== null) : [];
  const payments = Array.isArray(raw.payments)
    ? raw.payments.map(mapPayment).filter((payment): payment is Payment => payment !== null)
    : [];

  return {
    _id: id,
    id,
    ...(firstString(raw.billNo) ? { billNo: firstString(raw.billNo) } : {}),
    billDate: toDateString(raw.billDate),
    customerName: firstString(raw.customerName) ?? 'Customer',
    ...(typeof raw.customerPhone === 'string' ? { customerPhone: raw.customerPhone } : {}),
    ...(typeof raw.customerAddress === 'string' ? { customerAddress: raw.customerAddress } : {}),
    isGstBill: toBoolean(raw.isGstBill),
    isCod: toBoolean(raw.isCod),
    status,
    subtotal: toNumber(raw.subtotal),
    taxableAmount: toNumber(raw.taxableAmount),
    cgst: toNumber(raw.cgst),
    sgst: toNumber(raw.sgst),
    igst: toNumber(raw.igst),
    grandTotal: toNumber(raw.grandTotal),
    deliveryCharge: toNumber(raw.deliveryCharge),
    discount: toNumber(raw.discount),
    roundOff: toNumber(raw.roundOff),
    advanceAmount: toNumber(raw.advanceAmount),
    balanceDue: toNumber(raw.balanceDue),
    ...(typeof raw.pdfUrl === 'string' ? { pdfUrl: raw.pdfUrl } : {}),
    ...(typeof raw.verificationUrl === 'string' ? { verificationUrl: raw.verificationUrl } : {}),
    ...(typeof raw.qrPayload === 'string' ? { qrPayload: raw.qrPayload } : {}),
    ...(typeof raw.amountInWords === 'string' ? { amountInWords: raw.amountInWords } : {}),
    items,
    payments,
  };
};

export const mapBillPage = (page: Paginated<unknown>): Paginated<Bill> => {
  if (!Array.isArray(page.data)) throw new Error('Bill list response does not contain a bill array.');
  return { ...page, data: page.data.map(mapBill) };
};
