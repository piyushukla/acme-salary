import type { Request, Response, NextFunction } from "express";

// Single auth gate for the HR Manager. Multi-role RBAC is deliberately out of
// scope (see requirements) — this proves the pattern with one bearer token.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
