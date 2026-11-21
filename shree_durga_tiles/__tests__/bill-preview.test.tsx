import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import QRCode from 'react-native-qrcode-svg';
import { billsApi } from '@/api/endpoints';
import type { ShopSettings } from '@/api/types';
import { mapBill } from '@/features/bills/api';
import BillPreviewScreen from '../app/bill/[id]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '665f00000000000000000001' }),
  router: { back: jest.fn() },
}));

jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  Download: () => null,
  Printer: () => null,
  Share2: () => null,
}));

jest.mock('@/config/env', () => ({ USE_MOCK_API: true, API_BASE_URL: '' }));

jest.mock('@/api/endpoints', () => ({
  billsApi: {
    get: jest.fn(),
    settings: jest.fn(),
    finalize: jest.fn(),
    cancel: jest.fn(),
    addPayment: jest.fn(),
    shareLink: jest.fn(),
    downloadPdf: jest.fn(),
  },
}));

jest.mock('react-native-qrcode-svg', () => jest.fn(() => null));

const backendBillJson = {
  _id: '665f00000000000000000001',
  billNo: 'SDT-2025-0001',
  billDate: '2025-05-01T00:00:00.000Z',
  customerName: 'Anita Sharma',
  customerPhone: '9876543210',
  customerAddress: 'Naugaon, Alwar',
  isGstBill: true,
  isCod: true,
  status: 'final',
  subtotal: { $numberDecimal: '63000.00' },
  taxableAmount: { $numberDecimal: '63000.00' },
  cgst: { $numberDecimal: '5670.00' },
  sgst: { $numberDecimal: '5670.00' },
  igst: { $numberDecimal: '0.00' },
  deliveryCharge: { $numberDecimal: '0.00' },
  discount: { $numberDecimal: '0.00' },
  roundOff: { $numberDecimal: '0.00' },
  grandTotal: { $numberDecimal: '74340.00' },
  advanceAmount: { $numberDecimal: '30000.00' },
  balanceDue: { $numberDecimal: '44340.00' },
  amountInWords: 'Seventy Four Thousand Three Hundred Forty Rupees Only',
  verificationUrl: 'https://example.test/api/public/bills/verify/sample-token',
  items: [{
    _id: '665f00000000000000000002',
    name: 'Makrana White Marble',
    size: '600 x 1200 mm',
    qty: { $numberDecimal: '1' },
    unit: 'sq_ft',
    rate: { $numberDecimal: '63000.00' },
    amount: { $numberDecimal: '63000.00' },
  }],
  payments: [],
};

const settings: ShopSettings = { shopName: 'Shree Durga Tiles', gstin: 'GSTIN-TEST' };

async function renderBillPreview() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BillPreviewScreen />
    </QueryClientProvider>
  );
}

describe('bill response mapper and preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(billsApi.settings).mockResolvedValue(settings);
  });

  it('maps a Mongo backend response and renders the invoice and QR', async () => {
    const mappedBill = mapBill({ success: true, data: backendBillJson });
    expect(mappedBill.id).toBe(backendBillJson._id);
    expect(mappedBill.subtotal).toBe(63_000);
    expect(mappedBill.items?.[0]?.qty).toBe(1);
    expect(mappedBill.items?.[0]?.rate).toBe(63_000);
    expect(mappedBill.balanceDue).toBe(44_340);
    expect(mappedBill.amountInWords).toBe(backendBillJson.amountInWords);
    jest.mocked(billsApi.get).mockResolvedValue(mappedBill);

    const view = await renderBillPreview();
    await waitFor(() => expect(view.getByText('Anita Sharma')).toBeTruthy());
    expect(view.getByText('Makrana White Marble')).toBeTruthy();
    expect(QRCode).toHaveBeenCalledWith(
      expect.objectContaining({ value: backendBillJson.verificationUrl }),
      undefined
    );
  });

  it('renders a bill when optional fields and items are absent', async () => {
    const mappedBill = mapBill({ _id: '665f00000000000000000003', customerName: 'Walk-in Customer' });
    jest.mocked(billsApi.get).mockResolvedValue(mappedBill);

    const view = await renderBillPreview();
    await waitFor(() => expect(view.getByText('Walk-in Customer')).toBeTruthy());
    expect(QRCode).not.toHaveBeenCalled();
    expect(view.getAllByText('₹0').length).toBeGreaterThan(0);
  });

  it('shows the API error and retries the failed request', async () => {
    jest.mocked(billsApi.get)
      .mockRejectedValueOnce({ code: 'NOT_FOUND', message: 'Bill not found on server.' })
      .mockResolvedValue(mapBill(backendBillJson));

    const view = await renderBillPreview();
    await waitFor(() => expect(view.getByText('Bill not found on server.')).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(view.getByText('Anita Sharma')).toBeTruthy());
    expect(billsApi.get).toHaveBeenCalledTimes(2);
  });
});
