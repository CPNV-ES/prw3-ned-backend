import request from "supertest";
import { jest } from "@jest/globals";

const createSessionMock =
  jest.fn<
    (credentials: { username: string; password: string }) => Promise<unknown>
  >();
const getCurrentSessionMock = jest.fn<(token: string) => Promise<unknown>>();
const revokeSessionTokenMock = jest.fn<(token: string) => Promise<void>>();

jest.unstable_mockModule("../../src/services/sessions.service.js", () => ({
  createSession: createSessionMock,
  getCurrentSession: getCurrentSessionMock,
  revokeSessionToken: revokeSessionTokenMock,
}));

type AppModule = typeof import("../../src/app.js");

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
    ({ app } = await import("../../src/app.js"));
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
    revokeSessionTokenMock.mockResolvedValueOnce(undefined);

    await request(app)
      .delete("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(revokeSessionTokenMock).toHaveBeenCalledWith(token);
  });
});
