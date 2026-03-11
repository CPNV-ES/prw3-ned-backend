import request from "supertest";

jest.mock("../../src/services/projects.service", () => ({
  projectsService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

import { app } from "../../src/app";

describe("Health Functional API", () => {
  it("GET /api/health should return service status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ status: "ok" }));
    expect(typeof response.body.uptime).toBe("number");
  });
});
