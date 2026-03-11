import type { NextFunction, Request, Response } from "express";

import { projectsService } from "../services/projects.service";
import { ProjectNotFoundError } from "../errors/projects/project-not-found.error";

async function index(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const projects = await projectsService.getAll();
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
  const { title, summary, demo_url, repository_url, image_url, author_id } =
    req.body;

  if (
    !title ||
    !summary ||
    !demo_url ||
    !repository_url ||
    !image_url ||
    !author_id
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
      author_id,
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
  const projectId = parseInt(req.params.id as string, 10);
  const { title, summary, demo_url, repository_url, image_url, author_id } =
    req.body;

  try {
    const updatedProject = await projectsService.update(projectId, {
      title,
      summary,
      demo_url,
      repository_url,
      image_url,
      author_id,
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

async function destroy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const projectId = parseInt(req.params.id as string, 10);

  try {
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
  destroy,
};
