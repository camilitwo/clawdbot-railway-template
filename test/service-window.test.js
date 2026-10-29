import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const src = fs.readFileSync(new URL("../src/server.js", import.meta.url), "utf8");

test("gateway is not auto-started unless explicitly enabled", () => {
  assert.match(src, /CLAWDBOT_AUTOSTART_GATEWAY/);
  assert.match(src, /AUTO_START_GATEWAY && isWithinServiceWindow\(\)/);
});

test("service window uses America/Santiago timezone by default", () => {
  assert.match(src, /America\/Santiago/);
  assert.match(src, /Intl\.DateTimeFormat/);
  assert.match(src, /SERVICE_START_TIME/);
  assert.match(src, /SERVICE_STOP_TIME/);
});

test("service window scheduler stops and restarts the gateway at configured boundaries", () => {
  assert.match(src, /async function reconcileServiceWindow\(\)/);
  assert.match(src, /service window closed; stopping gateway/);
  assert.match(src, /await stopGatewayGracefully\(\{ administrative: true \}\)/);
  assert.match(src, /service window open; starting gateway/);
  assert.match(src, /await ensureGatewayRunning\(\)/);
  assert.match(src, /startServiceWindowScheduler\(\)/);
  assert.match(src, /clearInterval\(serviceWindowTimer\)/);
});

test("volume audit is opt-in and read-only", () => {
  assert.match(src, /OPENCLAW_VOLUME_AUDIT/);
  assert.match(src, /spawnSync\(/);
  assert.match(src, /\["-x", "-B1", "--max-depth=3", "\/data"\]/);
  assert.doesNotMatch(src, /volume-audit[^\n]*(rm|unlink|delete)/i);
});
