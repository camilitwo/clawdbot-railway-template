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

test("gateway readiness observes process termination and cancels its probes", () => {
  assert.match(src, /proc\?\.once\("error", onProcessEnded\)/);
  assert.match(src, /proc\?\.once\("exit", onProcessEnded\)/);
  assert.match(src, /proc\?\.once\("close", onProcessEnded\)/);
  assert.match(src, /signal\?\.addEventListener\("abort", onAbort/);
  assert.match(src, /activeFetchController\?\.abort\(\)/);
  assert.match(src, /proc\?\.removeListener\("close", onProcessEnded\)/);
});

test("gateway retries are bounded and the wrapper never edits ownership leases", () => {
  assert.match(src, /const GATEWAY_RETRY_DELAYS_MS = \[2000, 5000, 10000, 20000, 30000, 60000\]/);
  assert.match(src, /scheduleGatewayRetry\(exitInfo\?\.code, exitInfo\?\.signal\)/);
  assert.doesNotMatch(src, /scheduleGatewayRetry\(null, null\)/);
  assert.doesNotMatch(src, /state_leases/);
  assert.doesNotMatch(src, /CLEAR_GATEWAY_OWNER_LEASE_ON_START/);
});