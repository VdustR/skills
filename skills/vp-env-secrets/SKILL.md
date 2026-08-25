---
name: vp-env-secrets
description: >-
  Safely inspect, select, stage, persist, or load sensitive environment
  variables from dotenv files using dotenvx. Use for API keys, tokens,
  credentials, local secret files, or commands that need those values.
---

# Environment Secrets

Use the bundled helper for secret handling and expose names or metadata, never
values, unless the user explicitly requests a safe destination.

## Rules

- Resolve the exact dotenv files and precedence before loading anything.
- Keep secrets out of command text, process listings, logs, tool output, chat,
  commits, and reusable artifacts.
- Use one-shot process injection by default; persistence requires explicit
  authorization and a named target.
- Never copy values between personal and company scopes without confirming
  identity and destination.
- Treat malformed files, expansion, quoting, and duplicate keys as semantic
  concerns rather than editing them blindly.

Inspect the helper's current help before use. Verify only key presence and the
authorized operation's outcome.

## Related skills

- [`vp-session-wrapup`](https://github.com/VdustR/skills/tree/main/skills/vp-session-wrapup)
  when a session may have left staged or temporary secret material.
