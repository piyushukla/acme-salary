export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  country: string;
  department: string;
  jobTitle: string;
  level: string;
  baseSalary: number;
  currencyCode: string;
  currencySymbol: string;
  salaryUsd: number;
  employmentType: string;
  status: string;
  hireDate: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface FilterOptions {
  countries: string[];
  departments: string[];
  levels: string[];
}

export interface Summary {
  headcount: number;
  totalPayrollUsd: number;
  averageUsd: number;
  medianUsd: number;
  minUsd: number;
  maxUsd: number;
}

export interface DimensionRow {
  group: string;
  headcount: number;
  totalUsd: number;
  avgUsd: number;
}

export interface BandRow {
  band: string;
  count: number;
}

export interface EmployeeQuery {
  page: number;
  pageSize: number;
  search?: string;
  country?: string;
  department?: string;
  level?: string;
  status?: string;
  sortBy: string;
  sortDir: "asc" | "desc";
}
