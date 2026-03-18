import request from "supertest";
import { jest } from "@jest/globals";

const createSessionMock = jest.fn();
const getCurrentSessionMock = jest.fn();
const revokeSessionTokenMock = jest.fn();

jest.unstable_mockModule("../../src/services/sessions.service", () => ({
  createSession: createSessionMock,
  getCurrentSession: getCurrentSessionMock,
  revokeSessionToken: revokeSessionTokenMock,
}));

type AppModule = typeof import("../../src/app");

let app: AppModule["app"];

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
  beforeAll(async () => {
    ({ app } = await import("../../src/app"));
  });

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
    revokeSessionTokenMock.mockResolvedValueOnce();

    await request(app)
      .delete("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(revokeSessionTokenMock).toHaveBeenCalledWith(token);
  });
});
