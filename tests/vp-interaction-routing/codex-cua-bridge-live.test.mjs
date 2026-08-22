// Live coverage for the Codex Computer Use bridge. These reach the real Computer
// Use service through `codex app-server`, so they need macOS with ChatGPT.app
// and its Computer Use component. Everywhere else they skip.
//
// Calculator is the fixture: it ships with macOS, exposes a stable accessibility
// tree, and its display makes a performed click observable.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { BridgeClient, liveUnavailable, toolText } from "./helpers/mcp-client.mjs";

const unavailable = liveUnavailable();
// Node treats any non-undefined `skip` value as a skip directive, so an absent
// reason must be `false` rather than null or the whole suite silently skips.
const skip = unavailable ?? false;
const APP = "Calculator";

async function withSession(run, env) {
  const client = new BridgeClient({ env });
  try {
    await client.initialize();
    await run(client);
  } finally {
    await client.close();
  }
}

/** Element indexes, parsed from a full accessibility read. Valid only for that read. */
function indexes(tree) {
  const found = new Map();
  for (const line of tree.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || !/^\d/.test(trimmed)) continue;
    found.set(trimmed, Number.parseInt(trimmed, 10));
  }
  return found;
}

/**
 * First element matching any of the alternatives. Calculator relabels controls
 * as its state changes -- the clear key is "Clear" on a fresh launch and
 * "All Clear" after a calculation -- so a fixture cannot rely on one spelling.
 */
function findIndex(tree, ...alternatives) {
  for (const needle of alternatives) {
    for (const [description, index] of indexes(tree)) {
      if (description.includes(needle)) return index;
    }
  }
  throw new Error(`no element matching any of ${alternatives.join(", ")}`);
}

const CLEAR = ["AllClear", "button Clear"];
const KEYS = [CLEAR, ["ID: Eight"], ["button Multiply"], ["ID: Seven"], ["button Equals"]];

async function readTree(client) {
  const response = await client.callTool("get_app_state", { app: APP, full_tree: true }, 90000);
  return toolText(response);
}

/**
 * The Calculator input display, which is how a performed click is observed. It
 * is the text node under StandardInputView; a separate StandardResultView holds
 * the last expression, so picking the last text node in the tree is not safe.
 */
function displayValue(tree) {
  const lines = tree.split("\n");
  const inputAt = lines.findIndex((line) => line.includes("StandardInputView"));
  assert.notEqual(inputAt, -1, "the accessibility tree must expose StandardInputView");
  for (const line of lines.slice(inputAt + 1)) {
    if (line.includes(" text ")) return line.trim();
    if (line.includes("scroll area") || line.includes("button")) break;
  }
  return "";
}

/**
 * Put Calculator in a known state. One clear press is not enough: with a pending
 * operation the key clears only the current entry, so it is pressed until the
 * display reads zero.
 */
async function resetCalculator(client) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const tree = await readTree(client);
    if (/text ‎0$/.test(displayValue(tree))) return displayValue(tree);
    await client.callTool(
      "click",
      { app: APP, element_index: findIndex(tree, ...CLEAR) },
      90000,
    );
  }
  const settled = displayValue(await readTree(client));
  assert.match(settled, /0$/, "Calculator must be resettable to zero before the test acts");
  return settled;
}

/**
 * The frontmost application name. Fails loudly when it cannot be read: a silent
 * empty string on both sides of the comparison would make the focus assertion
 * pass even if the bridge had stolen focus.
 */
function frontmostApp() {
  // Asks AppKit directly rather than going through System Events, whose
  // AppleEvent IPC blocks under load: it has been observed timing out after two
  // minutes on a machine where this query answers in well under a second.
  const result = spawnSync(
    "osascript",
    [
      "-l",
      "JavaScript",
      "-e",
      'ObjC.import("AppKit"); $.NSWorkspace.sharedWorkspace.frontmostApplication.localizedName.js',
    ],
    { encoding: "utf8", timeout: 10000 },
  );
  assert.equal(
    result.status,
    0,
    // A timeout reports a null status, so name that case rather than printing
    // an unexplained "null !== 0".
    result.status === null
      ? `reading the frontmost app timed out or was killed (${result.signal}), so focus cannot be asserted`
      : `reading the frontmost app failed, so focus cannot be asserted: ${result.stderr?.trim()}`,
  );
  const name = result.stdout.trim();
  assert.ok(name, "the frontmost app name must not be empty");
  return name;
}

test("health reports the live upstream inventory rather than a hardcoded list", { skip }, async () => {
  await withSession(async (client) => {
    const response = await client.callTool("health", {}, 90000);
    const report = JSON.parse(toolText(response));

    assert.match(report.verdict, /^healthy/);
    assert.equal(report.checks.app_server_handshake, "ok");
    assert.equal(report.checks.node_repl_configured, true);
    assert.deepEqual(report.checks.missing_sky_functions, []);
    assert.ok(report.checks.sky_surface.includes("get_app_state"));
    // Evidence the surface is reflected off the live upstream rather than
    // restated from the tool table: `target` is a property of the sky object,
    // not one of the functions the bridge needs, so a hardcoded list of
    // requirements would not contain it.
    assert.ok(
      report.checks.sky_surface.includes("target"),
      `sky_surface looks hardcoded rather than reflected: ${report.checks.sky_surface.join()}`,
    );
    assert.ok(report.chatgpt_app_version, "the ChatGPT.app version is reported");
    assert.match(report.routing_notice, /do not use this bridge/i);
  });
});

test("a read returns the accessibility tree and a re-read returns a smaller diff", { skip }, async () => {
  await withSession(async (client) => {
    const full = await readTree(client);
    assert.match(full, /Window: "Calculator"/);
    assert.ok(full.includes("read: full tree"));

    const again = await client.callTool("get_app_state", { app: APP }, 90000);
    const diff = toolText(again);
    assert.ok(diff.includes("read: diff against previous read"));
    assert.ok(diff.length < full.length, "the diff must be cheaper than the full tree");
  });
});

test("a screenshot is omitted unless asked for, and its path is always reported", { skip }, async () => {
  await withSession(async (client) => {
    const textOnly = await client.callTool("get_app_state", { app: APP, full_tree: true }, 90000);
    assert.ok(!textOnly.result.content.some((part) => part.type === "image"));
    assert.match(toolText(textOnly), /screenshot: file:\/\//);

    const withImage = await client.callTool(
      "get_app_state",
      { app: APP, include_screenshot: true },
      90000,
    );
    assert.ok(withImage.result.content.some((part) => part.type === "image"));
    assert.match(
      toolText(withImage),
      /screenshot: file:\/\//,
      "the path is reported even when the image is embedded",
    );
  });
});

test("an oversized screenshot is returned as a path instead of an image", { skip }, async () => {
  await withSession(
    async (client) => {
      const response = await client.callTool(
        "get_app_state",
        { app: APP, include_screenshot: true },
        90000,
      );
      assert.ok(!response.result.content.some((part) => part.type === "image"));
      const text = toolText(response);
      assert.match(text, /over CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES/);

      // The cap promises a path in place of the image, so the path must be
      // there and must actually resolve to the file.
      // The path can contain spaces, so match up to the trailing word rather
      // than to the first whitespace.
      const named = text.match(/read it from (.+) instead/);
      assert.ok(named, `no usable path offered in place of the image: ${text}`);
      assert.ok(existsSync(named[1]), `the offered path does not exist: ${named[1]}`);

      const reported = toolText(response).match(/screenshot: (file:\S+)/);
      assert.ok(reported, "the screenshot URL is still reported");
      assert.ok(existsSync(fileURLToPath(decodeURI(reported[1]))), "the reported URL resolves");
    },
    { CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES: "10000" },
  );
});

test("clicks act on the target and do not steal focus", { skip }, async () => {
  await withSession(async (client) => {
    await resetCalculator(client);
    const before = frontmostApp();

    // 8 x 7 = 56, re-reading before every click. Indexes are valid only for the
    // read that produced them: entering an expression inserts a result row and
    // renumbers every control below it, so a cached index hits the wrong key.
    for (const alternatives of KEYS) {
      const index = findIndex(await readTree(client), ...alternatives);
      const clicked = await client.callTool("click", { app: APP, element_index: index }, 90000);
      assert.notEqual(clicked.result.isError, true, `clicking ${alternatives[0]}`);
    }

    assert.match(displayValue(await readTree(client)), /56/);
    // The invariant is that the bridge does not change focus. Asserting the
    // target is never frontmost would be wrong whenever it already was.
    assert.equal(frontmostApp(), before, "the bridge must not change which app is frontmost");
  });
});

test("coordinates are window-relative, so an out-of-window point is refused", { skip }, async () => {
  await withSession(async (client) => {
    const inside = await client.callTool("click", { app: APP, x: 100, y: 100 }, 90000);
    assert.notEqual(inside.result.isError, true, "a point inside the window is clickable");

    // The service adds the window origin, so a large offset lands off-window.
    const outside = await client.callTool("click", { app: APP, x: 9000, y: 9000 }, 90000);
    assert.equal(outside.result.isError, true);
    assert.match(toolText(outside), /windowNotFoundAtPosition/);
  });
});

test("cancelling a queued click prevents it from ever reaching the UI", { skip }, async () => {
  await withSession(async (client) => {
    const cleared = await resetCalculator(client);
    const clearedTree = await readTree(client);
    // Resolved against the cleared state, which is the state the queued click
    // will act on.
    const seven = findIndex(clearedTree, "ID: Seven");

    // Occupy the serialization lock, queue a click behind it, then cancel the
    // click. Without the cancellation checks the click would still be performed
    // once the lock freed.
    const occupyId = client.nextId++;
    client.write({
      jsonrpc: "2.0",
      id: occupyId,
      method: "tools/call",
      params: { name: "get_app_state", arguments: { app: APP, full_tree: true } },
    });
    const cancelledId = client.nextId++;
    client.write({
      jsonrpc: "2.0",
      id: cancelledId,
      method: "tools/call",
      params: { name: "click", arguments: { app: APP, element_index: seven } },
    });
    client.notify("notifications/cancelled", { requestId: cancelledId });

    const seen = new Set();
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline && !seen.has(occupyId)) {
      const message = await client.next(5000);
      // A quiet interval is not the end of the wait: the occupying read can
      // legitimately take longer than one poll. The deadline is the bound.
      if (!message) continue;
      if (message.id !== undefined) seen.add(message.id);
    }
    assert.ok(seen.has(occupyId), "the occupying call still answers");

    // Keep draining after that: a regressed bridge could answer the cancelled
    // request just afterwards, and stopping here would leave it unnoticed.
    const graceEnd = Date.now() + 6000;
    while (Date.now() < graceEnd) {
      const late = await client.next(2000);
      if (!late) continue;
      if (late.id !== undefined) seen.add(late.id);
    }
    assert.ok(!seen.has(cancelledId), "a cancelled request receives no response, even later");

    assert.equal(displayValue(await readTree(client)), cleared, "the click never ran");

    // The same click, uncancelled, must change the display. Without this the
    // assertion above would pass even if a click could not be detected at all.
    const liveSeven = findIndex(await readTree(client), "ID: Seven");
    await client.callTool("click", { app: APP, element_index: liveSeven }, 90000);
    assert.notEqual(displayValue(await readTree(client)), cleared, "an allowed click does run");
    await resetCalculator(client);
  });
});

test("the bridge recovers when its app-server child dies mid-session", { skip }, async () => {
  await withSession(async (client) => {
    assert.match(await readTree(client), /Window: "Calculator"/);

    const before = spawnSync("pgrep", ["-P", String(client.child.pid)], { encoding: "utf8" })
      .stdout.trim()
      .split("\n")
      .filter(Boolean);
    assert.equal(before.length, 1, "exactly one app-server child");
    spawnSync("kill", ["-9", before[0]]);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await client.callTool("get_app_state", { app: APP, full_tree: true }, 90000);
      assert.ok(response.result, "every call answers, none hangs");
    }
    assert.match(await readTree(client), /Window: "Calculator"/);

    const after = spawnSync("pgrep", ["-P", String(client.child.pid)], { encoding: "utf8" })
      .stdout.trim()
      .split("\n")
      .filter(Boolean);
    assert.equal(after.length, 1, "exactly one replacement child");
    assert.notDeepEqual(after, before, "it is a new process");
  });
});
