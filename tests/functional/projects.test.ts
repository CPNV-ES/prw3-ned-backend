import request from "supertest";

import { ProjectNotFoundError } from "../../src/errors/projects/project-not-found.error";

jest.mock("../../src/routes/users.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/routes/sessions.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/services/projects.service", () => ({
  projectsService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
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
  image_url: sampleProject.image_url,
  author_id: sampleProject.author_id,
};

describe("Projects Functional API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/projects should return project list", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app).get("/api/projects");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleProject]);
  });

  it("GET /api/projects should return 500 on unexpected service error", async () => {
    mockedProjectsService.getAll.mockRejectedValue(new Error("db fail"));

    const response = await request(app).get("/api/projects");

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("GET /api/projects should pass name filter to service", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app).get("/api/projects?name=Port");

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({ name: "Port" });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should pass tags filter to service", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app).get("/api/projects?tags=react,node");

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({
      tags: ["react", "node"],
    });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should pass ordering to service", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app).get(
      "/api/projects?sortBy=likes&order=asc",
    );

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({
      sortBy: "likes",
      order: "asc",
    });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should default order to desc when sorting", async () => {
    mockedProjectsService.getAll.mockResolvedValue([sampleProject]);

    const response = await request(app).get("/api/projects?sortBy=date");

    expect(mockedProjectsService.getAll).toHaveBeenCalledWith({
      sortBy: "date",
      order: "desc",
    });
    expect(response.status).toBe(200);
  });

  it("GET /api/projects should return 400 for invalid sortBy", async () => {
    const response = await request(app).get("/api/projects?sortBy=wat");

    expect(mockedProjectsService.getAll).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid sortBy" });
  });

  it("GET /api/projects should return 400 for invalid order", async () => {
    const response = await request(app).get(
      "/api/projects?sortBy=likes&order=wat",
    );

    expect(mockedProjectsService.getAll).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid order" });
  });

  it("GET /api/projects/:id should return one project", async () => {
    mockedProjectsService.getById.mockResolvedValue(sampleProject);

    const response = await request(app).get("/api/projects/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(sampleProject);
  });

  it("GET /api/projects/:id should return 404 for missing project", async () => {
    mockedProjectsService.getById.mockResolvedValue(null);

    const response = await request(app).get("/api/projects/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("GET /api/projects/:id should return 500 on unexpected service error", async () => {
    mockedProjectsService.getById.mockRejectedValue(new Error("db fail"));

    const response = await request(app).get("/api/projects/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("POST /api/projects should return 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({ title: "Only title" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing required fields" });
  });

  it("POST /api/projects should create a project", async () => {
    mockedProjectsService.create.mockResolvedValue(sampleProject);

    const response = await request(app)
      .post("/api/projects")
      .send(createPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(sampleProject);
  });

  it("POST /api/projects should accept tag names array and pass normalized tags to service", async () => {
    mockedProjectsService.create.mockResolvedValue(sampleProject);

    const response = await request(app)
      .post("/api/projects")
      .send({ ...createPayload, tags: ["api", " dev ", "lok", "dev"] });

    expect(mockedProjectsService.create).toHaveBeenCalledWith({
      ...createPayload,
      tags: ["api", "dev", "lok", "dev"],
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual(sampleProject);
  });

  it("POST /api/projects should return 500 on unexpected service error", async () => {
    mockedProjectsService.create.mockRejectedValue(new Error("db fail"));

    const response = await request(app)
      .post("/api/projects")
      .send(createPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("PUT /api/projects/:id should update a project", async () => {
    const updatedProject = { ...sampleProject, title: "Updated" };
    mockedProjectsService.update.mockResolvedValue(updatedProject);

    const response = await request(app)
      .put("/api/projects/1")
      .send({ ...createPayload, title: "Updated" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedProject);
  });

  it("PUT /api/projects/:id should accept empty tags array and pass it to service", async () => {
    const updatedProject = { ...sampleProject, tags: [] as string[] };
    mockedProjectsService.update.mockResolvedValue(updatedProject);

    const response = await request(app)
      .put("/api/projects/1")
      .send({ ...createPayload, tags: [] });

    expect(mockedProjectsService.update).toHaveBeenCalledWith(1, {
      ...createPayload,
      tags: [],
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedProject);
  });

  it("PUT /api/projects/:id should return 404 for missing project", async () => {
    mockedProjectsService.update.mockRejectedValue(new ProjectNotFoundError());

    const response = await request(app)
      .put("/api/projects/999")
      .send(createPayload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("PUT /api/projects/:id should return 500 on unexpected service error", async () => {
    mockedProjectsService.update.mockRejectedValue(new Error("db fail"));

    const response = await request(app)
      .put("/api/projects/1")
      .send(createPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("POST /api/projects/:id/like should increment likes", async () => {
    const likedProject = { ...sampleProject, likes: 11 };
    mockedProjectsService.like.mockResolvedValue(likedProject);

    const response = await request(app).post("/api/projects/1/like");

    expect(mockedProjectsService.like).toHaveBeenCalledWith(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(likedProject);
  });

  it("POST /api/projects/:id/like should return 500 on unexpected service error", async () => {
    mockedProjectsService.like.mockRejectedValue(new Error("db fail"));

    const response = await request(app).post("/api/projects/1/like");

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });

  it("POST /api/projects/:id/like should return 404 for missing project", async () => {
    mockedProjectsService.like.mockRejectedValue(new ProjectNotFoundError());

    const response = await request(app).post("/api/projects/999/like");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("DELETE /api/projects/:id should return 204", async () => {
    mockedProjectsService.destroy.mockResolvedValue();

    const response = await request(app).delete("/api/projects/1");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /api/projects/:id should return 404 for missing project", async () => {
    mockedProjectsService.destroy.mockRejectedValue(new ProjectNotFoundError());

    const response = await request(app).delete("/api/projects/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Project not found" });
  });

  it("DELETE /api/projects/:id should return 500 on unexpected service error", async () => {
    mockedProjectsService.destroy.mockRejectedValue(new Error("db fail"));

    const response = await request(app).delete("/api/projects/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ message: "db fail" }),
    );
  });
});
