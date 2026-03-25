import { Router } from "express";

import { createUserController } from "../controllers/users.controller";

const router = Router();

router.post("/users", createUserController);

export default router;
