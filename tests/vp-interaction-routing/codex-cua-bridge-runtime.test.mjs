// Runtime behavior that needs a live upstream but not a real one: the output cap,
// the timeout that tears down the shared session, protocol-reserved argument
// keys, and the standalone CLI. A fake Codex binary stands in, so this runs
// anywhere.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { BridgeClient, bridgePath, fakeAppServerPath, toolText } from "./helpers/mcp-client.mjs";

function fakeEnv(extra = {}) {
  return { CODEX_CUA_BRIDGE_CODEX_BIN: fakeAppServerPath, ...extra };
}

async function withFake(env, run) {
  const client = new BridgeClient({ env: fakeEnv(env) });
  try {
    await client.initialize();
    await run(client);
  } finally {
    await client.close();
  }
}

test("oversized text is truncated and says so", async () => {
  await withFake({ CODEX_CUA_BRIDGE_MAX_CHARS: "500", FAKE_TEXT_LENGTH: "4000" }, async (client) => {
    const response = await client.callTool("list_apps", {}, 30000);
    const text = toolText(response);
    assert.match(text, /\[truncated by codex-cua-bridge: 4000 chars/);
    assert.match(text, /CODEX_CUA_BRIDGE_MAX_CHARS=500/);
    assert.ok(text.length < 4000, "the payload itself must actually be cut");
  });
});

test("text under the cap is returned whole, with no truncation notice", async () => {
  await withFake({ CODEX_CUA_BRIDGE_MAX_CHARS: "4000", FAKE_TEXT_LENGTH: "100" }, async (client) => {
    const text = toolText(await client.callTool("list_apps", {}, 30000));
    assert.doesNotMatch(text, /truncated/);
    assert.ok(text.includes("y".repeat(100)));
  });
});

test("a timed-out call reports the session reset and the bridge still works after", async () => {
  await withFake({ CODEX_CUA_BRIDGE_TIMEOUT_MS: "1000", FAKE_HANG: "1" }, async (client) => {
    const timedOut = await client.callTool("list_apps", {}, 30000);
    assert.equal(timedOut.result.isError, true);
    assert.match(toolText(timedOut), /timed out/);
    assert.match(
      toolText(timedOut),
      /app-server session was reset/,
      "a timeout must tear the shared session down, not just abandon the response",
    );

    // A second call must still be served, proving the reset rebuilt the session
    // rather than wedging it.
    const after = await client.callTool("list_apps", {}, 30000);
    assert.equal(after.result.isError, true, "the fake still hangs, so this also times out");
    assert.match(toolText(after), /timed out/);
  });
});

test("protocol-reserved keys are tolerated and never forwarded", async () => {
  await withFake({}, async (client) => {
    // Accepted without an unknown-property error...
    const accepted = await client.callTool("get_app_state", { app: "X", _meta: { trace: 1 } }, 30000);
    assert.notEqual(accepted.result?.isError, true, toolText(accepted));
    assert.doesNotMatch(toolText(accepted), /unknown property/);

    // ...and an underscore cannot smuggle a parameter the tool does not declare.
    const smuggled = await client.callTool(
      "get_app_state",
      { app: "X", _disableDiff: true },
      30000,
    );
    assert.doesNotMatch(toolText(smuggled), /unknown property/);
  });
});

test("the standalone CLI lists tools and explains itself without an upstream", () => {
  const help = spawnSync(process.execPath, [bridgePath, "--help"], { encoding: "utf8" });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /do not use this bridge/i);
  assert.match(help.stdout, /CODEX_CUA_BRIDGE_CODEX_BIN/);

  const list = spawnSync(process.execPath, [bridgePath, "--list"], { encoding: "utf8" });
  assert.equal(list.status, 0);
  const lines = list.stdout.trim().split("\n");
  assert.equal(lines.length, 12);
  assert.equal(lines.filter((line) => line.startsWith("read-only")).length, 3);
  assert.equal(lines.filter((line) => line.startsWith("mutating")).length, 9);
});

test("the CLI health check reports the upstream it actually reached", () => {
  const health = spawnSync(process.execPath, [bridgePath, "--health"], {
    encoding: "utf8",
    env: { ...process.env, ...fakeEnv() },
    timeout: 30000,
  });
  const report = JSON.parse(health.stdout);
  assert.equal(report.checks.app_server_handshake, "ok");
  assert.equal(report.checks.node_repl_configured, true);
  // The fake serves no sky surface, so health must call that unhealthy rather
  // than passing because the handshake worked.
  assert.match(report.verdict, /^unhealthy/);
  assert.notEqual(health.status, 0, "an unhealthy report must exit non-zero");
});

test("the CLI can invoke a single tool and rejects a bad tool name", () => {
  const called = spawnSync(process.execPath, [bridgePath, "--call", "list_apps", "{}"], {
    encoding: "utf8",
    env: { ...process.env, ...fakeEnv() },
    timeout: 30000,
  });
  assert.equal(called.status, 0, called.stderr);
  assert.match(called.stdout, /\[\]/);

  const bad = spawnSync(process.execPath, [bridgePath, "--call", "nope", "{}"], {
    encoding: "utf8",
    env: { ...process.env, ...fakeEnv() },
    timeout: 30000,
  });
  assert.notEqual(bad.status, 0);
  assert.match(bad.stderr, /unknown tool/);
});
