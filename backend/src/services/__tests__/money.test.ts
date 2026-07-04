import { describe, it, expect } from "vitest";
import { toUsd, salaryBand, bandCaseSql, SALARY_BANDS } from "../../lib/money.js";

describe("toUsd", () => {
  it("returns the same amount for USD (rate 1)", () => {
    expect(toUsd(100_000, 1)).toBe(100_000);
  });

  it("converts local currency to USD and rounds", () => {
    // 5,000,000 INR at 0.012 -> 60,000 USD
    expect(toUsd(5_000_000, 0.012)).toBe(60_000);
  });

  it("rounds to the nearest whole dollar", () => {
    expect(toUsd(1234, 1.005)).toBe(1240); // 1240.17 -> 1240
  });
});

describe("salaryBand", () => {
  it("buckets values into the right band", () => {
    expect(salaryBand(30_000)).toBe("< $50k");
    expect(salaryBand(50_000)).toBe("$50k-100k"); // boundary is inclusive-low
    expect(salaryBand(99_999)).toBe("$50k-100k");
    expect(salaryBand(250_000)).toBe("$250k+");
    expect(salaryBand(1_000_000)).toBe("$250k+");
  });

  it("covers every band label defined in SALARY_BANDS", () => {
    const labels = new Set(SALARY_BANDS.map((b) => b.label));
    const produced = new Set([0, 75_000, 120_000, 200_000, 500_000].map(salaryBand));
    expect(produced).toEqual(labels);
  });
});

describe("bandCaseSql", () => {
  it("derives a CASE expression from SALARY_BANDS (single source of truth)", () => {
    const sql = bandCaseSql("x");
    expect(sql.startsWith("CASE ")).toBe(true);
    expect(sql).toContain("WHEN x < 50000 THEN '< $50k'");
    expect(sql).toContain("ELSE '$250k+'");
    // one WHEN per finite band
    const whenCount = (sql.match(/WHEN/g) ?? []).length;
    expect(whenCount).toBe(SALARY_BANDS.filter((b) => b.max !== Infinity).length);
  });
});
