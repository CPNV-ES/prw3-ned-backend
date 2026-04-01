import request from "supertest";

import { SESSION_COOKIE_NAME } from "../../src/config/session-cookie";

jest.mock("../../src/routes/sessions.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/routes/projects.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

const createUserMock = jest.fn();
const listUsersMock = jest.fn();
const getUserByIdMock = jest.fn();
const getAllByAuthorIdMock = jest.fn();
const getCurrentSessionMock = jest.fn();

jest.mock("../../src/services/users.service", () => ({
  createUser: createUserMock,
  listUsers: listUsersMock,
  getUserById: getUserByIdMock,
}));

jest.mock("../../src/services/projects.service", () => ({
  projectsService: {
    getAllByAuthorId: getAllByAuthorIdMock,
  },
}));

jest.mock("../../src/services/sessions.service", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

import { app } from "../../src/app";

describe("/api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user and returns the public fields", async () => {
    const newUser = { id: 1, name: "Sample User", username: "sample" };
    const payload = {
      name: "Sample User",
      username: "sample",
      password: "password",
    };
    createUserMock.mockResolvedValueOnce(newUser);

    const response = await request(app)
      .post("/api/users")
      .send(payload)
      .expect(201);

    expect(createUserMock).toHaveBeenCalledWith(payload);
    expect(response.body).toEqual(newUser);
  });

  it("rejects GET /api/users when not authenticated", async () => {
    const response = await request(app).get("/api/users").expect(401);

    expect(listUsersMock).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "Missing or invalid authorization header",
    });
  });

  it("lists users when authenticated", async () => {
    const users = [{ id: 1, name: "Sample User", username: "sample" }];
    getCurrentSessionMock.mockResolvedValueOnce({
      expiresAt: new Date().toISOString(),
      user: users[0],
    });
    listUsersMock.mockResolvedValueOnce(users);

    const response = await request(app)
      .get("/api/users")
      .set("Cookie", `${SESSION_COOKIE_NAME}=test-token`)
      .expect(200);

    expect(getCurrentSessionMock).toHaveBeenCalledWith("test-token");
    expect(listUsersMock).toHaveBeenCalledWith(1, 10);
    expect(response.body).toEqual(users);
  });

  it("rejects GET /api/users/:id when not authenticated", async () => {
    const response = await request(app).get("/api/users/1").expect(401);

    expect(getUserByIdMock).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "Missing or invalid authorization header",
    });
  });

  it("gets one user when authenticated", async () => {
    const user = { id: 1, name: "Sample User", username: "sample" };
    getCurrentSessionMock.mockResolvedValueOnce({
      expiresAt: new Date().toISOString(),
      user,
    });
    getUserByIdMock.mockResolvedValueOnce(user);

    const response = await request(app)
      .get("/api/users/1")
      .set("Cookie", `${SESSION_COOKIE_NAME}=test-token`)
      .expect(200);

    expect(getCurrentSessionMock).toHaveBeenCalledWith("test-token");
    expect(getUserByIdMock).toHaveBeenCalledWith(1);
    expect(response.body).toEqual(user);
  });

  it("rejects GET /api/users/:id/projects when not authenticated", async () => {
    const response = await request(app)
      .get("/api/users/1/projects")
      .expect(401);

    expect(getUserByIdMock).not.toHaveBeenCalled();
    expect(getAllByAuthorIdMock).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "Missing or invalid authorization header",
    });
  });

  it("lists one user's projects when authenticated", async () => {
    const user = { id: 1, name: "Sample User", username: "sample" };
    const projects = [
      {
        id: 10,
        title: "Portfolio",
        summary: "Project summary",
        demo_url: "https://demo.example.com",
        repository_url: "https://github.com/example/repo",
        image_url: "https://images.example.com/p1.png",
        likes: 2,
        tags: ["react"],
        author_id: 1,
        author_name: "Sample User",
      },
    ];

    getCurrentSessionMock.mockResolvedValueOnce({
      expiresAt: new Date().toISOString(),
      user,
    });
    getUserByIdMock.mockResolvedValueOnce(user);
    getAllByAuthorIdMock.mockResolvedValueOnce(projects);

    const response = await request(app)
      .get("/api/users/1/projects")
      .set("Cookie", `${SESSION_COOKIE_NAME}=test-token`)
      .expect(200);

    expect(getCurrentSessionMock).toHaveBeenCalledWith("test-token");
    expect(getUserByIdMock).toHaveBeenCalledWith(1);
    expect(getAllByAuthorIdMock).toHaveBeenCalledWith(1);
    expect(response.body).toEqual([
      {
        id: 10,
        title: "Portfolio",
        summary: "Project summary",
        demo_url: "https://demo.example.com",
        repository_url: "https://github.com/example/repo",
        image_url: "https://images.example.com/p1.png",
        likes: 2,
        tags: ["react"],
        author: {
          id: 1,
          name: "Sample User",
        },
      },
    ]);
  });
});
