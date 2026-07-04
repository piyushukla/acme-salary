import { prisma } from "../lib/db.js";
import { bandCaseSql } from "../lib/money.js";

// USD-normalized salary expression reused across every aggregate query.
const USD = "e.baseSalary * c.rateToUsd";
const JOIN = "FROM Employee e JOIN Currency c ON e.currencyCode = c.code";
const ACTIVE = "WHERE e.status = 'ACTIVE'";

// SQLite returns COUNT/SUM as bigint sometimes — coerce everything to number.
const n = (v: unknown) => Number(v ?? 0);

// Dimensions we allow grouping on. Whitelisted so the raw column interpolation
// below can never be attacker-controlled.
const GROUP_COLUMNS = { country: "country", department: "department", level: "level" } as const;
export type Dimension = keyof typeof GROUP_COLUMNS;

export const analyticsService = {
  // Org-wide headline numbers. Median uses the standard SQLite offset trick so
  // it stays in the DB instead of pulling 10k rows into Node.
  async summary() {
    const [totals] = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) AS headcount,
             SUM(${USD}) AS totalUsd,
             AVG(${USD}) AS avgUsd,
             MIN(${USD}) AS minUsd,
             MAX(${USD}) AS maxUsd
      ${JOIN} ${ACTIVE}
    `);

    const [med] = await prisma.$queryRawUnsafe<any[]>(`
      SELECT AVG(usd) AS medianUsd FROM (
        SELECT ${USD} AS usd ${JOIN} ${ACTIVE}
        ORDER BY usd
        LIMIT 2 - (SELECT COUNT(*) ${JOIN} ${ACTIVE}) % 2
        OFFSET (SELECT (COUNT(*) - 1) / 2 ${JOIN} ${ACTIVE})
      )
    `);

    return {
      headcount: n(totals.headcount),
      totalPayrollUsd: n(totals.totalUsd),
      averageUsd: Math.round(n(totals.avgUsd)),
      medianUsd: Math.round(n(med.medianUsd)),
      minUsd: n(totals.minUsd),
      maxUsd: n(totals.maxUsd),
    };
  },

  // Pay broken down by a dimension (country | department | level).
  async byDimension(dimension: Dimension) {
    const col = GROUP_COLUMNS[dimension]; // whitelisted, safe to interpolate
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT e.${col} AS "group",
             COUNT(*) AS headcount,
             SUM(${USD}) AS totalUsd,
             AVG(${USD}) AS avgUsd
      ${JOIN} ${ACTIVE}
      GROUP BY e.${col}
      ORDER BY totalUsd DESC
    `);
    return rows.map((r) => ({
      group: r.group,
      headcount: n(r.headcount),
      totalUsd: n(r.totalUsd),
      avgUsd: Math.round(n(r.avgUsd)),
    }));
  },

  // Salary distribution across bands — CASE expression derived from SALARY_BANDS
  // so JS and SQL share one source of truth.
  async distribution() {
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT band, COUNT(*) AS count FROM (
        SELECT ${bandCaseSql(USD)} AS band ${JOIN} ${ACTIVE}
      ) GROUP BY band
    `);
    const map = new Map(rows.map((r) => [r.band, n(r.count)]));
    // Return in canonical band order (empty bands as 0).
    const { SALARY_BANDS } = await import("../lib/money.js");
    return SALARY_BANDS.map((b) => ({ band: b.label, count: map.get(b.label) ?? 0 }));
  },
};
