import { Router } from "express";

import { projectsController } from "../controllers/projects.controller";

const router = Router();

router.get("/projects", projectsController.index);
router.get("/projects/:id", projectsController.show);
router.post("/projects", projectsController.store);
router.post("/projects/:id/like",);
router.put("/projects/:id", projectsController.update);
router.delete("/projects/:id", projectsController.destroy);

export default router;