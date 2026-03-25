import { Router } from "express";

import { projectsController } from "../controllers/projects.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { uploadProjectImage } from "../middlewares/project-image-upload.middleware";

const router = Router();

router.use("/projects", requireAuth);

router.get("/projects", projectsController.index);
router.get("/projects/:id", projectsController.show);
router.post("/projects", uploadProjectImage, projectsController.store);
router.post("/projects/:id/like", projectsController.like);
router.put("/projects/:id", uploadProjectImage, projectsController.update);
router.delete("/projects/:id", projectsController.destroy);

export default router;
