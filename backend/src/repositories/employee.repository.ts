import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/db.js";
import type { ListQuery } from "../schemas/employee.schema.js";

// All Prisma access for employees is centralized here. Services never touch
// Prisma directly — keeps the data layer swappable and easy to mock in tests.
export const employeeRepository = {
  async list(q: ListQuery) {
    const where: Prisma.EmployeeWhereInput = {};
    if (q.country) where.country = q.country;
    if (q.department) where.department = q.department;
    if (q.level) where.level = q.level;
    if (q.status) where.status = q.status;
    if (q.search) {
      // SQLite LIKE is case-insensitive for ASCII, so `contains` covers name/email/code.
      where.OR = [
        { firstName: { contains: q.search } },
        { lastName: { contains: q.search } },
        { email: { contains: q.search } },
        { employeeCode: { contains: q.search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { [q.sortBy]: q.sortDir },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: { currency: true },
      }),
      prisma.employee.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.employee.findUnique({ where: { id }, include: { currency: true } });
  },

  update(id: string, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({ where: { id }, data, include: { currency: true } });
  },

  // Distinct filter values for the UI dropdowns (country / department / level).
  async filterOptions() {
    const [countries, departments, levels] = await Promise.all([
      prisma.employee.findMany({ distinct: ["country"], select: { country: true }, orderBy: { country: "asc" } }),
      prisma.employee.findMany({ distinct: ["department"], select: { department: true }, orderBy: { department: "asc" } }),
      prisma.employee.findMany({ distinct: ["level"], select: { level: true }, orderBy: { level: "asc" } }),
    ]);
    return {
      countries: countries.map((c) => c.country),
      departments: departments.map((d) => d.department),
      levels: levels.map((l) => l.level),
    };
  },
};
