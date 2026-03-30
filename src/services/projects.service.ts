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
  likes: number;
  tags: string[];
  author_id: number;
  author_name: string;
}

export interface Comment {
  id: number;
  content: string;
  created_at: Date;
  author_id: number;
  project_id: number;
}

type ProjectWriteInput = Omit<Project, "id" | "author_name" | "likes">;

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

const projectSelect = {
  id: true,
  title: true,
  summary: true,
  demo_url: true,
  repository_url: true,
  image_url: true,
  likes: true,
  author_id: true,
  author: {
    select: {
      name: true,
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          name: true,
        },
      },
    },
  },
} satisfies Prisma.projectsSelect;

type ProjectWithAuthor = Prisma.projectsGetPayload<{
  select: typeof projectSelect;
}>;

function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function mapProject(project: ProjectWithAuthor): Project {
  return {
    id: project.id,
    title: project.title,
    summary: project.summary,
    demo_url: project.demo_url,
    repository_url: project.repository_url,
    image_url: project.image_url,
    likes: project.likes,
    tags: project.tags.map((projectTag) => projectTag.tag.name),
    author_id: project.author_id,
    author_name: project.author.name,
  };
}

async function getAll(options?: ProjectsListOptions): Promise<Project[]> {
  return run(async () => {
    if (!options) {
      const projects = await prisma.projects.findMany({
        select: projectSelect,
      });
      return projects.map(mapProject);
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

    const args = {
      select: projectSelect,
      ...(Object.keys(where).length > 0 ? { where } : {}),
      ...(orderBy ? { orderBy } : {}),
    } satisfies Prisma.projectsFindManyArgs;

    const projects = await prisma.projects.findMany(args);
    return projects.map(mapProject);
  });
}

async function getById(projectId: number): Promise<Project | null> {
  return run(async () => {
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      select: projectSelect,
    });

    if (!project) {
      return null;
    }

    return mapProject(project);
  });
}

async function create(project: ProjectWriteInput): Promise<Project> {
  return run(async () => {
    const { author_id, tags = [], ...projectData } = project;
    const normalizedTags = normalizeTags(tags);

    const data = {
      ...projectData,
      author: {
        connect: {
          id: author_id,
        },
      },
      ...(normalizedTags.length > 0
        ? {
            tags: {
              create: normalizedTags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            },
          }
        : {}),
    } satisfies Prisma.projectsCreateInput;

    const createdProject = await prisma.projects.create({
      data,
      select: projectSelect,
    });

    return mapProject(createdProject);
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
  project: ProjectWriteInput,
): Promise<Project> {
  return run(async () => {
    const { author_id, tags, ...projectData } = project;
    const baseData = {
      ...projectData,
      author: {
        connect: {
          id: author_id,
        },
      },
    } satisfies Prisma.projectsUpdateInput;

    if (!Array.isArray(tags)) {
      const updatedProject = await prisma.projects.update({
        where: { id: projectId },
        data: baseData,
        select: projectSelect,
      });

      return mapProject(updatedProject);
    }

    const normalizedTags = normalizeTags(tags);

    const updatedProject = await prisma.$transaction(async (tx) => {
      await tx.projects.update({
        where: { id: projectId },
        data: {
          ...baseData,
          tags: {
            deleteMany: {},
          },
        },
      });

      if (normalizedTags.length === 0) {
        const projectWithoutTags = await tx.projects.findUnique({
          where: { id: projectId },
          select: projectSelect,
        });

        if (!projectWithoutTags) {
          throw new ProjectNotFoundError();
        }

        return projectWithoutTags;
      }

      return tx.projects.update({
        where: { id: projectId },
        data: {
          tags: {
            create: normalizedTags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        },
        select: projectSelect,
      });
    });

    return mapProject(updatedProject);
  });
}

async function like(projectId: number): Promise<Project> {
  return run(async () => {
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      select: {
        likes: true,
      },
    });

    if (!project) {
      throw new ProjectNotFoundError();
    }

    const likedProject = await prisma.projects.update({
      where: { id: projectId },
      data: { likes: (project.likes || 0) + 1 },
      select: projectSelect,
    });

    return mapProject(likedProject);
  });
}

async function destroy(projectId: number): Promise<void> {
  await run(async () => {
    // Manual cascade to satisfy FK constraints (comments, tags join table).
    await prisma.$transaction(async (tx) => {
      await tx.comments.deleteMany({ where: { project_id: projectId } });
      await tx.projects_tags.deleteMany({ where: { project_id: projectId } });
      await tx.projects.delete({ where: { id: projectId } });
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
