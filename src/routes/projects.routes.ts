import { Router } from "express";

import { projectsController } from "../controllers/projects.controller";

const router = Router();

router.get("/projects", projectsController.index);
router.get("/projects/:id", projectsController.show);
router.get("/projects/:id/comments", projectsController.commentsIndex);
router.post("/projects", projectsController.store);
router.post("/projects/:id/like", projectsController.like);
router.post("/projects/:id/comments", projectsController.commentsStore);
router.put("/projects/:id", projectsController.update);
router.delete("/projects/:id", projectsController.destroy);

export default router;
