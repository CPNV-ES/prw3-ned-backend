import { getSystemStatus } from "../../src/services/health.service.js";

describe("Health Service", () => {
  it("should return ok status", () => {
    const result = getSystemStatus();

    expect(result.status).toBe("ok");
    expect(typeof result.uptime).toBe("number");
  });
});
