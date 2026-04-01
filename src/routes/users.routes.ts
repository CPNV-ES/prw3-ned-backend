import { Router } from "express";

import {
  createUserController,
  listUsersController,
  getUserController,
  listUserProjectsController,
} from "../controllers/users.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/users", createUserController);
router.get("/users", requireAuth, listUsersController);
router.get("/users/:id", requireAuth, getUserController);
router.get("/users/:id/projects", requireAuth, listUserProjectsController);

export default router;
