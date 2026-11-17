import { calculateBill } from '@/features/bills/calc';
import { numberToIndianWords } from '@/features/bills/numberToWords';
import { applyPricePercent } from '@/features/products/priceMath';

describe('bill calculations', () => {
  it('calculates the reference GST amount and COD balance', () => {
    const result = calculateBill({
      items: [{ qty: 1, rate: 63_000 }],
      gstRate: 18,
      sameState: true,
      isGstBill: true,
      advanceAmount: 30_000,
    });

    expect(result).toEqual({
      subtotal: 63_000,
      taxableAmount: 63_000,
      cgst: 5_670,
      sgst: 5_670,
      igst: 0,
      roundOff: 0,
      grandTotal: 74_340,
      balanceDue: 44_340,
    });
  });

  it('uses the Indian lakh/crore number system', () => {
    expect(numberToIndianWords(74_340)).toBe('Seventy Four Thousand Three Hundred Forty Rupees Only');
    expect(numberToIndianWords(1_25_000)).toBe('One Lakh Twenty Five Thousand Rupees Only');
  });

  it('applies backend-compatible whole-rupee rounding', () => {
    const result = calculateBill({
      items: [{ qty: 1, rate: 100.03 }],
      gstRate: 18,
      sameState: true,
      isGstBill: true,
    });
    expect(result.grandTotal).toBe(118);
    expect(result.roundOff).toBe(-0.04);
  });

  it('rounds percentage changes to whole rupees', () => {
    expect(applyPricePercent(95, 10)).toBe(105);
    expect(applyPricePercent(95, -10)).toBe(86);
  });
});
