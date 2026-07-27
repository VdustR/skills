---
name: vp-chrome-profiles
description: >-
  Manage dedicated persistent Chrome profiles for agent-assisted, login-required
  browser work. Use to list, create, launch, connect, migrate, or delete agent
  profiles. Boundary: never attach to or extract credentials from the user's
  daily Chrome profile.
---

# Chrome Profiles For Agents

Use a dedicated profile so user login and agent automation can share a
controlled browser state without exposing the daily profile.

## Rules

- Inspect existing profiles and processes before creating or launching another.
- Resolve profiles by their stored identity and path, not by a guessed port.
- Let the user perform authentication and sensitive challenges.
- Verify the connected browser's profile and target before acting.
- Treat profile deletion as destructive: inspect processes and stored data,
  confirm the exact target, then verify removal.

Use the bundled profile helper and read its current help for operations and
options. Do not manually reproduce its state-management logic.
