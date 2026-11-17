import { create } from 'axios';
import { mockAdapter } from '../src/api/mockAdapter';

const api = create({ baseURL: 'https://mock.local/api', adapter: mockAdapter });

describe('mock bill workflow', () => {
  it('creates, finalizes, and records an idempotent payment', async () => {
    const created = await api.post('/admin/bills', {
      customerName: 'Test Customer',
      isGstBill: true,
      gstRate: 18,
      items: [{ name: 'Stone', qty: 2, unit: 'sq_ft', rate: 100, amount: 1 }],
    }, { headers: { 'Idempotency-Key': 'mock-bill-create-test' } });
    const bill = created.data.data;
    expect(bill.status).toBe('draft');
    expect(bill.subtotal).toBe(200);
    expect(bill.grandTotal).toBe(236);

    const finalized = await api.post(`/admin/bills/${bill._id}/finalize`);
    expect(finalized.data.data.status).toBe('final');
    expect(finalized.data.data.billNo).toBeTruthy();
    expect(finalized.data.data.verificationUrl).toContain('/public/bills/verify/');

    const paymentRequest = () => api.post(`/admin/bills/${bill._id}/payments`, {
      amount: 50,
      mode: 'cash',
    }, { headers: { 'Idempotency-Key': 'mock-payment-test' } });
    const first = await paymentRequest();
    const repeated = await paymentRequest();
    expect(first.data.data.balanceDue).toBe(186);
    expect(repeated.data.data.balanceDue).toBe(186);
    expect(repeated.data.data.payments).toHaveLength(1);
  });
});
