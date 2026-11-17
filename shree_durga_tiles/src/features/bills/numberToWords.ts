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

export const numberToIndianWords = (amount: number): string => {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(Math.round(amount))) {
    throw new Error('Amount must be a non-negative, finite number.');
  }
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';
  if (rounded > 999_999_999) throw new Error('Amount exceeds the supported Indian numbering range.');

  let remainder = rounded;
  const groups: [number, string][] = [
    [10_000_000, 'Crore'],
    [100_000, 'Lakh'],
    [1_000, 'Thousand'],
    [1, ''],
  ];
  const parts: string[] = [];
  for (const [divisor, label] of groups) {
    const group = Math.floor(remainder / divisor);
    remainder %= divisor;
    if (group > 0) parts.push(`${underThousand(group)}${label ? ` ${label}` : ''}`);
  }
  return `${parts.join(' ')} Rupees Only`;
};
