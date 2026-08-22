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

## Register

```json
{
  "mcpServers": {
    "codex-cua": {
      "command": "node",
      "args": ["~/.agents/skills/vp-interaction-routing/scripts/codex-cua-bridge.mjs"]
    }
  }
}
```

Expand `~` to an absolute path if the client does not. Registering an MCP server
is a persistent, privileged configuration change: get explicit user
authorization first.

## Verify before relying on it

Run the health check. It is the bridge-health and upstream-inventory step, and
it needs no MCP client:

```bash
node ~/.agents/skills/vp-interaction-routing/scripts/codex-cua-bridge.mjs --health
```

A healthy report ends with `"verdict": "healthy"` and shows:

| Field | What it proves |
|-------|----------------|
| `codex_binary`, `chatgpt_app_version` | the signed binary the bridge will spawn |
| `checks.app_server_handshake` | app-server accepted `initialize` |
| `checks.thread_id` | an ephemeral thread was created |
| `checks.node_repl_configured` | the upstream `node_repl` server is configured |
| `checks.sky_surface` | the live `@oai/sky` function list, reflected rather than assumed |
| `checks.intercepted_server_requests` | approval requests the bridge declined |

Re-run it after a ChatGPT.app update. `app-server` is an experimental protocol
and its surface can change between versions; treat a failed handshake or a
shrunken `sky_surface` as a compatibility break, not a transient error.

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
| `drag` | mutating | screen points within the app |
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
- **Leave `include_screenshot` off** unless the accessibility text is
  insufficient. An embedded screenshot costs far more context than the tree.
- Responses are capped at `CODEX_CUA_BRIDGE_MAX_CHARS` (default 40000) and the
  cap is reported inline when it truncates.

## Authorization

The bridge performs no intent classification and enforces no action gate. A
bridge call does not execute the Codex Computer Use confirmations policy, so the
calling agent keeps its own authorization boundary and must confirm consequential
UI actions with the user before invoking a mutating tool.

When app-server asks the client to approve something, the bridge declines by
default and records the request in `health`, because it must not stand in for the
user. `CODEX_CUA_BRIDGE_AUTO_APPROVE=1` approves instead; set it only
deliberately.

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `CODEX_CUA_BRIDGE_CODEX_BIN` | app-bundle search | path to `Contents/Resources/codex` |
| `CODEX_CUA_BRIDGE_MAX_CHARS` | `40000` | text cap per response |
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
