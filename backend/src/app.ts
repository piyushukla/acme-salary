import express from "express";
import cors from "cors";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import employeeRoutes from "./routes/employees.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
  app.use(express.json());

  // Public health check (no auth) for uptime pings / deploy verification.
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Everything under /api requires the HR auth token.
  app.use("/api", requireAuth);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.use(errorHandler);
  return app;
}
