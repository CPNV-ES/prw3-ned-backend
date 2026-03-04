const test = require("node:test");
const assert = require("node:assert/strict");
const { getSystemStatus } = require("../src/services/health.service");

test("health service returns ok status", () => {
  const result = getSystemStatus();
  assert.equal(result.status, "ok");
});
