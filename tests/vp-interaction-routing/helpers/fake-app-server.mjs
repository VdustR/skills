#!/usr/bin/env node
// A stand-in for the Codex binary, so the bridge's handling of reverse requests
// can be tested without ChatGPT.app. The bridge spawns this as
// `<bin> app-server --stdio` and speaks the app-server protocol to it.
//
// Driven by environment variables:
//   FAKE_REVERSE_METHOD  reverse request to issue before answering a tool call
//   FAKE_OBSERVED        file to append the bridge's reply to, as JSON lines
//   FAKE_REVERSE_PARAMS  optional JSON params for the reverse request
//   FAKE_TEXT_LENGTH     pad tool-call results to this many characters
//   FAKE_HANG            never answer a tool call, to exercise the timeout path
//   FAKE_ARGS_LOG        append the arguments of each tool call, as JSON lines
//   FAKE_PID_LOG         append this process's pid on startup, to prove replacement

import { appendFileSync } from "node:fs";
import { createInterface } from "node:readline";

const reverseMethod = process.env.FAKE_REVERSE_METHOD;
const observedPath = process.env.FAKE_OBSERVED;
const reverseParams = process.env.FAKE_REVERSE_PARAMS
  ? JSON.parse(process.env.FAKE_REVERSE_PARAMS)
  : { note: "fake reverse request" };

if (process.env.FAKE_PID_LOG) {
  appendFileSync(process.env.FAKE_PID_LOG, `${process.pid}\n`);
}

const textLength = Number.parseInt(process.env.FAKE_TEXT_LENGTH ?? "", 10);
const hang = process.env.FAKE_HANG === "1";

/** A tool result, padded when the test is exercising the output cap. */
function toolResult() {
  const text = Number.isFinite(textLength) ? "y".repeat(textLength) : "[]";
  return { content: [{ type: "text", text }] };
}

let reverseId = 9000;
const awaitingReverse = new Map();

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function record(entry) {
  if (observedPath) appendFileSync(observedPath, `${JSON.stringify(entry)}\n`);
}

createInterface({ input: process.stdin }).on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let message;
  try {
    message = JSON.parse(trimmed);
  } catch {
    return;
  }

  // A reply to a reverse request we issued: record exactly what the bridge said.
  if (message.id !== undefined && awaitingReverse.has(message.id)) {
    const pending = awaitingReverse.get(message.id);
    awaitingReverse.delete(message.id);
    record({
      method: pending.method,
      result: message.result ?? null,
      error: message.error ?? null,
    });
    // Now answer the tool call that triggered it.
    send({ id: pending.toolCallId, result: toolResult() });
    return;
  }

  if (message.method === "initialize") {
    send({ id: message.id, result: { userAgent: "fake-app-server" } });
    return;
  }
  if (message.method === "initialized") return;
  if (message.method === "thread/start") {
    send({ id: message.id, result: { threadId: "fake-thread" } });
    return;
  }
  if (message.method === "mcpServerStatus/list") {
    send({ id: message.id, result: { data: [{ name: "node_repl", tools: { js: {} } }] } });
    return;
  }
  if (message.method === "mcpServer/tool/call") {
    // Record what actually crossed the boundary, so a test can assert that
    // undeclared arguments never reach the upstream call.
    if (process.env.FAKE_ARGS_LOG) {
      appendFileSync(
        process.env.FAKE_ARGS_LOG,
        `${JSON.stringify(message.params?.arguments ?? null)}\n`,
      );
    }
    if (hang) return; // exercise the caller's timeout and session reset
    if (reverseMethod) {
      const id = reverseId++;
      awaitingReverse.set(id, { method: reverseMethod, toolCallId: message.id });
      send({ id, method: reverseMethod, params: reverseParams });
      return; // the tool call is answered once the bridge replies
    }
    send({ id: message.id, result: toolResult() });
    return;
  }
  if (message.id !== undefined) {
    send({ id: message.id, error: { code: -32601, message: `fake: ${message.method}` } });
  }
});
