// Protocol and argument-validation coverage for the Codex Computer Use bridge.
// Everything here is answered before the bridge reaches Computer Use, so it runs
// anywhere Node runs, including CI on Linux.

import assert from "node:assert/strict";
import test from "node:test";

import { BridgeClient, toolText } from "./helpers/mcp-client.mjs";

async function withClient(run) {
  const client = new BridgeClient();
  try {
    await run(client);
  } finally {
    await client.close();
  }
}

async function withSession(run) {
  await withClient(async (client) => {
    await client.initialize();
    await run(client);
  });
}

test("initialize negotiates a known protocol version and reports the server", async () => {
  await withClient(async (client) => {
    const known = await client.initialize();
    assert.equal(known.result.protocolVersion, "2025-06-18");
    assert.equal(known.result.serverInfo.name, "codex-cua-bridge");
    assert.match(known.result.instructions, /do not use this bridge/i);
  });

  await withClient(async (client) => {
    const older = await client.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test", version: "1" },
    });
    assert.equal(older.result.protocolVersion, "2024-11-05", "a known version is echoed back");
  });

  await withClient(async (client) => {
    const unknown = await client.request("initialize", {
      protocolVersion: "1900-01-01",
      capabilities: {},
      clientInfo: { name: "test", version: "1" },
    });
    assert.equal(unknown.result.protocolVersion, "2025-06-18", "an unknown version gets ours");
  });
});

test("a client identifying as Codex is told to use its own surface", async () => {
  await withClient(async (client) => {
    const response = await client.initialize("codex");
    assert.match(response.result.instructions, /^STOP: the connecting client identifies as Codex/);
  });
});

test("initialize requires the fields MCP mandates and opens no session without them", async () => {
  const cases = [
    [undefined, /params object/],
    [{}, /protocolVersion/],
    [{ protocolVersion: "2025-06-18" }, /capabilities/],
    [{ protocolVersion: "2025-06-18", capabilities: {} }, /clientInfo\.name/],
    [{ protocolVersion: 1, capabilities: {}, clientInfo: { name: "c" } }, /protocolVersion/],
    [{ protocolVersion: "x", capabilities: {}, clientInfo: {} }, /clientInfo\.name/],
  ];

  for (const [params, expected] of cases) {
    await withClient(async (client) => {
      const rejected = await client.request("initialize", params);
      assert.equal(rejected.error.code, -32602);
      assert.match(rejected.error.message, expected);

      const gated = await client.request("tools/list", {});
      assert.equal(gated.error.code, -32002, "a rejected initialize must not open a session");
    });
  }
});

test("malformed frames get JSON-RPC errors with a null id", async () => {
  await withClient(async (client) => {
    client.writeRaw("{not json");
    const parseError = await client.next();
    assert.equal(parseError.error.code, -32700);
    assert.equal(parseError.id, null);

    client.writeRaw("null");
    const nullFrame = await client.next();
    assert.equal(nullFrame.error.code, -32600, "a literal null must not crash the reader");
  });
});

test("jsonrpc 2.0 is required, not merely validated when present", async () => {
  await withClient(async (client) => {
    client.writeRaw('{"id":1,"method":"ping"}');
    const missing = await client.next();
    assert.equal(missing.error.code, -32600);
    assert.match(missing.error.message, /jsonrpc must be "2\.0"/);

    client.writeRaw('{"jsonrpc":"1.0","id":2,"method":"ping"}');
    const wrong = await client.next();
    assert.equal(wrong.error.code, -32600);
  });
});

test("request ids are restricted to string, number, or null", async () => {
  await withSession(async (client) => {
    for (const bad of ['{"attacker":true}', "false", "true", "[1,2]"]) {
      client.writeRaw(`{"jsonrpc":"2.0","id":${bad},"method":"ping"}`);
      const rejected = await client.next();
      assert.equal(rejected.error.code, -32600, `id ${bad} must be rejected`);
      assert.equal(rejected.id, null, "a non-conforming id must not be echoed back");
    }

    for (const good of ['"abc"', "42", "3.5", "null"]) {
      client.writeRaw(`{"jsonrpc":"2.0","id":${good},"method":"ping"}`);
      const accepted = await client.next();
      assert.ok(accepted.result, `id ${good} must be accepted`);
    }
  });
});

test("notifications are never answered and notification methods carrying an id are invalid", async () => {
  await withSession(async (client) => {
    client.writeRaw('{"jsonrpc":"2.0","method":"ping"}');
    assert.equal(await client.next(2000), null, "an id-less request must get no response");

    for (const method of [
      "notifications/initialized",
      "notifications/cancelled",
      "notifications/anything",
    ]) {
      client.writeRaw(`{"jsonrpc":"2.0","method":"${method}"}`);
      assert.equal(await client.next(2000), null, `${method} as a notification stays silent`);

      client.writeRaw(`{"jsonrpc":"2.0","id":501,"method":"${method}"}`);
      const asRequest = await client.next();
      assert.equal(asRequest.error.code, -32600, `${method} with an id is an invalid request`);
    }
  });
});

test("message shape is decided before server state", async () => {
  await withClient(async (client) => {
    // No initialize: a malformed request must still get the shape answer, not -32002.
    client.writeRaw('{"jsonrpc":"2.0","id":7,"method":"notifications/initialized"}');
    const shape = await client.next();
    assert.equal(shape.error.code, -32600);

    client.writeRaw('{"jsonrpc":"2.0","id":8,"method":"tools/list"}');
    const state = await client.next();
    assert.equal(state.error.code, -32002, "a real method before initialize is a state error");
  });
});

test("tools/list advertises every tool with read-only and destructive annotations", async () => {
  await withSession(async (client) => {
    const listed = await client.request("tools/list", {});
    const tools = listed.result.tools;
    assert.equal(tools.length, 12);

    const readOnly = tools.filter((tool) => tool.annotations.readOnlyHint).map((t) => t.name);
    const destructive = tools.filter((tool) => tool.annotations.destructiveHint).map((t) => t.name);
    assert.deepEqual(readOnly.sort(), ["get_app_state", "health", "list_apps"]);
    assert.equal(destructive.length, 9, "the nine action tools are marked destructive");

    for (const tool of tools) {
      assert.equal(tool.inputSchema.additionalProperties, false, `${tool.name} closes its schema`);
    }
  });
});

test("an unknown tool is an invalid-params error", async () => {
  await withSession(async (client) => {
    const unknown = await client.callTool("no_such_tool", {});
    assert.equal(unknown.error.code, -32602);
  });
});

test("arguments are validated against the advertised schema", async () => {
  await withSession(async (client) => {
    const cases = [
      ["click", {}, /missing required property "app"/],
      ["click", { app: "X", bogus: 1 }, /unknown property "bogus"/],
      ["click", { app: "X", mouse_button: "sideways" }, /must be one of/],
      ["click", { app: "X", element_index: 1, click_count: 9 }, /must be <= 3/],
      ["click", { app: "X", element_index: 1, click_count: 0 }, /must be >= 1/],
      ["click", { app: 123 }, /"app" must be a string/],
      ["get_app_state", { app: "X", full_tree: "yes" }, /"full_tree" must be a boolean/],
      ["get_app_state", { app: "X", disableDiff: true }, /unknown property "disableDiff"/],
      ["paste", { app: "X", text: "t" }, /missing required property "format"/],
      ["paste", { app: "X", text: "t", format: "rtf" }, /must be one of/],
      ["scroll", { app: "X", element_index: 1, direction: "sideways" }, /must be one of/],
      ["type_text", { app: "X", text: 5 }, /"text" must be a string/],
      ["health", { extra: 1 }, /unknown property "extra"/],
      ["list_apps", { app: "X" }, /unknown property "app"/],
    ];

    for (const [tool, args, expected] of cases) {
      const rejected = await client.callTool(tool, args);
      assert.equal(rejected.result.isError, true, `${tool} ${JSON.stringify(args)}`);
      assert.match(toolText(rejected), expected);
    }
  });
});

test("element_index rejects every value Number() would coerce to zero", async () => {
  await withSession(async (client) => {
    for (const bad of [null, false, "", "   ", "1.5", 2.5, []]) {
      const rejected = await client.callTool("click", { app: "X", element_index: bad });
      assert.equal(rejected.result.isError, true, `element_index ${JSON.stringify(bad)}`);
      assert.match(toolText(rejected), /element_index must be an integer/);
    }
  });
});

// The accepted side is asserted in codex-cua-bridge-runtime.test.mjs, where a
// fake upstream makes the forwarded value observable. Asserting only that no
// validation error came back would pass even if the value were mangled.

test("click requires a usable target rather than advertising app alone as valid", async () => {
  await withSession(async (client) => {
    for (const args of [{ app: "X" }, { app: "X", x: 10 }, { app: "X", y: 10 }]) {
      const rejected = await client.callTool("click", args);
      assert.equal(rejected.result.isError, true, JSON.stringify(args));
      assert.match(toolText(rejected), /requires element_index, or both x and y/);
    }
  });
});

test("unterminated input is bounded and the reader resynchronizes after it", async () => {
  // A small cap keeps the test fast; the default is 32MB.
  const client = new BridgeClient({ env: { CODEX_CUA_BRIDGE_MAX_FRAME_CHARS: "65536" } });
  try {
    client.child.stdin.write("x".repeat(300000));
    const overflow = await client.next();
    assert.equal(overflow.error.code, -32600);
    assert.match(overflow.error.message, /no frame terminator/);

    // Terminate the oversized frame, then confirm the next real frame is parsed
    // rather than spliced onto the discarded remainder.
    client.writeRaw("");
    const recovered = await client.initialize();
    assert.equal(recovered.result.serverInfo.name, "codex-cua-bridge");
  } finally {
    await client.close();
  }
});

test("a missing Codex binary degrades instead of taking the server down", async () => {
  const client = new BridgeClient({ env: { CODEX_CUA_BRIDGE_CODEX_BIN: "/nonexistent/codex" } });
  try {
    await client.initialize();
    const listed = await client.request("tools/list", {});
    assert.equal(listed.result.tools.length, 12, "the tool surface is still advertised");

    const failed = await client.callTool("list_apps", {});
    assert.equal(failed.result.isError, true);
    assert.match(toolText(failed), /does not exist/);

    const stillAlive = await client.request("tools/list", {});
    assert.equal(stillAlive.result.tools.length, 12, "the bridge survives the failure");
  } finally {
    await client.close();
  }
});
