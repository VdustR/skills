# Agent Adapters

Map the capability names in this skill to the tools available in the current
agent. Tool discovery and installed tool documentation are authoritative; this
file records routing intent rather than a permanent tool inventory.

## Codex

- Prefer Apps, connectors, APIs, and repository CLIs for semantic operations.
- Use the connected Chrome plugin when the task requires the user's real Chrome
  state. Use agent-browser for isolated or managed-profile automation.
- Use Codex first-party Computer Use for ordinary native applications.
- Use Peekaboo for macOS system surfaces, unfocused applications, deep AX work,
  capture, and troubleshooting.

## Claude Code

- Prefer MCP connectors, APIs, and repository CLIs for semantic operations.
- Use its connected browser tooling for the user's real browser session. Use
  agent-browser for isolated or managed-profile automation.
- Use Claude Code first-party computer use when available and appropriate.
- A compatible Codex Computer Use MCP bridge is the next native-application
  option when it is installed and healthy.
- Use Peekaboo for its macOS-specific extended surface and fallback role.

## Antigravity

- Prefer MCP connectors, APIs, and repository CLIs for semantic operations.
- Use its connected browser tooling for shared browser state. Use agent-browser
  for isolated or managed-profile automation.
- Use Antigravity first-party computer use when available and appropriate.
- A compatible Codex Computer Use MCP bridge is the next native-application
  option when it is installed and healthy.
- Use Peekaboo when it is installed and the task requires its macOS-specific
  extended surface.

Do not claim that an adapter is available merely because this file names it.
Discover the current session's tools and follow their directly matching skills
before acting.
