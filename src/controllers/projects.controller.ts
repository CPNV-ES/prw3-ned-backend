import type { NextFunction, Request, Response } from "express";

import { projectsService } from "../services/projects.service";
import { ProjectNotFoundError } from "../errors/projects/project-not-found.error";
import { createForbiddenError } from "../utils/http-error";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

async function index(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const rawName = req.query.name;
  const rawTags = req.query.tags;
  const rawSortBy = req.query.sortBy;
  const rawOrder = req.query.order;

  const name = typeof rawName === "string" ? rawName.trim() : undefined;

  const tags = (() => {
    if (typeof rawTags === "string") {
      return rawTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (Array.isArray(rawTags)) {
      return rawTags
        .flatMap((t) => (typeof t === "string" ? t.split(",") : []))
        .map((t) => t.trim())
        .filter(Boolean);
    }

    return [] as string[];
  })();

  const sortBy = typeof rawSortBy === "string" ? rawSortBy : undefined;
  const order = typeof rawOrder === "string" ? rawOrder : undefined;

  if (sortBy && sortBy !== "date" && sortBy !== "likes") {
    res.status(400).json({ error: "Invalid sortBy" });
    return;
  }

  if (order && order !== "asc" && order !== "desc") {
    res.status(400).json({ error: "Invalid order" });
    return;
  }

  try {
    const shouldUseOptions =
      Boolean(name) || tags.length > 0 || Boolean(sortBy);

    const options = (() => {
      if (!shouldUseOptions) {
        return undefined;
      }

      const o: {
        name?: string;
        tags?: string[];
        sortBy?: "date" | "likes";
        order?: "asc" | "desc";
      } = {};

      if (name) {
        o.name = name;
      }

      if (tags.length > 0) {
        o.tags = Array.from(new Set(tags));
      }

      if (sortBy) {
        o.sortBy = sortBy as "date" | "likes";
        o.order = (order || "desc") as "asc" | "desc";
      }

      return o;
    })();

    const projects = options
      ? await projectsService.getAll(options)
      : await projectsService.getAll();

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
}

async function show(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const projectId = parseInt(req.params.id as string, 10);

  try {
    const project = await projectsService.getById(projectId);

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}

async function store(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authenticatedReq = req as AuthenticatedRequest;
  const { title, summary, demo_url, repository_url, image_url } = req.body;
  const currentUserId = authenticatedReq.currentUser?.id;

  if (
    !title ||
    !summary ||
    !demo_url ||
    !repository_url ||
    !image_url ||
    !currentUserId
  ) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const newProject = await projectsService.create({
      title,
      summary,
      demo_url,
      repository_url,
      image_url,
      author_id: currentUserId,
    });

    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
}

async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authenticatedReq = req as AuthenticatedRequest;
  const projectId = parseInt(req.params.id as string, 10);
  const { title, summary, demo_url, repository_url, image_url } = req.body;

  try {
    const existingProject = await projectsService.getById(projectId);

    if (!existingProject) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (existingProject.author_id !== authenticatedReq.currentUser?.id) {
      throw createForbiddenError("You can only modify your own projects");
    }

    const updatedProject = await projectsService.update(projectId, {
      title,
      summary,
      demo_url,
      repository_url,
      image_url,
      author_id: existingProject.author_id,
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }

    next(error);
  }
}

async function like(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const projectId = parseInt(req.params.id as string, 10);

  try {
    const updatedProject = await projectsService.like(projectId);
    res.status(200).json(updatedProject);
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }

    next(error);
  }
}

async function destroy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authenticatedReq = req as AuthenticatedRequest;
  const projectId = parseInt(req.params.id as string, 10);

  try {
    const existingProject = await projectsService.getById(projectId);

    if (!existingProject) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (existingProject.author_id !== authenticatedReq.currentUser?.id) {
      throw createForbiddenError("You can only delete your own projects");
    }

    await projectsService.destroy(projectId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }

    next(error);
  }
}

export const projectsController = {
  index,
  show,
  store,
  update,
  like,
  destroy,
};
