import request from "supertest";

jest.mock("../../src/routes/users.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/routes/sessions.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

jest.mock("../../src/routes/projects.routes", () => {
  const { Router } = jest.requireActual("express");
  return { __esModule: true, default: Router() };
});

import { app } from "../../src/app";

describe("Health Functional API", () => {
  it("GET /api/health should return service status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ status: "ok" }));
    expect(typeof response.body.uptime).toBe("number");
  });
});
