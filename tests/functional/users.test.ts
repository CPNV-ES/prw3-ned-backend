import request from "supertest";

jest.mock("../../src/routes/sessions.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/routes/projects.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

const createUserMock = jest.fn();

jest.mock("../../src/services/users.service", () => ({
  createUser: createUserMock,
}));

import { app } from "../../src/app";

describe("POST /api/users", () => {
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
});
