# Native UI Routing

Use native UI automation only after confirming that no purpose-built connector,
API, CLI, or browser DOM interface can complete the current operation.

## First-Party Computer Use

Prefer the host agent's first-party computer-use surface for ordinary native
application work when it is available. Typical operations include reading an
application's accessibility state, clicking controls, entering text, scrolling,
dragging, and reading back the result.

## Codex Computer Use Bridge

Claude Code, Antigravity, and other MCP clients may use Codex Computer Use only
through a compatible MCP bridge. Codex app-server speaks its own JSON-RPC
protocol and is not itself a standard MCP server.

Treat the bridge as an optional capability, not a universal dependency:

- treat bridge installation or registration as a persistent, privileged
  configuration change that requires explicit user authorization;
- verify the bridge's source and provenance; do not imply that a third-party
  bridge is an official Codex component;
- require a compatible macOS host and installed official Computer Use
  component;
- verify bridge health and upstream tool inventory before relying on it;
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

Use the `vp-recording` skill when the requested artifact is a video or contact
sheet rather than an automation diagnostic.

## Final Fallback

Use screenshot interpretation and coordinate interaction only when semantic,
DOM, and accessibility paths are unavailable. Verify the visible result after
every consequential coordinate action.
