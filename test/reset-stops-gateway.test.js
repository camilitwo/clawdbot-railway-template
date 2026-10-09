import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("reset handler waits for lifecycle stop before deleting config", () => {
  const src = fs.readFileSync(new URL("../src/server.js", import.meta.url), "utf8");
  const idx = src.indexOf('app.post("/setup/api/reset"');
  assert.ok(idx >= 0);
  const window = src.slice(idx, idx + 900);
  assert.match(window, /await stopGatewayGracefully\(\)/);
  assert.ok(window.indexOf("stopGatewayGracefully") < window.indexOf("fs.rmSync"));
});
