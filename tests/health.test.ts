import assert from "node:assert/strict";
import test from "node:test";

import { getSystemStatus } from "../src/services/health.service";

test("health service returns ok status", () => {
  const result = getSystemStatus();
  assert.equal(result.status, "ok");
});
