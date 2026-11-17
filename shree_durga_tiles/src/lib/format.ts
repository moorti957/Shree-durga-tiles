export const formatRupees = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'Price on request';
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(amount)) return 'Price on request';
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}`;
};

export const formatCompactRupees = (value: number) => {
  if (Math.abs(value) >= 1_00_000) return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value / 1_00_000)}L`;
  if (Math.abs(value) >= 1_000) return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value / 1_000)}K`;
  return formatRupees(value);
};

export const formatUnit = (unit: string) => ({ sq_ft: 'sq ft', box: 'box', piece: 'piece' }[unit] ?? unit);
