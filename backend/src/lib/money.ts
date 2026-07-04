// Pure money helpers — no DB, so they are trivial to unit-test.

/** Convert a local-currency amount to USD. rateToUsd = USD per 1 local unit. */
export function toUsd(amount: number, rateToUsd: number): number {
  return Math.round(amount * rateToUsd);
}

// Single source of truth for salary bands. Both the JS bucketer AND the SQL
// CASE expression in analytics.service are derived from this — no duplication.
export const SALARY_BANDS = [
  { label: "< $50k", max: 50_000 },
  { label: "$50k-100k", max: 100_000 },
  { label: "$100k-150k", max: 150_000 },
  { label: "$150k-250k", max: 250_000 },
  { label: "$250k+", max: Infinity },
] as const;

/** Bucket a USD salary into a band label. */
export function salaryBand(usd: number): string {
  return (SALARY_BANDS.find((b) => usd < b.max) ?? SALARY_BANDS.at(-1)!).label;
}

/** Build a SQLite CASE expression for the same bands, driven by SALARY_BANDS. */
export function bandCaseSql(usdExpr: string): string {
  const finite = SALARY_BANDS.filter((b) => b.max !== Infinity);
  const whens = finite.map((b) => `WHEN ${usdExpr} < ${b.max} THEN '${b.label}'`).join(" ");
  return `CASE ${whens} ELSE '${SALARY_BANDS.at(-1)!.label}' END`;
}
