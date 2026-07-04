const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUsd = (n: number) => usd.format(n);

// Compact form for big totals, e.g. $12.3M
export const formatUsdCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const formatLocal = (amount: number, symbol: string) =>
  `${symbol}${new Intl.NumberFormat("en-US").format(amount)}`;
