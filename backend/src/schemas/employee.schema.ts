import { z } from "zod";

const SORTABLE = ["baseSalary", "firstName", "lastName", "hireDate", "department", "country", "level"] as const;

// List query params. coerce handles the fact that querystrings are always strings.
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25), // clamp: never let the client pull 10k
  search: z.string().trim().max(120).optional(),
  country: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(SORTABLE).default("lastName"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

// Only salary-relevant fields are editable — the HR Manager's actual job.
export const updateEmployeeSchema = z.object({
  baseSalary: z.number().positive().optional(),
  currencyCode: z.string().length(3).optional(),
  jobTitle: z.string().min(1).max(120).optional(),
  level: z.string().min(1).max(10).optional(),
  department: z.string().min(1).max(60).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]).optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

export type ListQuery = z.infer<typeof listQuerySchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
