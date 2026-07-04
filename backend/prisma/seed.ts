import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
faker.seed(42); // deterministic -> reproducible data + stable tests

const TOTAL = 10_000;
const BATCH = 1_000;

// Static FX rates -> USD (see requirements: live rates deliberately out of scope).
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", rateToUsd: 1.0 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rateToUsd: 0.012 },
  { code: "GBP", name: "British Pound", symbol: "£", rateToUsd: 1.27 },
  { code: "EUR", name: "Euro", symbol: "€", rateToUsd: 1.08 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", rateToUsd: 0.74 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", rateToUsd: 0.18 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rateToUsd: 0.73 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rateToUsd: 0.66 },
];

// Country -> currency + headcount weight + local cost-of-labor multiplier.
const COUNTRIES = [
  { name: "United States", currency: "USD", weight: 30, costFactor: 1.0 },
  { name: "India", currency: "INR", weight: 28, costFactor: 0.35 },
  { name: "United Kingdom", currency: "GBP", weight: 10, costFactor: 0.85 },
  { name: "Germany", currency: "EUR", weight: 10, costFactor: 0.8 },
  { name: "Singapore", currency: "SGD", weight: 7, costFactor: 0.9 },
  { name: "Brazil", currency: "BRL", weight: 6, costFactor: 0.45 },
  { name: "Canada", currency: "CAD", weight: 5, costFactor: 0.8 },
  { name: "Australia", currency: "AUD", weight: 4, costFactor: 0.85 },
];

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Sales", "Marketing",
  "Finance", "Human Resources", "Operations", "Support", "Legal",
];

// Level -> base annual USD band + rarity weight (org pyramid: many juniors, few directors).
const LEVELS = [
  { level: "L1", title: "Associate", usdMin: 45_000, usdMax: 70_000, weight: 26 },
  { level: "L2", title: "Engineer", usdMin: 65_000, usdMax: 95_000, weight: 30 },
  { level: "L3", title: "Senior", usdMin: 90_000, usdMax: 140_000, weight: 22 },
  { level: "L4", title: "Lead", usdMin: 130_000, usdMax: 190_000, weight: 12 },
  { level: "L5", title: "Manager", usdMin: 170_000, usdMax: 240_000, weight: 7 },
  { level: "L6", title: "Director", usdMin: 230_000, usdMax: 350_000, weight: 3 },
];

// Weighted pick — deterministic given faker.seed above.
function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = faker.number.float({ min: 0, max: total });
  for (const item of items) {
    if (r < item.weight) return item;
    r -= item.weight;
  }
  return items[items.length - 1];
}

function buildEmployee(index: number) {
  const country = weightedPick(COUNTRIES);
  const level = weightedPick(LEVELS);
  const department = faker.helpers.arrayElement(DEPARTMENTS);
  const currency = CURRENCIES.find((c) => c.code === country.currency)!;

  const usdBand = faker.number.int({ min: level.usdMin, max: level.usdMax });
  const usdTarget = usdBand * country.costFactor;
  // Convert USD target -> local currency (local = usd / rateToUsd).
  const localSalary = Math.round(usdTarget / currency.rateToUsd);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    employeeCode: `ACME-${String(index + 1).padStart(6, "0")}`,
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName, provider: "acme.example" }).toLowerCase(),
    country: country.name,
    department,
    jobTitle: `${level.title}, ${department}`,
    level: level.level,
    baseSalary: localSalary,
    currencyCode: currency.code,
    employmentType: weightedPick([
      { employmentType: "FULL_TIME", weight: 90 },
      { employmentType: "CONTRACT", weight: 7 },
      { employmentType: "PART_TIME", weight: 3 },
    ]).employmentType,
    status: weightedPick([
      { status: "ACTIVE", weight: 94 },
      { status: "ON_LEAVE", weight: 4 },
      { status: "TERMINATED", weight: 2 },
    ]).status,
    hireDate: faker.date.past({ years: 8 }),
  };
}

async function main() {
  console.log("Seeding currencies...");
  for (const c of CURRENCIES) {
    await prisma.currency.upsert({ where: { code: c.code }, update: c, create: c });
  }

  console.log("Clearing existing employees...");
  await prisma.employee.deleteMany();

  console.log(`Seeding ${TOTAL} employees...`);
  for (let start = 0; start < TOTAL; start += BATCH) {
    const rows = Array.from({ length: Math.min(BATCH, TOTAL - start) }, (_, i) =>
      buildEmployee(start + i)
    );
    await prisma.employee.createMany({ data: rows });
    console.log(`  ${Math.min(start + BATCH, TOTAL)}/${TOTAL}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
