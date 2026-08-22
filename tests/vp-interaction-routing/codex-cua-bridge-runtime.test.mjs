// Runtime behavior that needs a live upstream but not a real one: the output cap,
// the timeout that tears down the shared session, protocol-reserved argument
// keys, and the standalone CLI. A fake Codex binary stands in, so this runs
// anywhere.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { BridgeClient, bridgePath, fakeAppServerPath, toolText } from "./helpers/mcp-client.mjs";

/** The argument object the bridge actually forwarded, recovered from the snippet. */
function forwardedArgs(argsLog) {
  const lines = readFileSync(argsLog, "utf8").trim().split("\n").filter(Boolean);
  return lines.map((line) => {
    const code = JSON.parse(line).code ?? "";
    const literal = code.match(/JSON\.parse\((".*?")\)/);
    assert.ok(literal, `no argument literal in: ${code}`);
    return JSON.parse(JSON.parse(literal[1]));
  });
}

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

test("a timed-out call actually replaces the upstream session", async () => {
  const dir = mkdtempSync(join(tmpdir(), "codex-cua-timeout-"));
  const pidLog = join(dir, "pids");
  try {
    await withFake(
      { CODEX_CUA_BRIDGE_TIMEOUT_MS: "1000", FAKE_HANG: "1", FAKE_PID_LOG: pidLog },
      async (client) => {
        const timedOut = await client.callTool("list_apps", {}, 30000);
        assert.equal(timedOut.result.isError, true);
        assert.match(toolText(timedOut), /timed out/);
        assert.match(toolText(timedOut), /app-server session was reset/);

        // A second call must be served by a different upstream process. Asserting
        // only on the message would still pass if the reset regressed to keeping
        // the hung process alive.
        const after = await client.callTool("list_apps", {}, 30000);
        assert.equal(after.result.isError, true, "the fake still hangs, so this also times out");

        const pids = readFileSync(pidLog, "utf8").trim().split("\n").filter(Boolean);
        assert.equal(pids.length, 2, `expected two upstream processes, saw ${pids.join()}`);
        assert.notEqual(pids[0], pids[1], "the hung process must be replaced, not reused");
      },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("protocol-reserved keys are tolerated and never reach the upstream call", async () => {
  const dir = mkdtempSync(join(tmpdir(), "codex-cua-args-"));
  const argsLog = join(dir, "args");
  try {
    await withFake({ FAKE_ARGS_LOG: argsLog }, async (client) => {
      const accepted = await client.callTool(
        "get_app_state",
        { app: "X", _meta: { trace: 1 }, _disableDiff: true },
        30000,
      );
      assert.notEqual(accepted.result?.isError, true, toolText(accepted));
      assert.doesNotMatch(toolText(accepted), /unknown property/);

      // The boundary claim is about what crossed it. Inspecting only the
      // response would pass even if the keys had been forwarded, because the
      // upstream ignores what it does not know.
      const crossings = forwardedArgs(argsLog);
      assert.equal(crossings.length, 1, "the upstream received one call to inspect");
      const crossed = crossings[0];
      assert.deepEqual(
        Object.keys(crossed).sort(),
        ["app", "disableDiff"],
        "only declared arguments may cross, and get_app_state maps full_tree to disableDiff",
      );
      assert.equal(crossed.app, "X");
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an accepted element_index reaches the upstream as the exact integer meant", async () => {
  const dir = mkdtempSync(join(tmpdir(), "codex-cua-index-"));
  const argsLog = join(dir, "args");
  try {
    await withFake({ FAKE_ARGS_LOG: argsLog }, async (client) => {
      // A numeric string is deliberately tolerated, but it must arrive upstream
      // as the number it names. Asserting only that validation passed would miss
      // a coercion that mangled the value, and targeting the wrong element is
      // exactly the defect this tolerance once caused.
      for (const [given, expected] of [
        ["1", 1],
        [1, 1],
        ["42", 42],
        [7, 7],
      ]) {
        const response = await client.callTool(
          "click",
          { app: "X", element_index: given },
          30000,
        );
        assert.notEqual(response.result?.isError, true, toolText(response));
      }
      const seen = forwardedArgs(argsLog).map((args) => args.element_index);
      assert.deepEqual(seen, [1, 1, 42, 7], "each value must arrive as the integer it names");
      for (const value of seen) {
        assert.equal(typeof value, "number", "the upstream must receive a number, not a string");
      }
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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
