---
name: vp-interaction-routing
description: >-
  Select the lowest-cost reliable interface for interacting with applications
  and services. Use before browser or desktop automation, especially when
  choosing among connectors, APIs, CLIs, Chrome session sharing, agent-browser,
  first-party computer use, the Codex Computer Use bridge, and Peekaboo.
  Boundary: route interactions only; use the directly matching browser,
  profile-management, desktop-automation, or recording skill to execute them.
---

# Interaction Routing

Choose the interface that provides the strongest semantics and verification at
the lowest operational cost. Authorization and correctness take precedence over
token or latency savings.

## Route

1. Use a purpose-built connector, API, or repository CLI when it fully supports
   the requested operation and required authentication context.
2. For web-page content or interaction, read
   [references/browser-routing.md](references/browser-routing.md).
3. For native application or operating-system UI, read
   [references/native-ui-routing.md](references/native-ui-routing.md).
4. When product-specific tool names or availability matter, read
   [references/agent-adapters.md](references/agent-adapters.md).
5. To give a non-Codex harness access to macOS Codex Computer Use, read
   [references/codex-cua-bridge.md](references/codex-cua-bridge.md). Codex itself
   must not use that bridge; its own `node_repl` and `@oai/sky` surface is the
   direct path.
6. Use screenshot-coordinate interaction only when semantic, DOM, and
   accessibility interfaces cannot complete the operation.

An explicitly named interface remains a user constraint. Do not substitute a
different surface merely because it appears cheaper.

## Switching And Verification

- Before GUI work, check whether an available connector, API, or CLI can
  complete the current semantic operation. Do not initialize a GUI for that
  operation until this check is complete.
- After an interaction fails, refresh the current state once. Switch interfaces
  only when the refreshed evidence shows that the current interface lacks the
  required capability or context.
- After switching, obtain new selectors or element identifiers. Never reuse DOM
  references, accessibility indexes, snapshot IDs, or coordinates from another
  interface.
- Read back the resulting state through the acting interface. Add independent
  visual or semantic verification when the operation is consequential or the
  interface reports only action completion.
- Keep browser-page content on DOM-aware tooling. Use desktop automation for
  browser chrome, native dialogs, permission prompts, and operating-system UI.
- Preserve the user's authorization boundaries regardless of which interface
  performs the action. A lower-level bridge does not inherit a host agent's
  confirmation policy automatically.

## Decision Priority

When several interfaces can complete the task, compare them in this order:

1. authorization and data boundary;
2. semantic reliability and required session state;
3. ability to verify the result;
4. isolation and reproducibility;
5. token, latency, and interaction cost.
