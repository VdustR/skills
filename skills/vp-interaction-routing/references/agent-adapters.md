# Agent Adapters

Map the capability names in this skill to the tools available in the current
agent. Tool discovery and installed tool documentation are authoritative; this
file records routing intent rather than a permanent tool inventory.

## Codex

- Prefer Apps, connectors, APIs, and repository CLIs for semantic operations.
- Use the connected Chrome plugin when the task requires the user's real Chrome
  state. Use agent-browser for isolated or managed-profile automation.
- Use Codex first-party Computer Use for ordinary native applications.
- Do not route Codex through a Codex Computer Use MCP bridge. The bridge exists
  to open this capability to other harnesses; as Codex, the bundled `node_repl`
  and `@oai/sky` surface is the direct path and keeps the Computer Use
  confirmations policy in the loop.
- Use Peekaboo for macOS system surfaces, unfocused applications, deep AX work,
  capture, and troubleshooting.

## Claude Code

- Prefer MCP connectors, APIs, and repository CLIs for semantic operations.
- Use browser tooling that demonstrably carries the user's real browser session
  when shared state is required. Use agent-browser for isolated or
  managed-profile automation.
- Use Claude Code first-party computer use when available and appropriate.
- A compatible Codex Computer Use MCP bridge is the next native-application
  option when it is registered in this client and healthy; this skill ships one
  at `scripts/codex-cua-bridge.mjs`, which still has to be registered before its
  tools exist in a session.
- Use Peekaboo for its macOS-specific extended surface and fallback role.

## Antigravity

- Prefer MCP connectors, APIs, and repository CLIs for semantic operations.
- Use available DOM-aware browser tooling for web pages, but do not assume it
  shares the user's live browser state. Use agent-browser for isolated or
  managed-profile automation.
- Use Antigravity first-party computer use when available and appropriate.
- A compatible Codex Computer Use MCP bridge is the next native-application
  option when it is registered in this client and healthy; this skill ships one
  at `scripts/codex-cua-bridge.mjs`, which still has to be registered before its
  tools exist in a session.
- Use Peekaboo as the macOS fallback when first-party computer use and the
  bridge are unavailable, and for its extended system and inspection surface.

Do not claim that an adapter is available merely because this file names it.
Discover the current session's tools and follow their directly matching skills
before acting.
