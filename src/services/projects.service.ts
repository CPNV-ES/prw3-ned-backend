import { ProjectNotFoundError } from "../errors/projects/project-not-found.error";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../utils/prisma";

export interface Project {
  id: number;
  title: string;
  summary: string;
  demo_url: string;
  repository_url: string;
  image_url: string;
  author_id: number;
}

export interface Comment {
  id: number;
  content: string;
  created_at: Date;
  author_id: number;
  project_id: number;
}

export interface ProjectsListOptions {
  name?: string;
  tags?: string[];
  sortBy?: "date" | "likes";
  order?: "asc" | "desc";
}

async function run<T>(functionToRun: () => Promise<T>): Promise<T> {
  try {
    return await functionToRun();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ProjectNotFoundError();
    }

    throw error;
  }
}

async function getAll(options?: ProjectsListOptions): Promise<Project[]> {
  return run(async () => {
    if (!options) {
      return prisma.projects.findMany();
    }

    const where: Prisma.projectsWhereInput = {};

    if (options.name) {
      where.title = {
        contains: options.name,
      };
    }

    if (options.tags && options.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: options.tags,
            },
          },
        },
      };
    }

    const orderBy = (() => {
      if (!options.sortBy) {
        return undefined;
      }

      const order = options.order || "desc";

      return options.sortBy === "likes"
        ? ({ likes: order } as const)
        : ({ created_at: order } as const);
    })();

    const args: Prisma.projectsFindManyArgs = {};
    if (Object.keys(where).length > 0) {
      args.where = where;
    }
    if (orderBy) {
      args.orderBy = orderBy;
    }

    return prisma.projects.findMany(args);
  });
}

async function getById(projectId: number): Promise<Project | null> {
  return run(async () => {
    return prisma.projects.findUnique({
      where: { id: projectId },
    });
  });
}

async function create(project: Omit<Project, "id">): Promise<Project> {
  return run(async () => {
    return prisma.projects.create({
      data: project,
    });
  });
}

async function getComments(projectId: number): Promise<Comment[]> {
  return run(async () => {
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ProjectNotFoundError();
    }

    return prisma.comments.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: "desc" },
    });
  });
}

async function createComment(
  projectId: number,
  comment: Omit<Comment, "id" | "created_at" | "project_id">,
): Promise<Comment> {
  return run(async () => {
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ProjectNotFoundError();
    }

    return prisma.comments.create({
      data: {
        ...comment,
        project_id: projectId,
      },
    });
  });
}

async function update(
  projectId: number,
  project: Omit<Project, "id">,
): Promise<Project> {
  return run(async () => {
    return prisma.projects.update({
      where: { id: projectId },
      data: project,
    });
  });
}

async function like(projectId: number): Promise<Project> {
  return run(async () => {
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ProjectNotFoundError();
    }

    return prisma.projects.update({
      where: { id: projectId },
      data: { likes: (project.likes || 0) + 1 },
    });
  });
}

async function destroy(projectId: number): Promise<void> {
  await run(async () => {
    await prisma.projects.delete({
      where: { id: projectId },
    });
  });
}

export const projectsService = {
  getAll,
  getById,
  create,
  getComments,
  createComment,
  update,
  like,
  destroy,
};
