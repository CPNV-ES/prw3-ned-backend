import { Router } from "express";

import { projectsController } from "../controllers/projects.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use("/projects", requireAuth);

router.get("/projects", projectsController.index);
router.get("/projects/:id", projectsController.show);
router.post("/projects", projectsController.store);
router.post("/projects/:id/like", projectsController.like);
router.put("/projects/:id", projectsController.update);
router.delete("/projects/:id", projectsController.destroy);

export default router;
