import request from "supertest";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

import { ProjectNotFoundError } from "../../src/errors/projects/project-not-found.error";
import {
  DEFAULT_PROJECT_IMAGE_PUBLIC_PATH,
  PROJECT_IMAGES_DIRECTORY,
} from "../../src/utils/project-images";

jest.mock("../../src/routes/users.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/routes/sessions.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

const getCurrentSessionMock = jest.fn();

jest.mock("../../src/services/sessions.service", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

jest.mock("../../src/services/projects.service", () => ({
  projectsService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    getComments: jest.fn(),
    createComment: jest.fn(),
    update: jest.fn(),
    like: jest.fn(),
    destroy: jest.fn(),
  },
}));

import { app } from "../../src/app";
import { projectsService } from "../../src/services/projects.service";

const mockedProjectsService = projectsService as jest.Mocked<
  typeof projectsService
>;

const sampleProject = {
  id: 1,
  title: "Portfolio",
  summary: "Project summary",
  demo_url: "https://demo.example.com",
  repository_url: "https://github.com/example/repo",
  image_url: "https://images.example.com/p1.png",
  likes: 0,
  tags: ["react", "node"],
  author_id: 42,
  author_name: "Alice",
};

const createPayload = {
  title: sampleProject.title,
  summary: sampleProject.summary,
  demo_url: sampleProject.demo_url,
  repository_url: sampleProject.repository_url,
};

const authHeader = { Authorization: "Bearer test-token" };
const pngBuffer = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c49444154789c6360000002000154a24f5a0000000049454e44ae426082",
  "hex",
);

function buildMultipartProjectRequest(method: "post" | "put", url: string) {
  return (
    request(app)
      // eslint-disable-next-line no-unexpected-multiline
      [method](url)
      .set(authHeader)
      .field("title", createPayload.title)
      .field("summary", createPayload.summary)
      .field("demo_url", createPayload.demo_url)
      .field("repository_url", createPayload.repository_url)
  );
}

const sampleComment = {
  id: 1,
  content: "Nice project",
  created_at: new Date("2026-03-25T09:00:00.000Z"),
  author_id: 42,
  project_id: 1,
};

describe("Projects Functional API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mkdirSync(PROJECT_IMAGES_DIRECTORY, { recursive: true });
    getCurrentSessionMock.mockResolvedValue({
      expiresAt: new Date().toISOString(),
      user: { id: 42, name: "Test User", username: "test-user" },
    });
  });

  it("rejects GET /api/projects when not authenticated", async () => {
    const response = await request(app).get("/api/projects");

    expect(mockedProjectsService.getAll).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Missing or invalid authorization header",
    });
  });

  it("GET /api/projects should return project list", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app).get("/api/projects").set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleProject]);
  });

  it("GET /api/projects should return 500 on unexpected service error", async () => {
    mockedProjectsService.getAll.mockRejectedValue(new Error("db fail"));

    const response = await request(app).get("/api/projects").set(authHeader);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("GET /api/projects should pass name filter to service", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app)
      .get("/api/projects?name=Port")
      .set(authHeader);

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({ name: "Port" });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should pass tags filter to service", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app)
      .get("/api/projects?tags=react,node")
      .set(authHeader);

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({
      tags: ["react", "node"],
    });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should pass ordering to service", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app)
      .get("/api/projects?sortBy=likes&order=asc")
      .set(authHeader);

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({
      sortBy: "likes",
      order: "asc",
    });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should default order to desc when sorting", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app)
      .get("/api/projects?sortBy=date")
      .set(authHeader);

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({
      sortBy: "date",
      order: "desc",
    });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should return 400 for invalid sortBy", async () => {
    const response = await request(app)
      .get("/api/projects?sortBy=wat")
      .set(authHeader);

    expect(mockedProjectsService.getAll).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid sortBy" });
  });

  it("GET /api/projects should return 400 for invalid order", async () => {
    const response = await request(app)
      .get("/api/projects?sortBy=likes&order=wat")
      .set(authHeader);

    expect(mockedProjectsService.getAll).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid order" });
  });

  it("GET /api/projects/:id should return one project", async () => {
    mockedProjectsService.getById.mockResolvedValue(sampleProject);

    const response = await request(app).get("/api/projects/1").set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(sampleProject);
  });

  it("GET /api/projects/:id should return 404 for missing project", async () => {
    mockedProjectsService.getById.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/projects/999")
      .set(authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("GET /api/projects/:id should return 500 on unexpected service error", async () => {
    mockedProjectsService.getById.mockRejectedValue(new Error("db fail"));

    const response = await request(app).get("/api/projects/1").set(authHeader);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("POST /api/projects should return 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set(authHeader)
      .send({ title: "Only title" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing required fields" });
  });

  it("POST /api/projects should use the default image when none is uploaded", async () => {
    const response = await buildMultipartProjectRequest(
      "post",
      "/api/projects",
    );

    expect(mockedProjectsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...createPayload,
        author_id: 42,
        image_url: expect.stringMatching(
          new RegExp(
            `^http://127\\.0\\.0\\.1:\\d+${DEFAULT_PROJECT_IMAGE_PUBLIC_PATH.replace(
              /\//g,
              "\\/",
            )}$`,
          ),
        ),
      }),
    );
    expect(response.status).toBe(201);
  });

  it("POST /api/projects should create a project", async () => {
    mockedProjectsService.create.mockImplementation(async (payload) => ({
      id: 1,
      ...payload,
    }));

    const response = await buildMultipartProjectRequest(
      "post",
      "/api/projects",
    ).attach("image", pngBuffer, {
      filename: "project.png",
      contentType: "image/png",
    });

    expect(mockedProjectsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...createPayload,
        author_id: 42,
        image_url: expect.stringMatching(
          /^http:\/\/127\.0\.0\.1:\d+\/storages\/projects\/.+\.png$/,
        ),
      }),
    );
    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: sampleProject.title,
        image_url: expect.stringContaining("/storages/projects/"),
      }),
    );
  });

  it("POST /api/projects should accept tag names array and pass normalized tags to service", async () => {
    mockedProjectsService.create.mockResolvedValue(sampleProject);

    const response = await request(app)
      .post("/api/projects")
      .set(authHeader)
      .send({ ...createPayload, tags: ["api", " dev ", "lok", "dev"] });

    expect(mockedProjectsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...createPayload,
        author_id: 42,
        image_url: expect.stringMatching(
          new RegExp(
            `^http://127\\.0\\.0\\.1:\\d+${DEFAULT_PROJECT_IMAGE_PUBLIC_PATH.replace(
              /\//g,
              "\\/",
            )}$`,
          ),
        ),
        tags: ["api", "dev", "lok", "dev"],
      }),
    );
    expect(response.status).toBe(201);
    expect(response.body).toEqual(sampleProject);
  });

  it("POST /api/projects should return 500 on unexpected service error", async () => {
    mockedProjectsService.create.mockRejectedValue(new Error("db fail"));

    const response = await buildMultipartProjectRequest(
      "post",
      "/api/projects",
    ).attach("image", pngBuffer, {
      filename: "project.png",
      contentType: "image/png",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("POST /api/projects should reject unsupported image types", async () => {
    const response = await buildMultipartProjectRequest(
      "post",
      "/api/projects",
    ).attach("image", Buffer.from("not-an-image"), {
      filename: "notes.txt",
      contentType: "text/plain",
    });

    expect(mockedProjectsService.create).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Only jpg, png, and webp images are allowed",
    });
  });

  it("POST /api/projects should reject images larger than the limit", async () => {
    const response = await buildMultipartProjectRequest(
      "post",
      "/api/projects",
    ).attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), {
      filename: "large.png",
      contentType: "image/png",
    });

    expect(mockedProjectsService.create).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: `Image exceeds max size of ${5 * 1024 * 1024} bytes`,
    });
  });

  it("GET /api/projects/:id/comments should return project comments", async () => {
    mockedProjectsService.getComments.mockResolvedValue([sampleComment]);

    const response = await request(app)
      .get("/api/projects/1/comments")
      .set(authHeader);

    expect(mockedProjectsService.getComments).toHaveBeenCalledWith(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...sampleComment,
        created_at: sampleComment.created_at.toISOString(),
      },
    ]);
  });

  it("GET /api/projects/:id/comments should return 404 for missing project", async () => {
    mockedProjectsService.getComments.mockRejectedValue(
      new ProjectNotFoundError(),
    );

    const response = await request(app)
      .get("/api/projects/999/comments")
      .set(authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("GET /api/projects/:id/comments should return 500 on unexpected service error", async () => {
    mockedProjectsService.getComments.mockRejectedValue(new Error("db fail"));

    const response = await request(app)
      .get("/api/projects/1/comments")
      .set(authHeader);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("POST /api/projects/:id/comments should return 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/projects/1/comments")
      .set(authHeader)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing required fields" });
  });

  it("POST /api/projects/:id/comments should create a comment", async () => {
    mockedProjectsService.createComment.mockResolvedValue(sampleComment);

    const response = await request(app)
      .post("/api/projects/1/comments")
      .set(authHeader)
      .send({ content: "Nice project", author_id: 999 });

    expect(mockedProjectsService.createComment).toHaveBeenCalledWith(1, {
      content: "Nice project",
      author_id: 42,
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...sampleComment,
      created_at: sampleComment.created_at.toISOString(),
    });
  });

  it("POST /api/projects/:id/comments should return 404 for missing project", async () => {
    mockedProjectsService.createComment.mockRejectedValue(
      new ProjectNotFoundError(),
    );

    const response = await request(app)
      .post("/api/projects/999/comments")
      .set(authHeader)
      .send({ content: "Nice project" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("POST /api/projects/:id/comments should return 500 on unexpected service error", async () => {
    mockedProjectsService.createComment.mockRejectedValue(new Error("db fail"));

    const response = await request(app)
      .post("/api/projects/1/comments")
      .set(authHeader)
      .send({ content: "Nice project" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("PUT /api/projects/:id should update a project", async () => {
    const oldFilename = "old-image.png";
    const oldImagePath = path.join(PROJECT_IMAGES_DIRECTORY, oldFilename);
    writeFileSync(oldImagePath, pngBuffer);
    mockedProjectsService.getById.mockResolvedValue({
      ...sampleProject,
      image_url: `http://127.0.0.1/storages/projects/${oldFilename}`,
    });
    mockedProjectsService.update.mockImplementation(async (id, payload) => ({
      id,
      ...payload,
    }));

    const response = await request(app)
      .put("/api/projects/1")
      .set(authHeader)
      .field("title", "Updated")
      .field("summary", createPayload.summary)
      .field("demo_url", createPayload.demo_url)
      .field("repository_url", createPayload.repository_url)
      .attach("image", pngBuffer, {
        filename: "updated.png",
        contentType: "image/png",
      });

    expect(mockedProjectsService.getById).toHaveBeenCalledWith(1);
    expect(mockedProjectsService.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        ...createPayload,
        title: "Updated",
        author_id: sampleProject.author_id,
        image_url: expect.stringMatching(
          /^http:\/\/127\.0\.0\.1:\d+\/storages\/projects\/.+\.png$/,
        ),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: "Updated",
        image_url: expect.stringContaining("/storages/projects/"),
      }),
    );
    expect(existsSync(oldImagePath)).toBe(false);
  });

  it("PUT /api/projects/:id should keep the current image when no new file is sent", async () => {
    const updatedProject = { ...sampleProject, title: "Updated" };
    mockedProjectsService.getById.mockResolvedValue(sampleProject);
    mockedProjectsService.update.mockResolvedValue(updatedProject);

    const response = await request(app)
      .put("/api/projects/1")
      .set(authHeader)
      .send({ title: "Updated" });

    expect(mockedProjectsService.update).toHaveBeenCalledWith(1, {
      title: "Updated",
      summary: sampleProject.summary,
      demo_url: sampleProject.demo_url,
      repository_url: sampleProject.repository_url,
      image_url: sampleProject.image_url,
      author_id: sampleProject.author_id,
    });
    expect(response.status).toBe(200);
  });

  it("PUT /api/projects/:id should accept empty tags array and pass it to service", async () => {
    const updatedProject = { ...sampleProject, tags: [] as string[] };
    mockedProjectsService.getById.mockResolvedValue(sampleProject);
    mockedProjectsService.update.mockResolvedValue(updatedProject);

    const response = await request(app)
      .put("/api/projects/1")
      .set(authHeader)
      .send({ ...createPayload, tags: [] });

    expect(mockedProjectsService.update).toHaveBeenCalledWith(1, {
      ...createPayload,
      image_url: sampleProject.image_url,
      author_id: sampleProject.author_id,
      tags: [],
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedProject);
  });

  it("PUT /api/projects/:id should return 404 for missing project", async () => {
    mockedProjectsService.getById.mockResolvedValue(null);

    const response = await request(app)
      .put("/api/projects/999")
      .set(authHeader)
      .send(createPayload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("PUT /api/projects/:id should return 500 on unexpected service error", async () => {
    mockedProjectsService.getById.mockResolvedValue(sampleProject);
    mockedProjectsService.update.mockRejectedValue(new Error("db fail"));

    const response = await request(app)
      .put("/api/projects/1")
      .set(authHeader)
      .send(createPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("PUT /api/projects/:id should return 403 for non-owner", async () => {
    mockedProjectsService.getById.mockResolvedValue({
      ...sampleProject,
      author_id: 999,
    });

    const response = await request(app)
      .put("/api/projects/1")
      .set(authHeader)
      .send(createPayload);

    expect(mockedProjectsService.update).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "You can only modify your own projects",
    });
  });

  it("POST /api/projects/:id/like should increment likes", async () => {
    const likedProject = { ...sampleProject, likes: 11 };
    mockedProjectsService.like.mockResolvedValue(likedProject);

    const response = await request(app)
      .post("/api/projects/1/like")
      .set(authHeader);

    expect(mockedProjectsService.like).toHaveBeenCalledWith(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(likedProject);
  });

  it("POST /api/projects/:id/like should return 500 on unexpected service error", async () => {
    mockedProjectsService.like.mockRejectedValue(new Error("db fail"));

    const response = await request(app)
      .post("/api/projects/1/like")
      .set(authHeader);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("POST /api/projects/:id/like should return 404 for missing project", async () => {
    mockedProjectsService.like.mockRejectedValue(new ProjectNotFoundError());

    const response = await request(app)
      .post("/api/projects/999/like")
      .set(authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("DELETE /api/projects/:id should return 204", async () => {
    mockedProjectsService.getById.mockResolvedValue(sampleProject);
    mockedProjectsService.destroy.mockResolvedValue();

    const response = await request(app)
      .delete("/api/projects/1")
      .set(authHeader);

    expect(mockedProjectsService.getById).toHaveBeenCalledWith(1);
    expect(mockedProjectsService.destroy).toHaveBeenCalledWith(1);
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /api/projects/:id should return 404 for missing project", async () => {
    mockedProjectsService.getById.mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/projects/999")
      .set(authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("DELETE /api/projects/:id should return 500 on unexpected service error", async () => {
    mockedProjectsService.getById.mockResolvedValue(sampleProject);
    mockedProjectsService.destroy.mockRejectedValue(new Error("db fail"));

    const response = await request(app)
      .delete("/api/projects/1")
      .set(authHeader);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("DELETE /api/projects/:id should return 403 for non-owner", async () => {
    mockedProjectsService.getById.mockResolvedValue({
      ...sampleProject,
      author_id: 999,
    });

    const response = await request(app)
      .delete("/api/projects/1")
      .set(authHeader);

    expect(mockedProjectsService.destroy).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "You can only delete your own projects",
    });
  });
});
