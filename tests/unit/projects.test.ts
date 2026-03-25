const prismaMock = {
  projects: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comments: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

class MockPrismaClientKnownRequestError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

jest.mock("../../src/utils/prisma", () => ({
  prisma: prismaMock,
}));

jest.mock("../../src/generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: MockPrismaClientKnownRequestError,
  },
}));

import { ProjectNotFoundError } from "../../src/errors/projects/project-not-found.error";
import { projectsService } from "../../src/services/projects.service";

const sampleProject = {
  id: 1,
  title: "Portfolio",
  summary: "Project summary",
  demo_url: "https://demo.example.com",
  repository_url: "https://github.com/example/repo",
  image_url: "https://images.example.com/p1.png",
  author_id: 42,
};

const createPayload = {
  title: sampleProject.title,
  summary: sampleProject.summary,
  demo_url: sampleProject.demo_url,
  repository_url: sampleProject.repository_url,
  image_url: sampleProject.image_url,
  author_id: sampleProject.author_id,
};

const sampleComment = {
  id: 1,
  content: "Nice project",
  created_at: new Date("2026-03-25T09:00:00.000Z"),
  author_id: 42,
  project_id: 1,
};

describe("Projects Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAll should return projects", async () => {
    prismaMock.projects.findMany.mockResolvedValue([sampleProject]);

    const result = await projectsService.getAll();

    expect(prismaMock.projects.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual([sampleProject]);
  });

  it("getAll should filter by name", async () => {
    prismaMock.projects.findMany.mockResolvedValue([sampleProject]);

    await projectsService.getAll({ name: "Port" });

    expect(prismaMock.projects.findMany).toHaveBeenCalledWith({
      where: {
        title: {
          contains: "Port",
        },
      },
    });
  });

  it("getAll should filter by tags", async () => {
    prismaMock.projects.findMany.mockResolvedValue([sampleProject]);

    await projectsService.getAll({ tags: ["react", "node"] });

    expect(prismaMock.projects.findMany).toHaveBeenCalledWith({
      where: {
        tags: {
          some: {
            tag: {
              name: {
                in: ["react", "node"],
              },
            },
          },
        },
      },
    });
  });

  it("getAll should order by created_at desc by default", async () => {
    prismaMock.projects.findMany.mockResolvedValue([sampleProject]);

    await projectsService.getAll({ sortBy: "date" });

    expect(prismaMock.projects.findMany).toHaveBeenCalledWith({
      orderBy: { created_at: "desc" },
    });
  });

  it("getAll should order by likes asc", async () => {
    prismaMock.projects.findMany.mockResolvedValue([sampleProject]);

    await projectsService.getAll({ sortBy: "likes", order: "asc" });

    expect(prismaMock.projects.findMany).toHaveBeenCalledWith({
      orderBy: { likes: "asc" },
    });
  });

  it("getAll should combine filters and ordering", async () => {
    prismaMock.projects.findMany.mockResolvedValue([sampleProject]);

    await projectsService.getAll({
      name: "Port",
      tags: ["react"],
      sortBy: "likes",
      order: "desc",
    });

    expect(prismaMock.projects.findMany).toHaveBeenCalledWith({
      where: {
        title: {
          contains: "Port",
        },
        tags: {
          some: {
            tag: {
              name: {
                in: ["react"],
              },
            },
          },
        },
      },
      orderBy: { likes: "desc" },
    });
  });

  it("getById should return one project", async () => {
    prismaMock.projects.findUnique.mockResolvedValue(sampleProject);

    const result = await projectsService.getById(1);

    expect(prismaMock.projects.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(sampleProject);
  });

  it("create should persist and return project", async () => {
    prismaMock.projects.create.mockResolvedValue(sampleProject);

    const result = await projectsService.create(createPayload);

    expect(prismaMock.projects.create).toHaveBeenCalledWith({
      data: createPayload,
    });
    expect(result).toEqual(sampleProject);
  });

  it("getComments should return project comments ordered by newest first", async () => {
    prismaMock.projects.findUnique.mockResolvedValue(sampleProject);
    prismaMock.comments.findMany.mockResolvedValue([sampleComment]);

    const result = await projectsService.getComments(1);

    expect(prismaMock.projects.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prismaMock.comments.findMany).toHaveBeenCalledWith({
      where: { project_id: 1 },
      orderBy: { created_at: "desc" },
    });
    expect(result).toEqual([sampleComment]);
  });

  it("getComments should throw ProjectNotFoundError when project does not exist", async () => {
    prismaMock.projects.findUnique.mockResolvedValue(null);

    await expect(projectsService.getComments(999)).rejects.toBeInstanceOf(
      ProjectNotFoundError,
    );
  });

  it("createComment should persist and return comment", async () => {
    prismaMock.projects.findUnique.mockResolvedValue(sampleProject);
    prismaMock.comments.create.mockResolvedValue(sampleComment);

    const result = await projectsService.createComment(1, {
      content: "Nice project",
      author_id: 42,
    });

    expect(prismaMock.projects.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prismaMock.comments.create).toHaveBeenCalledWith({
      data: {
        content: "Nice project",
        author_id: 42,
        project_id: 1,
      },
    });
    expect(result).toEqual(sampleComment);
  });

  it("createComment should throw ProjectNotFoundError when project does not exist", async () => {
    prismaMock.projects.findUnique.mockResolvedValue(null);

    await expect(
      projectsService.createComment(999, {
        content: "Nice project",
        author_id: 42,
      }),
    ).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it("update should persist and return updated project", async () => {
    const updated = { ...sampleProject, title: "Updated" };
    const updatePayload = { ...createPayload, title: "Updated" };
    prismaMock.projects.update.mockResolvedValue(updated);

    const result = await projectsService.update(1, updatePayload);

    expect(prismaMock.projects.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: updatePayload,
    });
    expect(result).toEqual(updated);
  });

  it("like should increment likes and return updated project", async () => {
    const projectWithLikes = { ...sampleProject, likes: 2 };
    const likedProject = { ...sampleProject, likes: 3 };
    prismaMock.projects.findUnique.mockResolvedValue(projectWithLikes);
    prismaMock.projects.update.mockResolvedValue(likedProject);

    const result = await projectsService.like(1);

    expect(prismaMock.projects.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prismaMock.projects.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { likes: 3 },
    });
    expect(result).toEqual(likedProject);
  });

  it("like should throw ProjectNotFoundError when project does not exist", async () => {
    prismaMock.projects.findUnique.mockResolvedValue(null);

    await expect(projectsService.like(999)).rejects.toBeInstanceOf(
      ProjectNotFoundError,
    );
  });

  it("destroy should delete project", async () => {
    prismaMock.projects.delete.mockResolvedValue(sampleProject);

    await projectsService.destroy(1);

    expect(prismaMock.projects.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it("update should map Prisma P2025 to ProjectNotFoundError", async () => {
    prismaMock.projects.update.mockRejectedValue(
      new MockPrismaClientKnownRequestError("not found", "P2025"),
    );

    await expect(
      projectsService.update(999, createPayload),
    ).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it("destroy should map Prisma P2025 to ProjectNotFoundError", async () => {
    prismaMock.projects.delete.mockRejectedValue(
      new MockPrismaClientKnownRequestError("not found", "P2025"),
    );

    await expect(projectsService.destroy(999)).rejects.toBeInstanceOf(
      ProjectNotFoundError,
    );
  });

  it("should rethrow non-P2025 errors", async () => {
    const dbError = new Error("db offline");
    prismaMock.projects.findMany.mockRejectedValue(dbError);

    await expect(projectsService.getAll()).rejects.toBe(dbError);
  });
});
