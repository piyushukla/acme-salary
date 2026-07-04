import { Router } from "express";
import { employeeService } from "../services/employee.service.js";
import { listQuerySchema, updateEmployeeSchema } from "../schemas/employee.schema.js";

const router = Router();

// Thin async wrapper so thrown errors reach the central error handler.
const wrap = (fn: (...a: any[]) => Promise<any>) =>
  (req: any, res: any, next: any) => fn(req, res, next).catch(next);

// GET /api/employees — server-side pagination / search / sort / filter
router.get("/", wrap(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  res.json(await employeeService.list(query));
}));

// GET /api/employees/filters — distinct values for UI dropdowns
router.get("/filters", wrap(async (_req, res) => {
  res.json(await employeeService.filterOptions());
}));

// GET /api/employees/:id
router.get("/:id", wrap(async (req, res) => {
  res.json(await employeeService.getById(req.params.id));
}));

// PATCH /api/employees/:id — update salary-relevant fields
router.patch("/:id", wrap(async (req, res) => {
  const input = updateEmployeeSchema.parse(req.body);
  res.json(await employeeService.update(req.params.id, input));
}));

export default router;
