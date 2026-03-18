import request from "supertest";
import { jest } from "@jest/globals";

const expectedStatus = { status: "ok", uptime: 123 };
const getSystemStatusMock = jest.fn(() => ({ ...expectedStatus }));

jest.unstable_mockModule("../../src/services/health.service.js", () => ({
  getSystemStatus: getSystemStatusMock,
}));

type AppModule = typeof import("../../src/app.js");

let app: AppModule["app"];

describe("GET /api/health", () => {
  beforeAll(async () => {
    ({ app } = await import("../../src/app.js"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the current system status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(getSystemStatusMock).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(expectedStatus);
  });
});
