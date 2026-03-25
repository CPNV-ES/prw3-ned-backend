import request from "supertest";

jest.mock("../../src/routes/users.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/routes/projects.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

const createSessionMock: jest.MockedFunction<
  (credentials: { username: string; password: string }) => Promise<unknown>
> = jest.fn();
const getCurrentSessionMock: jest.MockedFunction<
  (token: string) => Promise<unknown>
> = jest.fn();
const revokeSessionTokenMock: jest.MockedFunction<
  (token: string) => Promise<void>
> = jest.fn();

jest.mock("../../src/services/sessions.service", () => ({
  createSession: createSessionMock,
  getCurrentSession: getCurrentSessionMock,
  revokeSessionToken: revokeSessionTokenMock,
}));

import { app } from "../../src/app";

const sessionResponse = {
  token: "test-token",
  expiresAt: new Date().toISOString(),
  user: { id: 1, name: "Test User", username: "test-user" },
};

const currentSessionResponse = {
  expiresAt: new Date().toISOString(),
  user: { id: 1, name: "Test User", username: "test-user" },
};

describe("/api/sessions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new session", async () => {
    const credentials = { username: "test-user", password: "password" };
    createSessionMock.mockResolvedValueOnce(sessionResponse);

    const response = await request(app)
      .post("/api/sessions")
      .send(credentials)
      .expect(200);

    expect(createSessionMock).toHaveBeenCalledWith(credentials);
    expect(response.body).toEqual(sessionResponse);
  });

  it("returns the current session when a bearer token is provided", async () => {
    const token = "current-session-token";
    getCurrentSessionMock.mockResolvedValueOnce(currentSessionResponse);

    const response = await request(app)
      .get("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(getCurrentSessionMock).toHaveBeenCalledWith(token);
    expect(response.body).toEqual(currentSessionResponse);
  });

  it("revokes the session token", async () => {
    const token = "revoke-session-token";
    revokeSessionTokenMock.mockResolvedValueOnce(undefined);

    await request(app)
      .delete("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(revokeSessionTokenMock).toHaveBeenCalledWith(token);
  });
});
