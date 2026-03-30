import { Router } from "express";

import {
  createSessionController,
  deleteSessionController,
  getCurrentSessionController,
} from "../controllers/sessions.controller";

const router = Router();

router.get("/sessions", getCurrentSessionController);
router.post("/sessions", createSessionController);
router.delete("/sessions", deleteSessionController);

export default router;
