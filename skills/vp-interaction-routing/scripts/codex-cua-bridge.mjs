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
import { existsSync, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const BRIDGE_NAME = "codex-cua-bridge";
const BRIDGE_VERSION = "0.1.0";
const MCP_PROTOCOL_VERSION = "2025-06-18";

const MAX_CHARS = clampInt(process.env.CODEX_CUA_BRIDGE_MAX_CHARS, 40000, 500, 500000);
const CALL_TIMEOUT_MS = clampInt(process.env.CODEX_CUA_BRIDGE_TIMEOUT_MS, 60000, 1000, 600000);
const MAX_IMAGE_BYTES = clampInt(
  process.env.CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES,
  1500000,
  10000,
  20000000,
);
const AUTO_APPROVE = process.env.CODEX_CUA_BRIDGE_AUTO_APPROVE === "1";

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
    this.startPromise = this.#start();
    return this.startPromise;
  }

  async #start() {
    if (this.codexBinError) throw this.codexBinError;
    const env = { ...process.env, CODEX_HOME: resolveCodexHome() };
    this.child = spawn(this.codexBin, ["app-server", "--stdio"], {
      stdio: ["pipe", "pipe", "pipe"],
      env,
    });

    const fail = (reason) => {
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
    this.child.on("error", (err) => fail(`app-server failed to start: ${err.message}`));
    this.child.on("exit", (code, signal) =>
      fail(`app-server exited (code=${code} signal=${signal})`),
    );
    this.child.stdin.on("error", (err) => log(`app-server stdin error: ${err.message}`));

    createInterface({ input: this.child.stdout }).on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let msg;
      try {
        msg = JSON.parse(trimmed);
      } catch {
        return; // non-JSON banner output
      }
      this.#handle(msg);
    });

    // app-server stderr is diagnostic only; surface it without mixing into stdout.
    createInterface({ input: this.child.stderr }).on("line", (line) => {
      if (process.env.CODEX_CUA_BRIDGE_VERBOSE === "1") log("app-server:", line);
    });

    await this.request("initialize", {
      clientInfo: { name: BRIDGE_NAME, version: BRIDGE_VERSION },
    });
    this.notify("initialized", {});
  }

  #handle(msg) {
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
   * app-server can ask the client to approve an action. The bridge is not a
   * user and must not silently stand in for one, so it declines by default and
   * records the request for the `health` tool to report.
   */
  #handleServerRequest(msg) {
    this.interceptedServerRequests.push({ method: msg.method });
    const decision = AUTO_APPROVE
      ? "approved"
      : {
          denied: {
            rejection:
              `${BRIDGE_NAME} declines approvals on the user's behalf. ` +
              "The calling agent must obtain confirmation and retry, or set " +
              "CODEX_CUA_BRIDGE_AUTO_APPROVE=1 deliberately.",
          },
        };
    log(
      `intercepted server request ${msg.method} -> ${AUTO_APPROVE ? "approved" : "denied"}`,
    );
    this.#write({ id: msg.id, result: { decision } });
  }

  #write(obj) {
    if (!this.child) throw new Error("app-server is not running");
    this.child.stdin.write(`${JSON.stringify(obj)}\n`);
  }

  notify(method, params = {}) {
    this.#write({ method, params });
  }

  request(method, params = {}, timeoutMs = CALL_TIMEOUT_MS) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`app-server request timed out after ${timeoutMs}ms: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try {
        this.#write({ id, method, params });
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
      const result = await this.appServer.callMcpTool("node_repl", "js", { code });
      const text = resultText(result);
      if (isErrorResult(result)) throw new Error(text);
      return text;
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
    if (out[key] === undefined) continue;
    const n = Number(out[key]);
    if (!Number.isInteger(n)) {
      throw new Error(`${key} must be an integer, received ${JSON.stringify(out[key])}`);
    }
    out[key] = n;
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
  const bytes = readFileSync(path);
  if (bytes.length > MAX_IMAGE_BYTES) {
    return {
      path,
      tooLarge: `screenshot is ${bytes.length} bytes, over ` +
        `CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES=${MAX_IMAGE_BYTES}; read it from ${path} instead`,
    };
  }
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

  const skyOk = Array.isArray(report.checks.sky_surface);
  report.verdict = skyOk
    ? "healthy: Computer Use is reachable through this bridge"
    : "unhealthy: the sky Computer Use surface did not load";

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

  const send = (obj) => process.stdout.write(`${JSON.stringify(obj)}\n`);
  const reply = (id, result) => send({ jsonrpc: "2.0", id, result });
  const replyError = (id, code, message) =>
    send({ jsonrpc: "2.0", id, error: { code, message } });

  createInterface({ input: process.stdin }).on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return;
    }

    const { id, method, params } = msg;

    try {
      switch (method) {
        case "initialize": {
          clientName = params?.clientInfo?.name ?? null;
          if (clientName && /codex/i.test(clientName)) {
            log(`client "${clientName}" looks like Codex; it should use sky directly`);
          }
          reply(id, {
            protocolVersion: MCP_PROTOCOL_VERSION,
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
          if (id !== undefined) replyError(id, -32601, `method not found: ${method}`);
          return;
      }
    } catch (err) {
      if (id === undefined) {
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
