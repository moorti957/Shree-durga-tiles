export type BillMathInput = {
  items: { qty: number; rate: number }[];
  deliveryCharge?: number;
  discount?: number;
  gstRate?: number;
  isGstBill?: boolean;
  sameState?: boolean;
  advanceAmount?: number;
  payments?: number[];
};

const paise = (value: number) => Math.round(value * 100);
const rupees = (value: number) => value / 100;

export const calculateBill = (input: BillMathInput) => {
  const subtotalPaise = input.items.reduce((sum, item) => sum + paise(item.qty * item.rate), 0);
  const deliveryPaise = paise(input.deliveryCharge ?? 0);
  const discountPaise = paise(input.discount ?? 0);
  const taxablePaise = subtotalPaise + deliveryPaise - discountPaise;
  if (taxablePaise < 0) throw new Error('Discount cannot exceed the subtotal and delivery charge.');
  const gstPaise = input.isGstBill
    ? Math.round((taxablePaise * (input.gstRate ?? 18)) / 100)
    : 0;
  const sameState = input.sameState !== false;
  const cgstPaise = input.isGstBill && sameState ? Math.floor(gstPaise / 2) : 0;
  const sgstPaise = input.isGstBill && sameState ? gstPaise - cgstPaise : 0;
  const igstPaise = input.isGstBill && input.sameState === false ? gstPaise : 0;
  const unroundedTotalPaise = taxablePaise + cgstPaise + sgstPaise + igstPaise;
  const grandTotalPaise = Math.round(unroundedTotalPaise / 100) * 100;
  const roundOffPaise = grandTotalPaise - unroundedTotalPaise;
  const paidPaise = paise(input.advanceAmount ?? 0) + (input.payments ?? []).reduce((sum, amount) => sum + paise(amount), 0);
  if (paidPaise > grandTotalPaise) throw new Error('Advance and payments cannot exceed the bill total.');
  return {
    subtotal: rupees(subtotalPaise),
    taxableAmount: rupees(taxablePaise),
    cgst: rupees(cgstPaise),
    sgst: rupees(sgstPaise),
    igst: rupees(igstPaise),
    roundOff: rupees(roundOffPaise),
    grandTotal: rupees(grandTotalPaise),
    balanceDue: rupees(grandTotalPaise - paidPaise),
  };
};
