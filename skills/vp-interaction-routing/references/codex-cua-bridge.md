# Codex Computer Use Bridge

`scripts/codex-cua-bridge.mjs` exposes macOS Codex Computer Use as a standard
MCP stdio server, so a non-Codex harness can call it as ordinary tools.

## Codex must not use this bridge

Codex already reaches this capability natively through its bundled `node_repl`
and `@oai/sky` surface. Routing Codex through the bridge adds an app-server hop,
loses the integration, and moves the action outside the Codex Computer Use
confirmations policy. The bridge exists only to open the capability to other
harnesses.

- **Codex**: use `node_repl` with `@oai/sky` directly. Do not register or call
  this bridge.
- **Claude Code, Antigravity, or another MCP client**: this bridge is the
  supported path.

The bridge states this in its MCP `initialize` instructions and warns on stderr
when the connecting client identifies as Codex. It does not block the call, so
the rule still has to be followed by whoever configures the client.

## Requirements

- macOS with the ChatGPT desktop app installed and its Computer Use component
  present.
- Accessibility permission granted to the Computer Use service.
- Node.js 18 or later for the bridge process.
- ChatGPT.app running. The bridge spawns `codex app-server` from inside the app
  bundle; `SkyComputerUseService` gates callers on the responsible process's
  code signature, so an unsigned parent is rejected with `Sender process is not
  authenticated`.

## What it cannot do

Computer Use refuses to operate on Codex itself. Any tool call targeting
`com.openai.codex` fails with:

```
Computer Use is not allowed to use the app 'com.openai.codex' for safety reasons.
```

So this bridge cannot drive the Codex or ChatGPT desktop UI, only other
applications. To have Codex review or act on something, use `codex exec`, which
needs no UI.

## Register

Registering an MCP server is a persistent, privileged configuration change:
get explicit user authorization first.

The script lives beside this file, at `scripts/codex-cua-bridge.mjs` inside this
skill's own directory. Resolve that to an absolute path rather than assuming an
install location, because the skill can be installed globally or per project:

```bash
# From the skill directory reported when the skill loads.
BRIDGE="$(cd "<this skill's directory>" && pwd)/scripts/codex-cua-bridge.mjs"
```

### Claude Code

Use the CLI rather than hand-editing config:

```bash
claude mcp add -s user codex-cua -- node "$BRIDGE"
```

`-s user` matters. The default scope is `local`, which registers the server for
the current directory only, so omitting it appears to work and then silently does
nothing elsewhere. Verify where it landed, and remove with
`claude mcp remove -s user codex-cua`.

### Another MCP client

Add a stdio server with `node` as the command and the absolute script path as its
only argument. In Claude Code's own config this is stored as:

```json
{
  "mcpServers": {
    "codex-cua": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/scripts/codex-cua-bridge.mjs"]
    }
  }
}
```

A relative path or a bare `~` will not be expanded by every client, so use an
absolute path.

Once the client lists the server, confirm it works by calling the `health` tool.
If the tools do not appear, restart the client and check again.

## Verify before relying on it

Run the health check. It is the bridge-health and upstream-inventory step, and
it needs no MCP client:

```bash
node ~/.agents/skills/vp-interaction-routing/scripts/codex-cua-bridge.mjs --health
```

A healthy report's `verdict` begins with `healthy` and carries the reason after
it, currently `healthy: Computer Use is reachable through this bridge`, so match
the prefix rather than the whole string. It also shows:

| Field | What it proves |
|-------|----------------|
| `codex_binary`, `chatgpt_app_version` | the signed binary the bridge will spawn |
| `checks.app_server_handshake` | app-server accepted `initialize` |
| `checks.thread_id` | an ephemeral thread was created |
| `checks.node_repl_configured` | the upstream `node_repl` server is configured |
| `checks.sky_surface` | the live `@oai/sky` function list, reflected rather than assumed |
| `checks.missing_sky_functions` | required upstream functions the surface no longer provides |
| `checks.intercepted_server_requests` | approval requests the bridge declined |

Re-run it after a ChatGPT.app update. `app-server` is an experimental protocol
and its surface can change between versions; treat a failed handshake or a
shrunken `sky_surface` as a compatibility break, not a transient error. The
verdict begins with `unhealthy` whenever `missing_sky_functions` is non-empty,
naming what is missing, so a renamed upstream function is reported rather than
passing silently. Both prefixes are asserted by the test suites, so match on the
prefix and treat the text after it as a reason for a human.

Other diagnostics:

```bash
# List tools without starting an MCP session.
node .../codex-cua-bridge.mjs --list

# Invoke a single tool and print its result.
node .../codex-cua-bridge.mjs --call get_app_state '{"app":"Calculator","full_tree":true}'
```

## Tools

| Tool | Kind | Notes |
|------|------|-------|
| `health` | read | bridge and upstream verification |
| `list_apps` | read | only when the app identifier cannot be guessed |
| `get_app_state` | read | accessibility text; `full_tree` and `include_screenshot` are opt-in |
| `click` | mutating | prefer `element_index` over `x`/`y` |
| `type_text` | mutating | `\n` acts as Return and may submit a form |
| `press_key` | mutating | xdotool-style; app-scoped, so no global shortcuts |
| `set_value` | mutating | replaces an element's contents |
| `select_text` | mutating | select, or place the cursor before or after a match |
| `scroll` | mutating | whole pages, one direction |
| `drag` | mutating | window-relative points, like `click` x/y |
| `paste` | mutating | via the pasteboard, restoring the previous clipboard |
| `perform_secondary_action` | mutating | only an action listed for that element |

The bridge calls `@oai/sky` through the upstream `node_repl` server rather than
the typed `computer-use` MCP server, because the typed server returns an inline
screenshot on every read with no way to opt out. Here the screenshot stays a
file path unless `include_screenshot` is set.

## Usage rules

- **Read, act, read.** Call `get_app_state`, take `element_index` values from
  that text, act, then read again before the next decision.
- **An `element_index` is valid only for the read that produced it.** Indexes
  shift as the tree changes.
- **The diff is server-side state, not per client.** `get_app_state` returns a
  diff against the Computer Use service's previous read of that window, which
  may have been made by a different process. A fresh bridge session can receive
  a diff against a tree it has never seen. Pass `full_tree: true` on the first
  read of a session, and whenever indexes must be re-derived from scratch.
- **Coordinates are window-relative, not screen coordinates.** `click` x/y and
  `drag` from/to are measured from the target window's top-left; the service adds
  the window origin itself. Verified against a Calculator window at screen
  (147, 529): a click at (300, 700) was reported as (447, 1229). The
  accessibility text exposes no element bounds, so there is nothing in a read to
  derive coordinates from. Use `element_index`. In particular, do not carry
  coordinates over from Peekaboo, whose bounds are screen coordinates.
- **A mutating tool returning `ok` is not evidence the UI changed.** The upstream
  reports that it dispatched the action, not that the application acted on it.
  Two silent no-ops observed here: `set_value` against an Electron
  `contenteditable` (Antigravity's message box) returned `ok` and left the field
  empty, and `press_key` with `Escape` against Calculator returned `ok` and left
  a pending operation in place. Read the state back to confirm an action landed;
  for an Electron text box, `click` then `paste` works where `set_value` does
  not.
- **Leave `include_screenshot` off** unless the accessibility text is
  insufficient. An embedded screenshot costs far more context than the tree.
- Responses are capped at `CODEX_CUA_BRIDGE_MAX_CHARS` (default 40000) and the
  cap is reported inline when it truncates. An embedded screenshot over
  `CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES` (default 1500000) is replaced by its file
  path.
- Calls are serialized. The upstream `node_repl` session is one shared
  JavaScript context, so concurrent requests queue rather than interleave. Expect
  in-flight calls to complete in order, not in parallel.
- **Cancellation is honored before the action, not after.** `notifications/cancelled`
  is checked when a queued call reaches the front of the queue and again once the
  session is ready, so a cancelled mutating call is never performed. A cancelled
  request receives no response, as MCP requires.
- **A timed-out call tears down the session.** The upstream snippet may still be
  running against shared REPL state, so the bridge abandons the app-server child
  and its `node_repl` session before releasing the queue. The next call starts a
  fresh session; the accessibility-tree diff baseline survives because it lives
  in the Computer Use service, not in the REPL.

## Protocol notes

Tool arguments are validated against each tool's advertised `inputSchema`
before the call reaches Computer Use: required properties, declared types,
enums, numeric bounds, and `additionalProperties: false` are all enforced, so the
schema is a boundary rather than documentation. Only declared properties are
forwarded, so a protocol-reserved `_`-prefixed key is tolerated without an error
but never reaches Computer Use. A numeric string is still accepted where an
integer is declared, because callers routinely send one.

The bridge is a strict JSON-RPC 2.0 server on the MCP side: `jsonrpc: "2.0"` is
required, a request with no id member at all is a notification and is never
answered (an explicit `id: null` is a request and does get a response), malformed JSON returns `-32700` with a null id, a call before
`initialize` returns `-32002`, and `protocolVersion` is negotiated against the
versions the bridge knows rather than always claimed. Input is framed with a hard
cap on the unterminated remainder, and the reader resynchronizes to the next
newline after an overflow instead of splicing a truncated frame onto the next
one.

## Authorization

The bridge performs no intent classification and enforces no action gate. A
bridge call does not execute the Codex Computer Use confirmations policy, so the
calling agent keeps its own authorization boundary and must confirm consequential
UI actions with the user before invoking a mutating tool.

Every tool carries MCP annotations so a host can gate mutating calls
programmatically rather than by name: `readOnlyHint` is true for `health`,
`list_apps`, and `get_app_state`, and `destructiveHint` is true for the nine
action tools.

When app-server asks the client to decide something, the bridge answers only the
reverse-request methods it recognizes, each in that method's own response shape:
a command-execution or file-change approval gets a `decision`, an MCP elicitation
gets an `action`, and a user-input request gets empty answers. Recognized
approvals are **declined** by default and recorded in `health`, because the bridge
must not stand in for the user.

Anything it cannot classify, including a method added by a future app-server
version, is refused with a JSON-RPC `-32601` rather than answered with a guess.
`CODEX_CUA_BRIDGE_AUTO_APPROVE=1` flips the recognized approvals to accept; it
cannot approve an unclassified request. Set it only deliberately.

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `CODEX_CUA_BRIDGE_CODEX_BIN` | app-bundle search | path to `Contents/Resources/codex` |
| `CODEX_CUA_BRIDGE_MAX_CHARS` | `40000` | text cap per response |
| `CODEX_CUA_BRIDGE_MAX_IMAGE_BYTES` | `1500000` | above this a screenshot is returned as a path |
| `CODEX_CUA_BRIDGE_MAX_FRAME_CHARS` | `33554432` | maximum unterminated JSON-RPC input buffered on either side |
| `CODEX_CUA_BRIDGE_TIMEOUT_MS` | `60000` | per-call timeout |
| `CODEX_CUA_BRIDGE_AUTO_APPROVE` | unset | `1` approves app-server approval requests |
| `CODEX_CUA_BRIDGE_VERBOSE` | unset | `1` logs app-server stderr |
| `CODEX_HOME` | `~/.codex` | Codex home directory |

## Choosing between this bridge and Peekaboo

Both read the accessibility tree, act on it, and do not steal focus. They differ
in payload size and in breadth.

| Dimension | This bridge | Peekaboo |
|-----------|-------------|----------|
| Full tree of one small window | smaller, and includes the menu bar | larger, menu bar needs a separate call |
| Re-read after a small change | diff only | full tree every time |
| Screenshot | opt-in, never required to act | required snapshot for clicks |
| Per-click latency | higher | lower |
| Surface breadth | 11 accessibility operations | windows, menus, Dock, Spaces, dialogs, clipboard, capture, predicate verification |

Route by the binding constraint. Prefer Peekaboo for breadth, for system
surfaces, and for latency-sensitive click sequences. Prefer this bridge when
accessibility-tree size is the binding constraint, such as long sessions against
a large application UI, where the server-side diff avoids re-sending an entire
tree on every read.
