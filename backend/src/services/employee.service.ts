import { employeeRepository } from "../repositories/employee.repository.js";
import { HttpError } from "../middleware/error.js";
import { prisma } from "../lib/db.js";
import { toUsd } from "../lib/money.js";
import type { ListQuery, UpdateEmployeeInput } from "../schemas/employee.schema.js";

type EmployeeWithCurrency = Awaited<ReturnType<typeof employeeRepository.findById>>;

// Shape a raw row into an API DTO, adding the normalized USD figure so the
// client never has to know FX rates.
function toDto(e: NonNullable<EmployeeWithCurrency>) {
  return {
    id: e.id,
    employeeCode: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    email: e.email,
    country: e.country,
    department: e.department,
    jobTitle: e.jobTitle,
    level: e.level,
    baseSalary: e.baseSalary,
    currencyCode: e.currencyCode,
    currencySymbol: e.currency.symbol,
    salaryUsd: toUsd(e.baseSalary, e.currency.rateToUsd),
    employmentType: e.employmentType,
    status: e.status,
    hireDate: e.hireDate,
  };
}

export const employeeService = {
  async list(q: ListQuery) {
    const { items, total } = await employeeRepository.list(q);
    return {
      data: items.map(toDto),
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages: Math.ceil(total / q.pageSize),
      },
    };
  },

  async getById(id: string) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new HttpError(404, "Employee not found");
    return toDto(employee);
  },

  async update(id: string, input: UpdateEmployeeInput) {
    const exists = await employeeRepository.findById(id);
    if (!exists) throw new HttpError(404, "Employee not found");

    // If currency is being changed, make sure it's a currency we actually track.
    if (input.currencyCode) {
      const currency = await prisma.currency.findUnique({ where: { code: input.currencyCode } });
      if (!currency) throw new HttpError(400, `Unknown currency: ${input.currencyCode}`);
    }

    const updated = await employeeRepository.update(id, input);
    return toDto(updated!);
  },

  filterOptions() {
    return employeeRepository.filterOptions();
  },
};
