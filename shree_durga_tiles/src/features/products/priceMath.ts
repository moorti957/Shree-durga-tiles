export const applyPricePercent = (currentPrice: number, percent: number) =>
  Math.round(currentPrice * (1 + percent / 100));

export const calculatePriceDelta = (currentPrice: number, nextPrice: number) => {
  if (currentPrice === 0) return { amount: nextPrice, percent: nextPrice === 0 ? 0 : null };
  return {
    amount: nextPrice - currentPrice,
    percent: ((nextPrice - currentPrice) / currentPrice) * 100,
  };
};
