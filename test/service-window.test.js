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
