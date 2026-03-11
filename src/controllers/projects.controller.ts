import type { Request, Response } from "express";

import { projectsService } from "../services/projects.service";

async function index(_req: Request, res: Response): Promise<void> {
  const projects = await projectsService.getAll();
  res.status(200).json(projects);
}

async function show(req: Request, res: Response): Promise<void> {
  const projectId = parseInt(req.params.id as string, 10);
  const project = await projectsService.getById(projectId);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.status(200).json(project);
}

async function store(req: Request, res: Response): Promise<void> {
  const { title, summary, demo_url, repository_url, image_url, author_id } = req.body;

  if (!title || !summary || !demo_url || !repository_url || !image_url || !author_id) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newProject = await projectsService.create({
    title,
    summary,
    demo_url,
    repository_url,
    image_url,
    author_id
  });

  res.status(201).json(newProject);
}

async function update(req: Request, res: Response): Promise<void> {
  const projectId = parseInt(req.params.id as string, 10);
  const { title, summary, demo_url, repository_url, image_url, author_id } = req.body;

  const updatedProject = await projectsService.update(projectId, {
    title,
    summary,
    demo_url,
    repository_url,
    image_url,
    author_id
  });

  res.status(200).json(updatedProject);
}

async function destroy(req: Request, res: Response): Promise<void> {
  const projectId = parseInt(req.params.id as string, 10);
  await projectsService.destroy(projectId);
  res.status(204).send();
}

export const projectsController = {
  index,
  show,
  store,
  update,
  destroy
};