import { Router } from "express";

import {
  createUserController,
  listUsersController,
  getUserController,
} from "../controllers/users.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/users", createUserController);
router.get("/users", requireAuth, listUsersController);
router.get("/users/:id", requireAuth, getUserController);

export default router;
