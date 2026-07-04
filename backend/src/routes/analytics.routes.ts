import { Router } from "express";
import { analyticsService, type Dimension } from "../services/analytics.service.js";

const router = Router();
const wrap = (fn: (...a: any[]) => Promise<any>) =>
  (req: any, res: any, next: any) => fn(req, res, next).catch(next);

const DIMENSIONS: Dimension[] = ["country", "department", "level"];

// GET /api/analytics/summary — org headline numbers (USD)
router.get("/summary", wrap(async (_req, res) => {
  res.json(await analyticsService.summary());
}));

// GET /api/analytics/by/:dimension — country | department | level
router.get("/by/:dimension", wrap(async (req, res) => {
  const dim = req.params.dimension as Dimension;
  if (!DIMENSIONS.includes(dim)) {
    return res.status(400).json({ error: `dimension must be one of: ${DIMENSIONS.join(", ")}` });
  }
  res.json(await analyticsService.byDimension(dim));
}));

// GET /api/analytics/distribution — salary bands
router.get("/distribution", wrap(async (_req, res) => {
  res.json(await analyticsService.distribution());
}));

export default router;
