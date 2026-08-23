# Native UI Routing

Use native UI automation only after confirming that no purpose-built connector,
API, CLI, or browser DOM interface can complete the current operation.

## First-Party Computer Use

Prefer the host agent's first-party computer-use surface for ordinary native
application work when it is available. Typical operations include reading an
application's accessibility state, clicking controls, entering text, scrolling,
dragging, and reading back the result.

## Codex Computer Use Bridge

To expose Codex Computer Use as directly callable tools in Claude Code,
Antigravity, or another MCP client, use a compatible MCP bridge. Codex
app-server speaks its own JSON-RPC protocol and is not itself a standard MCP
server. Delegating an entire task to a separate Codex agent through a generic
agent MCP server is a different route; do not describe it as direct access to
Codex Computer Use or assume that it exposes the same tools.

This skill ships one such bridge at
[scripts/codex-cua-bridge.mjs](../scripts/codex-cua-bridge.mjs). Read
[references/codex-cua-bridge.md](codex-cua-bridge.md) for its requirements,
registration, verification procedure, tool surface, and cost comparison against
Peekaboo.

Shipping it is not the same as it being available. It is available only once the
current client has it registered as an MCP server, which shows up as bridge tools
in the session's tool list. When those tools are absent the bridge is installed
but not registered, and registering it is a privileged change that needs the
user's authorization: say so and offer the command rather than assuming the
capability is missing. The reference has the registration and verification
steps.

**The bridge is for harnesses other than Codex.** Codex reaches the same
capability natively through its bundled `node_repl` and `@oai/sky` surface, so
routing Codex through a bridge adds a hop, loses the integration, and moves the
action outside the Codex Computer Use confirmations policy. When operating as
Codex, use the first-party surface and do not register or call a bridge.

Treat the bridge as an optional capability, not a universal dependency:

- treat bridge installation or registration as a persistent, privileged
  configuration change that requires explicit user authorization;
- verify the bridge's source and provenance; do not imply that a third-party
  bridge is an official Codex component;
- require a compatible macOS host and installed official Computer Use
  component;
- verify bridge health and upstream tool inventory before relying on it, and
  reverify after a host application update rather than assuming continuity;
- pin or compatibility-test the bridge because app-server surfaces may change;
- do not assume it works while the Mac is locked;
- apply the host agent's authorization policy before mutating UI because a
  direct bridge call does not automatically execute the Codex Computer Use
  confirmation policy.

Prefer the host's first-party surface when it provides equal capability and
better integration. Use the bridge when the host has no native UI surface or
when the bridge materially improves background-safe accessibility interaction.

## Peekaboo

Use the installed `peekaboo` skill when first-party computer use and a healthy
bridge are unavailable on macOS, or for capabilities beyond ordinary
first-party computer use:

- operating an unfocused application or a specifically identified window;
- window movement, resizing, focus, menus, Dock, Spaces, or system dialogs;
- deep accessibility inspection, identifiers, bounds, and named AX actions;
- comparing accessibility actions with synthetic input paths;
- window-scoped capture and annotated inspection;
- stable predicate verification and desktop automation troubleshooting.

Refresh Peekaboo state before interaction. Treat its element and snapshot IDs
as valid only for the observed UI state.

Reading and acting use different observations. The text-only read, `inspect_ui`
over MCP or `see --tree --no-screenshot` on the command line, is the cheap way to
inspect a tree, but its snapshot cannot drive a click:

```
Exact-window snapshot has no capture-time process-generation receipt. Run see again.
```

Use `see` when the intent is to act, and reserve the text-only read for
inspection.

Use the `vp-recording` skill when the requested artifact is a video or contact
sheet rather than an automation diagnostic.

## Final Fallback

Use screenshot interpretation and coordinate interaction only when semantic,
DOM, and accessibility paths are unavailable. Verify the visible result after
every consequential coordinate action.
