export type BillCalculationItem = {
  qty: number;
  rate: number;
};

export type BillCalculationInput = {
  items: BillCalculationItem[];
  gstRate?: number;
  isGstBill?: boolean;
  customerState?: string;
  deliveryCharge?: number;
  discount?: number;
  advanceAmount?: number;
  isCod?: boolean;
};

export type BillCalculation = {
  itemAmountsPaise: number[];
  subtotalPaise: number;
  deliveryChargePaise: number;
  discountPaise: number;
  taxableAmountPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundOffPaise: number;
  grandTotalPaise: number;
  advanceAmountPaise: number;
  balanceDuePaise: number;
  codAmountPaise: number;
  amountInWords: string;
};

const toPaise = (amount: number, field: string): number => {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${field} must be a non-negative, finite amount.`);
  }
  const paise = Math.round(amount * 100);
  if (!Number.isSafeInteger(paise)) throw new Error(`${field} exceeds the supported range.`);
  return paise;
};

const checkedSum = (values: number[], field: string): number => {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isSafeInteger(total)) throw new Error(`${field} exceeds the supported range.`);
  return total;
};

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const underThousand = (value: number): string => {
  const words: string[] = [];
  if (value >= 100) {
    words.push(`${ones[Math.floor(value / 100)]} Hundred`);
    value %= 100;
  }
  if (value >= 20) {
    words.push(tens[Math.floor(value / 10)]);
    value %= 10;
  }
  if (value > 0) words.push(ones[value]);
  return words.join(' ');
};

const integerToIndianWords = (value: number): string => {
  if (value === 0) return 'Zero';
  const groups: [number, string][] = [
    [10_000_000, 'Crore'],
    [100_000, 'Lakh'],
    [1_000, 'Thousand'],
    [1, ''],
  ];
  let remainder = value;
  const words: string[] = [];
  for (const [divisor, label] of groups) {
    const group = Math.floor(remainder / divisor);
    remainder %= divisor;
    if (group > 0) words.push(`${underThousand(group)}${label ? ` ${label}` : ''}`);
  }
  return words.join(' ');
};

export const amountInIndianWords = (amountPaise: number): string => {
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 0) {
    throw new Error('Amount must be a non-negative whole number of paise.');
  }
  const rupees = Math.floor(amountPaise / 100);
  const paise = amountPaise % 100;
  if (rupees > 99_99_99_999) throw new Error('Amount exceeds the supported Indian numbering range.');
  const parts = [`${integerToIndianWords(rupees)} Rupees`];
  if (paise > 0) parts.push(`${integerToIndianWords(paise)} Paise`);
  return `${parts.join(' and ')} Only`;
};

export const calculateBill = (input: BillCalculationInput): BillCalculation => {
  if (input.items.length === 0) throw new Error('Add at least one bill item.');
  const itemAmountsPaise = input.items.map((item) => {
    if (!Number.isFinite(item.qty) || item.qty <= 0) {
      throw new Error('Item quantity must be greater than zero.');
    }
    return toPaise(item.qty * item.rate, 'Item amount');
  });
  const subtotalPaise = checkedSum(itemAmountsPaise, 'Bill subtotal');
  const deliveryChargePaise = toPaise(input.deliveryCharge ?? 0, 'Delivery charge');
  const discountPaise = toPaise(input.discount ?? 0, 'Discount');
  const taxableAmountPaise = subtotalPaise + deliveryChargePaise - discountPaise;
  if (!Number.isSafeInteger(taxableAmountPaise)) throw new Error('Taxable amount exceeds the supported range.');
  if (taxableAmountPaise < 0) throw new Error('Discount cannot exceed the subtotal and delivery charge.');

  const gstRate = input.gstRate ?? 18;
  if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
    throw new Error('GST rate must be between 0 and 100.');
  }
  const gstPaise = input.isGstBill === false ? 0 : Math.round((taxableAmountPaise * gstRate) / 100);
  if (!Number.isSafeInteger(gstPaise)) throw new Error('GST exceeds the supported range.');
  const customerState = input.customerState?.trim().toLowerCase();
  const interstate = Boolean(customerState && customerState !== 'rajasthan');
  const cgstPaise = interstate ? 0 : Math.floor(gstPaise / 2);
  const sgstPaise = interstate ? 0 : gstPaise - cgstPaise;
  const igstPaise = interstate ? gstPaise : 0;
  const unroundedTotalPaise = checkedSum(
    [taxableAmountPaise, cgstPaise, sgstPaise, igstPaise],
    'Bill total'
  );
  const grandTotalPaise = Math.round(unroundedTotalPaise / 100) * 100;
  const roundOffPaise = grandTotalPaise - unroundedTotalPaise;
  const advanceAmountPaise = toPaise(input.advanceAmount ?? 0, 'Advance amount');
  if (advanceAmountPaise > grandTotalPaise) throw new Error('Advance cannot exceed the bill total.');
  const balanceDuePaise = grandTotalPaise - advanceAmountPaise;

  return {
    itemAmountsPaise,
    subtotalPaise,
    deliveryChargePaise,
    discountPaise,
    taxableAmountPaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    roundOffPaise,
    grandTotalPaise,
    advanceAmountPaise,
    balanceDuePaise,
    codAmountPaise: input.isCod ? balanceDuePaise : 0,
    amountInWords: amountInIndianWords(grandTotalPaise),
  };
};
