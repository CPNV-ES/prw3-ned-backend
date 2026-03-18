import { Router } from "express";

import { getHealth } from "../controllers/health.controller";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API health status
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get("/health", getHealth);

export default router;
