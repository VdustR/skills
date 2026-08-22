import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const bridgePath = join(
  repoRoot,
  "skills",
  "vp-interaction-routing",
  "scripts",
  "codex-cua-bridge.mjs",
);

const CODEX_CANDIDATES = [
  "/Applications/ChatGPT.app/Contents/Resources/codex",
  join(process.env.HOME ?? "", "Applications/ChatGPT.app/Contents/Resources/codex"),
];

/**
 * Why the live suite is unavailable here, or null when it can run. Computer Use
 * needs macOS and the Codex binary inside ChatGPT.app, so CI on Linux skips
 * rather than fails.
 */
export function liveUnavailable() {
  if (process.platform !== "darwin") return `requires macOS, running on ${process.platform}`;
  const override = process.env.CODEX_CUA_BRIDGE_CODEX_BIN;
  if (override) {
    // A pointer to a missing binary must skip, not run and fail.
    return existsSync(override) ? null : `CODEX_CUA_BRIDGE_CODEX_BIN does not exist: ${override}`;
  }
  if (!CODEX_CANDIDATES.some((candidate) => existsSync(candidate))) {
    return "ChatGPT.app with the Computer Use component is not installed";
  }
  return null;
}

/** Minimal newline-delimited JSON-RPC client for driving the bridge over stdio. */
export class BridgeClient {
  constructor({ env = {} } = {}) {
    this.child = spawn(process.execPath, [bridgePath], {
      stdio: ["pipe", "pipe", "ignore"],
      env: { ...process.env, ...env },
    });
    this.nextId = 1;
    this.messages = [];
    this.waiters = [];
    this.buffer = "";
    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", (chunk) => {
      this.buffer += chunk;
      let index;
      while ((index = this.buffer.indexOf("\n")) !== -1) {
        const line = this.buffer.slice(0, index).trim();
        this.buffer = this.buffer.slice(index + 1);
        if (!line) continue;
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          continue;
        }
        const waiter = this.waiters.shift();
        if (waiter) waiter(message);
        else this.messages.push(message);
      }
    });
  }

  write(object) {
    this.child.stdin.write(`${JSON.stringify(object)}\n`);
  }

  /** Write a raw line, for malformed-input cases a JSON object cannot express. */
  writeRaw(line) {
    this.child.stdin.write(`${line}\n`);
  }

  /** Next message, or null once timeoutMs elapses with nothing received. */
  next(timeoutMs = 10000) {
    const queued = this.messages.shift();
    if (queued) return Promise.resolve(queued);
    return new Promise((resolvePromise) => {
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((entry) => entry !== waiter);
        resolvePromise(null);
      }, timeoutMs);
      const waiter = (message) => {
        clearTimeout(timer);
        resolvePromise(message);
      };
      this.waiters.push(waiter);
    });
  }

  request(method, params, timeoutMs) {
    const id = this.nextId++;
    this.write({ jsonrpc: "2.0", id, method, params });
    return this.next(timeoutMs);
  }

  notify(method, params) {
    this.write({ jsonrpc: "2.0", method, params });
  }

  async initialize(clientName = "test-client") {
    const result = await this.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: clientName, version: "1" },
    });
    this.notify("notifications/initialized");
    return result;
  }

  callTool(name, args, timeoutMs) {
    return this.request("tools/call", { name, arguments: args }, timeoutMs);
  }

  close() {
    this.child.stdin.end();
    this.child.kill();
  }
}

/** Concatenated text content of a tools/call result. */
export function toolText(message) {
  return (message?.result?.content ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}
