#!/usr/bin/env node
/**
 * codex-cua-bridge
 *
 * Exposes macOS Codex Computer Use as a standard MCP stdio server so that a
 * non-Codex harness (Claude Code, Antigravity, or any MCP client) can call it
 * as ordinary tools.
 *
 * Codex itself must NOT use this bridge. Codex reaches the same capability
 * natively through its bundled `node_repl` + `@oai/sky` surface, which is
 * better integrated and carries the Computer Use confirmations policy. This
 * bridge exists only to open the capability to other harnesses.
 *
 * Path: MCP client -> this bridge -> `codex app-server --stdio`
 *       -> mcpServer/tool/call on the `node_repl` server -> `@oai/sky`.
 *
 * `node_repl` is used rather than the typed `computer-use` MCP server because
 * the typed server returns an inline screenshot on every read with no way to
 * opt out, while `node_repl` returns the screenshot as a file URL and lets the
 * bridge keep reads text-only.
 *
 * The app-server child must be spawned by the Codex binary shipped inside
 * ChatGPT.app: SkyComputerUseService gates callers on the responsible
 * process's code signature, so an unsigned parent fails with
 * "Sender process is not authenticated".
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const BRIDGE_NAME = "codex-cua-bridge";
const BRIDGE_VERSION = "0.1.0";
const MCP_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_MCP_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const MAX_CHARS = clampInt(process.env.CODEX_CUA_BRIDGE_MAX_CHARS, 40000, 500, 500000);
const CALL_TIMEOUT_MS = clampInt(process.env.CODEX_CUA_BRIDGE_TIMEOUT_MS, 60000, 1000, 600000);
const MAX_IMAGE_BYTES = clampInt(
  process.env.CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES,
  1500000,
  10000,
  20000000,
);
const MAX_FRAME_CHARS = clampInt(
  process.env.CODEX_CUA_BRIDGE_MAX_FRAME_CHARS,
  33554432,
  65536,
  268435456,
);
const AUTO_APPROVE = process.env.CODEX_CUA_BRIDGE_AUTO_APPROVE === "1";
const APPROVAL_HISTORY_LIMIT = 100;

const ROUTING_NOTICE = [
  "This bridge exists to give a NON-Codex harness access to macOS Codex Computer Use.",
  "If you are Codex, do not use this bridge. Use your own bundled Computer Use surface",
  "(`node_repl` with `@oai/sky`) directly: it is better integrated, avoids a redundant",
  "app-server hop, and keeps the Computer Use confirmations policy in the loop.",
].join(" ");

const SAFETY_NOTICE = [
  "This bridge performs no intent classification and enforces no action gate.",
  "A bridge call does not execute the Codex Computer Use confirmations policy.",
  "The calling agent stays responsible for its own authorization boundary:",
  "confirm consequential UI actions with the user before invoking a mutating tool.",
].join(" ");

function clampInt(raw, fallback, min, max) {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function log(...parts) {
  process.stderr.write(`[${BRIDGE_NAME}] ${parts.join(" ")}\n`);
}

/**
 * Split a stream into newline-delimited frames with a hard cap on the
 * unterminated remainder. `readline` accumulates a full line before emitting
 * it, so checking length in its callback cannot bound memory: input with no
 * newline grows without limit.
 */
function readFrames(stream, { maxChars, onFrame, onOverflow }) {
  let buffer = "";
  let resyncing = false;
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;

    // After an overflow the stream is mid-frame. Discard through the next
    // newline instead of gluing the truncated remainder onto the next frame.
    if (resyncing) {
      const boundary = buffer.indexOf("\n");
      if (boundary === -1) {
        buffer = "";
        return;
      }
      buffer = buffer.slice(boundary + 1);
      resyncing = false;
    }

    let index;
    while ((index = buffer.indexOf("\n")) !== -1) {
      const frame = buffer.slice(0, index);
      buffer = buffer.slice(index + 1);
      onFrame(frame);
    }
    if (buffer.length > maxChars) {
      const dropped = buffer.length;
      buffer = "";
      resyncing = true;
      onOverflow(dropped);
    }
  });
}

/* ------------------------------------------------------------------ *
 * Codex binary resolution
 * ------------------------------------------------------------------ */

const CODEX_CANDIDATES = [
  "/Applications/ChatGPT.app/Contents/Resources/codex",
  join(homedir(), "Applications/ChatGPT.app/Contents/Resources/codex"),
];

function resolveCodexBin() {
  const override = process.env.CODEX_CUA_BRIDGE_CODEX_BIN;
  if (override) {
    if (!existsSync(override)) {
      throw new Error(`CODEX_CUA_BRIDGE_CODEX_BIN does not exist: ${override}`);
    }
    return override;
  }
  for (const candidate of CODEX_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    "Could not find the Codex binary inside ChatGPT.app. Install the ChatGPT " +
      "desktop app with the Computer Use component, or set " +
      "CODEX_CUA_BRIDGE_CODEX_BIN to its `Contents/Resources/codex` path.",
  );
}

function resolveCodexHome() {
  return process.env.CODEX_HOME || join(homedir(), ".codex");
}

function readAppVersion(codexBin) {
  if (!codexBin) return null;
  // codexBin is <bundle>/Contents/Resources/codex
  const plist = codexBin.replace(/\/Contents\/Resources\/codex$/, "/Contents/Info.plist");
  if (!existsSync(plist)) return null;
  const xml = readFileSync(plist, "utf8");
  const match = xml.match(
    /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]*)<\/string>/,
  );
  return match ? match[1] : null;
}

/* ------------------------------------------------------------------ *
 * Reverse requests from app-server
 * ------------------------------------------------------------------ */

const REJECTION =
  `${BRIDGE_NAME} does not grant approvals on the user's behalf. The calling ` +
  "agent must obtain confirmation from the user and retry.";

/**
 * Every app-server server request has its own response shape, so a single
 * generic reply is wrong for most of them. Only the methods listed here are
 * approval decisions the bridge is willing to answer; anything else, including
 * a method added by a future app-server version, is refused as unsupported so
 * an unknown request is never silently approved.
 */
const APPROVAL_RESPONDERS = {
  "item/commandExecution/requestApproval": (approve) =>
    approve ? { decision: "approved" } : { decision: { denied: { rejection: REJECTION } } },
  "item/fileChange/requestApproval": (approve) =>
    approve ? { decision: "approved" } : { decision: { denied: { rejection: REJECTION } } },
  "mcpServer/elicitation/request": (approve) =>
    approve ? { action: "accept", content: {} } : { action: "decline" },
  "item/tool/requestUserInput": () => ({ answers: {} }),
};

/* ------------------------------------------------------------------ *
 * app-server JSON-RPC client
 * ------------------------------------------------------------------ */

class AppServerClient {
  constructor() {
    // Resolution failure must not crash startup: the MCP server still has to
    // answer initialize and tools/list, and report the cause through `health`.
    this.codexBin = null;
    this.codexBinError = null;
    try {
      this.codexBin = resolveCodexBin();
    } catch (err) {
      this.codexBinError = err;
    }
    this.child = null;
    this.nextId = 1;
    this.pending = new Map();
    this.threadId = null;
    this.threadPromise = null;
    this.interceptedServerRequests = [];
    this.startPromise = null;
  }

  async start() {
    if (this.startPromise) return this.startPromise;
    // A cached rejected promise would wedge every later call, and the child's
    // exit handler cannot clear it when the child is still alive and only the
    // initialize handshake failed.
    this.startPromise = this.#start().catch((err) => {
      this.startPromise = null;
      const child = this.child;
      this.child = null;
      child?.kill();
      throw err;
    });
    return this.startPromise;
  }

  async #start() {
    if (this.codexBinError) throw this.codexBinError;
    const env = { ...process.env, CODEX_HOME: resolveCodexHome() };
    this.child = spawn(this.codexBin, ["app-server", "--stdio"], {
      stdio: ["pipe", "pipe", "pipe"],
      env,
    });

    const child = this.child;
    const fail = (reason) => {
      // Events from a superseded child must not clear the current session.
      if (this.child !== child) {
        log(`ignoring event from superseded app-server: ${reason}`);
        return;
      }
      log(reason);
      for (const [, entry] of this.pending) {
        clearTimeout(entry.timer);
        entry.reject(new Error(reason));
      }
      this.pending.clear();
      this.child = null;
      this.startPromise = null;
      this.threadId = null;
      this.threadPromise = null;
    };

    // Without an `error` listener a failed spawn raises an uncaught exception
    // and takes the whole bridge down.
    child.on("error", (err) => fail(`app-server failed to start: ${err.message}`));
    child.on("exit", (code, signal) =>
      fail(`app-server exited (code=${code} signal=${signal})`),
    );
    child.stdin.on("error", (err) => log(`app-server stdin error: ${err.message}`));

    readFrames(child.stdout, {
      maxChars: MAX_FRAME_CHARS,
      onOverflow: (dropped) =>
        log(`discarded ${dropped} unterminated chars from app-server stdout`),
      onFrame: (line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let msg;
        try {
          msg = JSON.parse(trimmed);
        } catch {
          return; // non-JSON banner output
        }
        this.#handle(msg);
      },
    });

    // app-server stderr is diagnostic only; surface it without mixing into stdout.
    readFrames(child.stderr, {
      maxChars: MAX_FRAME_CHARS,
      onOverflow: () => {},
      onFrame: (line) => {
        if (process.env.CODEX_CUA_BRIDGE_VERBOSE === "1") log("app-server:", line);
      },
    });

    await this.request("initialize", {
      clientInfo: { name: BRIDGE_NAME, version: BRIDGE_VERSION },
    });
    this.notify("initialized", {});
  }

  #handle(msg) {
    if (msg === null || typeof msg !== "object" || Array.isArray(msg)) {
      log("ignoring non-object frame from app-server");
      return;
    }
    if (msg.id !== undefined && msg.method) {
      this.#handleServerRequest(msg);
      return;
    }
    if (msg.id !== undefined) {
      const entry = this.pending.get(msg.id);
      if (!entry) return;
      this.pending.delete(msg.id);
      clearTimeout(entry.timer);
      if (msg.error) entry.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else entry.resolve(msg.result);
    }
  }

  /**
   * app-server can ask the client to decide something. The bridge is not a user
   * and must not stand in for one, so a known approval request is declined by
   * default and an unknown request is refused outright rather than answered
   * with a guess.
   */
  #handleServerRequest(msg) {
    const responder = APPROVAL_RESPONDERS[msg.method];
    const outcome = !responder ? "unsupported" : AUTO_APPROVE ? "approved" : "declined";
    this.#recordServerRequest({ method: msg.method, outcome });
    log(`server request ${msg.method} -> ${outcome}`);

    if (!responder) {
      this.#write({
        id: msg.id,
        error: {
          code: -32601,
          message:
            `${BRIDGE_NAME} does not implement ${msg.method}. The bridge answers only ` +
            "known approval requests and refuses anything it cannot classify.",
        },
      });
      return;
    }
    this.#write({ id: msg.id, result: responder(AUTO_APPROVE) });
  }

  #recordServerRequest(entry) {
    this.interceptedServerRequests.push(entry);
    if (this.interceptedServerRequests.length > APPROVAL_HISTORY_LIMIT) {
      this.interceptedServerRequests.splice(
        0,
        this.interceptedServerRequests.length - APPROVAL_HISTORY_LIMIT,
      );
    }
  }

  #write(obj, onError) {
    if (!this.child) throw new Error("app-server is not running");
    // app-server accepts frames with or without the version tag and omits it in
    // its own replies, so it is JSON-RPC-like rather than strict. Sending it is
    // verified-harmless and stays correct if app-server ever tightens.
    const frame = JSON.stringify({ jsonrpc: "2.0", ...obj });
    this.child.stdin.write(`${frame}\n`, (err) => {
      if (err) onError?.(err);
    });
  }

  notify(method, params = {}) {
    this.#write({ method, params });
  }

  request(method, params = {}, timeoutMs = CALL_TIMEOUT_MS) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        const err = new Error(`app-server request timed out after ${timeoutMs}ms: ${method}`);
        err.timedOut = true;
        reject(err);
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      const failWrite = (err) => {
        const entry = this.pending.get(id);
        if (!entry) return;
        this.pending.delete(id);
        clearTimeout(entry.timer);
        entry.reject(new Error(`failed to write ${method} to app-server: ${err.message}`));
      };
      try {
        this.#write({ id, method, params }, failWrite);
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(err);
      }
    });
  }

  async ensureThread() {
    await this.start();
    if (this.threadId) return this.threadId;
    // Concurrent first calls must not each start a thread.
    this.threadPromise ??= this.#startThread();
    try {
      return await this.threadPromise;
    } catch (err) {
      this.threadPromise = null;
      throw err;
    }
  }

  async #startThread() {
    const result = await this.request("thread/start", {
      cwd: tmpdir(),
      ephemeral: true,
    });
    this.threadId = result?.threadId ?? result?.thread?.id ?? result?.id;
    if (!this.threadId) {
      throw new Error(`thread/start returned no thread id: ${JSON.stringify(result)}`);
    }
    return this.threadId;
  }

  async callMcpTool(server, tool, args) {
    const threadId = await this.ensureThread();
    return this.request("mcpServer/tool/call", {
      server,
      threadId,
      tool,
      arguments: args,
    });
  }

  async listMcpServers() {
    await this.start();
    return this.request("mcpServerStatus/list", {});
  }

  /**
   * Abandon the current app-server child and its node_repl session. Used after a
   * timeout: the upstream snippet may still be running against shared REPL
   * state, so the session cannot be reused.
   */
  async reset(reason) {
    log(`resetting app-server session: ${reason}`);
    const child = this.child;
    this.child = null;
    this.startPromise = null;
    this.threadId = null;
    this.threadPromise = null;
    for (const [, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(new Error(`app-server session reset: ${reason}`));
    }
    this.pending.clear();
    if (!child) return;
    await new Promise((resolve) => {
      const done = setTimeout(resolve, 2000);
      child.once("exit", () => {
        clearTimeout(done);
        resolve();
      });
      child.kill();
    });
  }

  stop() {
    if (this.child) this.child.kill();
  }
}

/* ------------------------------------------------------------------ *
 * sky (Computer Use) surface over node_repl
 * ------------------------------------------------------------------ */

const SKY_BOOTSTRAP = 'globalThis.sky ??= (await import("@oai/sky")).sky;';

/** Extract plain text from an MCP CallToolResult, tolerating shape drift. */
function resultText(result) {
  const content = result?.content ?? result?.result?.content;
  if (Array.isArray(content)) {
    const text = content
      .filter((c) => c?.type === "text" && typeof c.text === "string")
      .map((c) => c.text)
      .join("\n");
    if (text) return text;
  }
  if (typeof result?.text === "string") return result.text;
  return JSON.stringify(result ?? null);
}

function isErrorResult(result) {
  return result?.isError === true || result?.result?.isError === true;
}

class Sky {
  constructor(appServer) {
    this.appServer = appServer;
    this.queue = Promise.resolve();
  }

  /**
   * node_repl is one persistent JavaScript session shared by every call, and
   * each snippet assigns the same scratch variables. Concurrent calls would
   * interleave and read each other's state, so execution is serialized.
   */
  #serialize(task) {
    const run = this.queue.then(task, task);
    this.queue = run.then(
      () => {},
      () => {},
    );
    return run;
  }

  /** Run JS in the persistent node_repl session and return its written text. */
  js(code) {
    return this.#serialize(async () => {
      try {
        const result = await this.appServer.callMcpTool("node_repl", "js", { code });
        const text = resultText(result);
        if (isErrorResult(result)) throw new Error(text);
        return text;
      } catch (err) {
        // A timed-out call may still be executing upstream against the shared
        // REPL state. Tear the session down before the queue is released, so the
        // next call cannot observe or collide with it.
        if (err?.timedOut) {
          await this.appServer.reset(`timed out: ${err.message}`);
          err.message += " (app-server session was reset)";
        }
        throw err;
      }
    });
  }

  /**
   * Call one sky function. Arguments cross into JS as a JSON literal parsed at
   * runtime, so no caller-supplied value is ever interpolated as code.
   */
  async call(fn, args) {
    const literal = JSON.stringify(JSON.stringify(args ?? {}));
    const code = [
      SKY_BOOTSTRAP,
      `var __args = JSON.parse(${literal});`,
      `var __out = await sky.${fn}(__args);`,
      'nodeRepl.write(typeof __out === "undefined" ? "ok" : JSON.stringify(__out));',
    ].join("\n");
    return this.js(code);
  }

  async listApps() {
    const code = [
      SKY_BOOTSTRAP,
      "var __out = await sky.list_apps();",
      "nodeRepl.write(JSON.stringify(__out));",
    ].join("\n");
    return this.js(code);
  }

  /** Reflect the real upstream API surface instead of trusting a hardcoded list. */
  async surface() {
    const code = [
      SKY_BOOTSTRAP,
      'nodeRepl.write(JSON.stringify(Object.keys(sky).sort()));',
    ].join("\n");
    return JSON.parse(await this.js(code));
  }
}

/* ------------------------------------------------------------------ *
 * Tool definitions
 * ------------------------------------------------------------------ */

const APP_PROP = {
  type: "string",
  description:
    "Target app as display name, bundle identifier, or full app path. " +
    "get_app_state launches it in the background if it is not running.",
};
const ELEMENT_INDEX_PROP = {
  type: "integer",
  description:
    "element_index from the most recent get_app_state accessibility text. " +
    "Must be an integer. Re-read state after any action before reusing indexes.",
};

const MUTATING = true;

const TOOLS = [
  {
    name: "health",
    mutating: false,
    description:
      "Verify the bridge end to end and report the upstream inventory: Codex binary, " +
      "ChatGPT.app version, app-server handshake, thread id, configured MCP servers, " +
      "and the live @oai/sky function list. Run this before relying on the bridge.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_apps",
    mutating: false,
    description:
      "List apps known to Computer Use. Prefer calling get_app_state with a name " +
      "directly; use this only when the app identifier cannot be guessed.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_app_state",
    mutating: false,
    description:
      "Read an app's accessibility tree as text. Returns a diff against the previous " +
      "read by default, which is far cheaper on large UIs; pass full_tree to force a " +
      "complete tree. The screenshot stays out of the response unless include_screenshot " +
      "is set; its file path is always reported so the caller can read it separately.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        full_tree: {
          type: "boolean",
          description:
            "Return the complete accessibility tree instead of a diff. Use after any " +
            "read whose text was discarded, and whenever indexes must be re-derived.",
        },
        include_screenshot: {
          type: "boolean",
          description:
            "Embed the screenshot as an image in the response. Costs a large amount of " +
            "context; leave off unless the accessibility text is insufficient.",
        },
      },
      required: ["app"],
      additionalProperties: false,
    },
  },
  {
    name: "click",
    mutating: MUTATING,
    description:
      "Click an element by element_index, or a point by x/y. Prefer element_index; " +
      "fall back to coordinates only when accessibility actions are unavailable.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        element_index: ELEMENT_INDEX_PROP,
        x: { type: "number", description: "Screen x, only when element_index is unusable." },
        y: { type: "number", description: "Screen y, only when element_index is unusable." },
        mouse_button: { type: "string", enum: ["left", "right", "middle", "l", "r", "m"] },
        click_count: { type: "integer", minimum: 1, maximum: 3 },
      },
      required: ["app"],
      additionalProperties: false,
    },
  },
  {
    name: "type_text",
    mutating: MUTATING,
    description:
      "Type text into the app's focused element. A \\n or \\r simulates Return, which " +
      "many composers and forms treat as submit; use paste for multiline content.",
    inputSchema: {
      type: "object",
      properties: { app: APP_PROP, text: { type: "string" } },
      required: ["app", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "press_key",
    mutating: MUTATING,
    description:
      "Press a key or combination in the app, xdotool-style: \"Return\", \"Tab\", " +
      "\"super+c\", \"Up\", \"KP_0\". App-scoped, so it cannot fire global shortcuts.",
    inputSchema: {
      type: "object",
      properties: { app: APP_PROP, key: { type: "string" } },
      required: ["app", "key"],
      additionalProperties: false,
    },
  },
  {
    name: "set_value",
    mutating: MUTATING,
    description: "Set an element's value directly, replacing its current contents.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        element_index: ELEMENT_INDEX_PROP,
        value: { type: "string" },
      },
      required: ["app", "element_index", "value"],
      additionalProperties: false,
    },
  },
  {
    name: "select_text",
    mutating: MUTATING,
    description:
      "Select matching text inside an editable element, or place the cursor before or " +
      "after it. Use prefix/suffix to disambiguate repeated matches.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        element_index: ELEMENT_INDEX_PROP,
        text: { type: "string" },
        prefix: { type: "string" },
        suffix: { type: "string" },
        selection_type: { type: "string", enum: ["text", "cursor_before", "cursor_after"] },
      },
      required: ["app", "element_index", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "scroll",
    mutating: MUTATING,
    description: "Scroll an element by whole pages in one direction.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        element_index: ELEMENT_INDEX_PROP,
        direction: {
          type: "string",
          enum: ["up", "down", "left", "right", "u", "d", "l", "r"],
        },
        pages: { type: "number" },
      },
      required: ["app", "element_index", "direction"],
      additionalProperties: false,
    },
  },
  {
    name: "drag",
    mutating: MUTATING,
    description: "Drag from one screen point to another within the app.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        from_x: { type: "number" },
        from_y: { type: "number" },
        to_x: { type: "number" },
        to_y: { type: "number" },
      },
      required: ["app", "from_x", "from_y", "to_x", "to_y"],
      additionalProperties: false,
    },
  },
  {
    name: "paste",
    mutating: MUTATING,
    description:
      "Paste content through the system pasteboard, then restore the previous clipboard. " +
      "Preferred for formatted or multiline text.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        text: { type: "string" },
        format: { type: "string", enum: ["text", "md", "html"] },
      },
      required: ["app", "text", "format"],
      additionalProperties: false,
    },
  },
  {
    name: "perform_secondary_action",
    mutating: MUTATING,
    description:
      "Invoke a non-click accessibility action the element actually exposes, such as " +
      "expanding a disclosure row or showing a menu. Do not guess action names: use one " +
      "listed for that element in the accessibility text.",
    inputSchema: {
      type: "object",
      properties: {
        app: APP_PROP,
        element_index: ELEMENT_INDEX_PROP,
        action: { type: "string" },
      },
      required: ["app", "element_index", "action"],
      additionalProperties: false,
    },
  },
];

const TOOL_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

/**
 * The upstream sky functions the exposed tools depend on. `health` compares the
 * reflected surface against this list, so a renamed or removed upstream
 * function is reported as a compatibility break rather than passing because the
 * reflection still returned an array.
 */
const REQUIRED_SKY_FUNCTIONS = [
  "list_apps",
  "get_app_state",
  ...TOOLS.filter((t) => t.mutating).map((t) => t.name),
];

/* ------------------------------------------------------------------ *
 * Tool execution
 * ------------------------------------------------------------------ */

function cap(text) {
  if (typeof text !== "string") return String(text ?? "");
  if (text.length <= MAX_CHARS) return text;
  return (
    `${text.slice(0, MAX_CHARS)}\n\n[truncated by ${BRIDGE_NAME}: ${text.length} chars ` +
    `exceeded CODEX_CUA_BRIDGE_MAX_CHARS=${MAX_CHARS}. Narrow the target app or window.]`
  );
}

/**
 * The upstream sky API rejects a string element_index even though callers
 * routinely send one, so numbers are normalized here and rejected loudly when
 * they are not actually numeric.
 */
function coerceIntegers(args) {
  const out = { ...args };
  for (const key of ["element_index", "click_count"]) {
    const raw = out[key];
    if (raw === undefined) continue;
    // Number() maps null, false and "" to 0, which would silently target
    // element 0 instead of reporting a bad argument.
    const numeric =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw.trim() !== ""
          ? Number(raw)
          : Number.NaN;
    if (!Number.isInteger(numeric)) {
      throw new Error(`${key} must be an integer, received ${JSON.stringify(raw) ?? typeof raw}`);
    }
    out[key] = numeric;
  }
  return out;
}

const IMAGE_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function readScreenshot(url) {
  let path;
  try {
    path = url.startsWith("file://") ? fileURLToPath(url) : url;
  } catch {
    return null;
  }
  if (!existsSync(path)) return null;
  // Check the size before allocating: reading first would defeat the cap.
  const size = statSync(path).size;
  if (size > MAX_IMAGE_BYTES) {
    return {
      path,
      tooLarge: `screenshot is ${size} bytes, over ` +
        `CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES=${MAX_IMAGE_BYTES}; read it from ${path} instead`,
    };
  }
  const bytes = readFileSync(path);
  const ext = (basename(path).match(/\.[a-z]+$/i) || [""])[0].toLowerCase();
  return {
    path,
    mimeType: IMAGE_MIME[ext] || "application/octet-stream",
    data: bytes.toString("base64"),
  };
}

async function runTool(ctx, name, rawArgs) {
  const args = coerceIntegers(rawArgs ?? {});
  const { sky } = ctx;

  if (name === "health") return runHealth(ctx);

  if (name === "list_apps") {
    return { content: [{ type: "text", text: cap(await sky.listApps()) }] };
  }

  if (name === "get_app_state") {
    const { app, full_tree = false, include_screenshot = false } = args;
    const raw = await sky.call("get_app_state", { app, disableDiff: full_tree === true });
    let state;
    try {
      state = JSON.parse(raw);
    } catch {
      return { content: [{ type: "text", text: cap(raw) }] };
    }
    const content = [
      {
        type: "text",
        text: cap(
          [
            `app: ${state.app ?? app}`,
            full_tree ? "read: full tree" : "read: diff against previous read",
            state.screenshot?.url ? `screenshot: ${state.screenshot.url}` : "screenshot: none",
            "",
            state.text ?? "",
          ].join("\n"),
        ),
      },
    ];
    if (include_screenshot && state.screenshot?.url) {
      const shot = readScreenshot(state.screenshot.url);
      if (shot?.data) content.push({ type: "image", data: shot.data, mimeType: shot.mimeType });
      else if (shot?.tooLarge) content.push({ type: "text", text: shot.tooLarge });
      else content.push({ type: "text", text: `screenshot unreadable: ${state.screenshot.url}` });
    }
    return { content };
  }

  const tool = TOOL_BY_NAME.get(name);
  if (!tool) throw new Error(`unknown tool: ${name}`);
  return { content: [{ type: "text", text: cap(await sky.call(name, args)) }] };
}

async function runHealth(ctx) {
  const { sky, appServer } = ctx;
  const report = {
    bridge: { name: BRIDGE_NAME, version: BRIDGE_VERSION },
    routing_notice: ROUTING_NOTICE,
    safety_notice: SAFETY_NOTICE,
    settings: {
      max_chars: MAX_CHARS,
      call_timeout_ms: CALL_TIMEOUT_MS,
      auto_approve: AUTO_APPROVE,
    },
    codex_binary: appServer.codexBin ?? `unresolved: ${appServer.codexBinError?.message}`,
    chatgpt_app_version: readAppVersion(appServer.codexBin),
    codex_home: resolveCodexHome(),
    checks: {},
  };

  try {
    await appServer.start();
    report.checks.app_server_handshake = "ok";
  } catch (err) {
    report.checks.app_server_handshake = `failed: ${err.message}`;
    return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }], isError: true };
  }

  try {
    report.checks.thread_id = await appServer.ensureThread();
  } catch (err) {
    report.checks.thread_id = `failed: ${err.message}`;
  }

  try {
    const status = await appServer.listMcpServers();
    // The response carries every upstream tool schema, which is far too large to
    // return verbatim. Report names and tool counts only.
    const servers = status?.data ?? status?.servers ?? status?.mcpServers ?? status;
    report.checks.configured_mcp_servers = Array.isArray(servers)
      ? servers.map((s) => ({
          name: s?.name ?? s?.server ?? null,
          tool_count: s?.tools ? Object.keys(s.tools).length : 0,
        }))
      : servers;
    report.checks.node_repl_configured = Array.isArray(servers)
      ? servers.some((s) => s?.name === "node_repl")
      : null;
  } catch (err) {
    report.checks.configured_mcp_servers = `failed: ${err.message}`;
  }

  try {
    report.checks.sky_surface = await sky.surface();
  } catch (err) {
    report.checks.sky_surface = `failed: ${err.message}`;
  }

  report.checks.intercepted_server_requests = appServer.interceptedServerRequests;

  const surface = report.checks.sky_surface;
  const missing = Array.isArray(surface)
    ? REQUIRED_SKY_FUNCTIONS.filter((fn) => !surface.includes(fn))
    : REQUIRED_SKY_FUNCTIONS;
  report.checks.missing_sky_functions = missing;

  const skyOk = Array.isArray(surface) && missing.length === 0;
  report.verdict = !Array.isArray(surface)
    ? "unhealthy: the sky Computer Use surface did not load"
    : missing.length
      ? `unhealthy: upstream is missing ${missing.join(", ")}; the matching tools will fail`
      : "healthy: Computer Use is reachable through this bridge";

  return {
    content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
    isError: !skyOk,
  };
}

/* ------------------------------------------------------------------ *
 * MCP stdio server
 * ------------------------------------------------------------------ */

function instructionsFor(clientName) {
  const lines = [];
  if (clientName && /codex/i.test(clientName)) {
    lines.push(
      "STOP: the connecting client identifies as Codex. " + ROUTING_NOTICE,
      "",
    );
  }
  lines.push(
    `${BRIDGE_NAME} exposes macOS Codex Computer Use as MCP tools.`,
    "",
    ROUTING_NOTICE,
    "",
    SAFETY_NOTICE,
    "",
    "Workflow: call get_app_state for the target app, read element_index values from the",
    "returned accessibility text, act with those indexes, then read state again before the",
    "next decision. Treat every element_index as valid only for the read that produced it.",
    "Reads return a diff by default; pass full_tree when indexes must be re-derived from",
    "scratch. Run health once before relying on the bridge.",
  );
  return lines.join("\n");
}

function startMcpServer() {
  const appServer = new AppServerClient();
  const ctx = { appServer, sky: new Sky(appServer) };
  let clientName = null;

  let initialized = false;

  const send = (obj) => process.stdout.write(`${JSON.stringify(obj)}\n`);
  const reply = (id, result) => send({ jsonrpc: "2.0", id, result });
  const replyError = (id, code, message) =>
    send({ jsonrpc: "2.0", id, error: { code, message } });

  const handleFrame = async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch (err) {
      // JSON-RPC 2.0 requires a parse-error reply with a null id.
      replyError(null, -32700, `parse error: ${err.message}`);
      return;
    }

    if (msg === null || typeof msg !== "object" || Array.isArray(msg)) {
      replyError(null, -32600, "invalid request: expected a JSON-RPC object");
      return;
    }

    const { id, method, params } = msg;
    // A message without an id is a notification: it must never be answered,
    // because a response with no id is not a valid JSON-RPC response.
    const isNotification = id === undefined || id === null;

    if (typeof method !== "string") {
      if (!isNotification) replyError(id, -32600, "invalid request: missing method");
      return;
    }
    if (msg.jsonrpc !== "2.0") {
      if (!isNotification) {
        replyError(id, -32600, `jsonrpc must be "2.0", received ${JSON.stringify(msg.jsonrpc)}`);
      }
      return;
    }
    if (!initialized && !isNotification && method !== "initialize" && method !== "ping") {
      replyError(id, -32002, `server not initialized: call initialize before ${method}`);
      return;
    }
    if (isNotification && method !== "notifications/initialized" && method !== "notifications/cancelled") {
      log(`ignoring unexpected notification: ${method}`);
      return;
    }

    try {
      switch (method) {
        case "initialize": {
          clientName = params?.clientInfo?.name ?? null;
          if (clientName && /codex/i.test(clientName)) {
            log(`client "${clientName}" looks like Codex; it should use sky directly`);
          }
          initialized = true;
          const asked = params?.protocolVersion;
          // Echo a version both sides know; otherwise answer with ours and let
          // the client decide whether it can proceed.
          const negotiated = SUPPORTED_MCP_PROTOCOL_VERSIONS.includes(asked)
            ? asked
            : MCP_PROTOCOL_VERSION;
          if (asked && asked !== negotiated) {
            log(`client requested unsupported protocolVersion ${asked}; offering ${negotiated}`);
          }
          reply(id, {
            protocolVersion: negotiated,
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: BRIDGE_NAME, version: BRIDGE_VERSION },
            instructions: instructionsFor(clientName),
          });
          return;
        }
        case "notifications/initialized":
        case "notifications/cancelled":
          return;
        case "ping":
          reply(id, {});
          return;
        case "tools/list":
          reply(id, {
            tools: TOOLS.map(({ name, description, inputSchema, mutating }) => ({
              name,
              description,
              inputSchema,
              annotations: {
                readOnlyHint: !mutating,
                destructiveHint: Boolean(mutating),
                openWorldHint: true,
              },
            })),
          });
          return;
        case "tools/call": {
          const toolName = params?.name;
          if (!TOOL_BY_NAME.has(toolName)) {
            replyError(id, -32602, `unknown tool: ${toolName}`);
            return;
          }
          const result = await runTool(ctx, toolName, params?.arguments ?? {});
          reply(id, result);
          return;
        }
        default:
          if (!isNotification) replyError(id, -32601, `method not found: ${method}`);
          return;
      }
    } catch (err) {
      if (isNotification) {
        log(`error handling ${method}: ${err.message}`);
        return;
      }
      // Surface tool failures as tool results so the model can react and retry.
      if (method === "tools/call") {
        reply(id, { content: [{ type: "text", text: `error: ${err.message}` }], isError: true });
      } else {
        replyError(id, -32603, err.message);
      }
    }
  };

  readFrames(process.stdin, {
    maxChars: MAX_FRAME_CHARS,
    onOverflow: (dropped) =>
      replyError(null, -32600, `discarded ${dropped} characters with no frame terminator`),
    onFrame: (line) => {
      handleFrame(line).catch((err) => log(`frame handler failed: ${err.message}`));
    },
  });

  const shutdown = () => {
    appServer.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.stdin.on("close", shutdown);
  process.on("exit", () => appServer.stop());
  process.on("unhandledRejection", (err) => log(`unhandled rejection: ${err}`));
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const HELP = `${BRIDGE_NAME} ${BRIDGE_VERSION}

Exposes macOS Codex Computer Use as an MCP stdio server for non-Codex harnesses.

${ROUTING_NOTICE}

Usage:
  ${BRIDGE_NAME}                      serve MCP on stdio (default)
  ${BRIDGE_NAME} --health             run the health check and print JSON
  ${BRIDGE_NAME} --call <tool> [json] invoke one tool and print its result
  ${BRIDGE_NAME} --list               list available tools
  ${BRIDGE_NAME} --help

Environment:
  CODEX_CUA_BRIDGE_CODEX_BIN     path to ChatGPT.app/Contents/Resources/codex
  CODEX_CUA_BRIDGE_MAX_CHARS     text cap per response (default 40000)
  CODEX_CUA_BRIDGE_TIMEOUT_MS    per-call timeout (default 60000)
  CODEX_CUA_BRIDGE_AUTO_APPROVE  set to 1 to approve app-server approval requests
  CODEX_CUA_BRIDGE_VERBOSE       set to 1 to log app-server stderr
  CODEX_HOME                     Codex home (default ~/.codex)

MCP client configuration:
  {"mcpServers":{"codex-cua":{"command":"node","args":["<path to this file>"]}}}
`;

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    return;
  }

  if (argv.includes("--list")) {
    for (const t of TOOLS) {
      process.stdout.write(`${t.mutating ? "mutating" : "read-only"}\t${t.name}\n`);
    }
    return;
  }

  if (argv[0] === "--health" || argv[0] === "--call") {
    const appServer = new AppServerClient();
    const ctx = { appServer, sky: new Sky(appServer) };
    try {
      const toolName = argv[0] === "--health" ? "health" : argv[1];
      if (!toolName) throw new Error("--call requires a tool name");
      const args = argv[0] === "--call" && argv[2] ? JSON.parse(argv[2]) : {};
      const result = await runTool(ctx, toolName, args);
      for (const part of result.content ?? []) {
        if (part.type === "text") process.stdout.write(`${part.text}\n`);
        else process.stdout.write(`[${part.type} ${part.mimeType} ${part.data?.length ?? 0}b]\n`);
      }
      appServer.stop();
      process.exit(result.isError ? 1 : 0);
    } catch (err) {
      process.stderr.write(`error: ${err.message}\n`);
      appServer.stop();
      process.exit(1);
    }
    return;
  }

  startMcpServer();
}

main();
