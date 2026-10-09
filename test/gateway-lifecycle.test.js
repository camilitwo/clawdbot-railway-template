import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src = fs.readFileSync(new URL("../src/server.js", import.meta.url), "utf8");

test("gateway lifecycle serializes operations and tracks explicit states", () => {
  assert.match(src, /function runGatewayLifecycle\(operation\)/);
  for (const state of ["STOPPED", "STARTING", "RUNNING", "STOPPING", "RESTARTING", "WAITING_FOR_LEASE", "FAILED", "SHUTTING_DOWN"]) {
    assert.match(src, new RegExp(`${state}: "${state}"`));
  }
});

test("gateway shutdown waits for close and handles both termination signals", () => {
  assert.match(src, /await proc\.closed/);
  assert.match(src, /process\.on\("SIGTERM"/);
  assert.match(src, /process\.on\("SIGINT"/);
  assert.match(src, /if \(shutdownPromise\) return shutdownPromise/);
});

test("gateway retries are bounded and stale lease cleanup is conditional", () => {
  assert.match(src, /const GATEWAY_RETRY_DELAYS_MS = \[2000, 5000, 10000, 20000, 30000, 60000\]/);
  assert.match(src, /expires_at <= \?/);
  assert.doesNotMatch(src, /prepare\("DELETE FROM state_leases WHERE scope = \? AND lease_key = \?"\)/);
});