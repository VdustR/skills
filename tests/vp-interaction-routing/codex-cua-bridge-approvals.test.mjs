// The bridge's reverse-request handling is its primary safety boundary: it must
// decline approvals on the user's behalf and refuse anything it cannot classify.
// A fake upstream stands in for the Codex binary so this runs anywhere.

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { BridgeClient, fakeAppServerPath } from "./helpers/mcp-client.mjs";

/**
 * Drive one tool call against a fake upstream that issues `reverseMethod`
 * before answering, and return what the bridge replied to it.
 */
async function observeReverseReply(reverseMethod, { autoApprove = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "codex-cua-approvals-"));
  const observed = join(dir, "observed.jsonl");
  const client = new BridgeClient({
    env: {
      CODEX_CUA_BRIDGE_CODEX_BIN: fakeAppServerPath,
      FAKE_REVERSE_METHOD: reverseMethod,
      FAKE_OBSERVED: observed,
      ...(autoApprove ? { CODEX_CUA_BRIDGE_AUTO_APPROVE: "1" } : {}),
    },
  });
  try {
    await client.initialize();
    await client.callTool("list_apps", {}, 30000);
    const lines = readFileSync(observed, "utf8").trim().split("\n").filter(Boolean);
    assert.equal(lines.length, 1, `expected one reverse exchange, saw ${lines.length}`);
    return JSON.parse(lines[0]);
  } finally {
    await client.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

test("an MCP elicitation is declined with the action shape it requires", async () => {
  const observed = await observeReverseReply("mcpServer/elicitation/request");
  assert.equal(observed.error, null, "a known approval must be answered, not refused");
  assert.deepEqual(observed.result, { action: "decline" });
});

test("command-execution and file-change approvals are denied with a rejection reason", async () => {
  for (const method of [
    "item/commandExecution/requestApproval",
    "item/fileChange/requestApproval",
  ]) {
    const observed = await observeReverseReply(method);
    assert.equal(observed.error, null, `${method} must be answered`);
    assert.ok(observed.result.decision.denied.rejection, `${method} states why it was denied`);
    assert.match(observed.result.decision.denied.rejection, /does not grant approvals/i);
  }
});

test("a user-input request is answered with no answers rather than invented ones", async () => {
  const observed = await observeReverseReply("item/tool/requestUserInput");
  assert.deepEqual(observed.result, { answers: {} });
});

test("an unclassifiable reverse request is refused, never answered with a guess", async () => {
  for (const method of ["some/future/request", "item/permissions/requestApproval", "openai/form"]) {
    const observed = await observeReverseReply(method);
    assert.equal(observed.result, null, `${method} must not receive a result`);
    assert.equal(observed.error.code, -32601, `${method} must be refused`);
    assert.match(observed.error.message, /answers only known approval requests/i);
  }
});

test("AUTO_APPROVE flips known approvals but cannot approve the unclassifiable", async () => {
  const elicitation = await observeReverseReply("mcpServer/elicitation/request", {
    autoApprove: true,
  });
  assert.deepEqual(elicitation.result, { action: "accept", content: {} });

  const command = await observeReverseReply("item/commandExecution/requestApproval", {
    autoApprove: true,
  });
  assert.equal(command.result.decision, "approved");

  // The important half: the override must not widen to request types the bridge
  // cannot classify, including any added by a future app-server.
  const unknown = await observeReverseReply("some/future/request", { autoApprove: true });
  assert.equal(unknown.result, null, "AUTO_APPROVE must not approve an unknown reverse request");
  assert.equal(unknown.error.code, -32601);
});

test("health reports every reverse request the bridge intercepted", async () => {
  const dir = mkdtempSync(join(tmpdir(), "codex-cua-approvals-health-"));
  const client = new BridgeClient({
    env: {
      CODEX_CUA_BRIDGE_CODEX_BIN: fakeAppServerPath,
      FAKE_REVERSE_METHOD: "mcpServer/elicitation/request",
      FAKE_OBSERVED: join(dir, "observed.jsonl"),
    },
  });
  try {
    await client.initialize();
    await client.callTool("list_apps", {}, 30000);
    const health = await client.callTool("health", {}, 30000);
    const report = JSON.parse(
      health.result.content.filter((p) => p.type === "text").map((p) => p.text).join(""),
    );
    const intercepted = report.checks.intercepted_server_requests;
    assert.ok(
      intercepted.some(
        (entry) => entry.method === "mcpServer/elicitation/request" && entry.outcome === "declined",
      ),
      `health must record the declined elicitation, saw ${JSON.stringify(intercepted)}`,
    );
    assert.equal(report.settings.auto_approve, false, "health reports the approval mode in force");
  } finally {
    await client.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
