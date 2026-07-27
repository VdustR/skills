---
name: vp-chrome-profiles
description: >-
  Manage dedicated persistent Chrome profiles for agent-assisted, login-required
  browser work. Use to list, create, launch, connect, migrate, or delete agent
  profiles. Boundary: never attach to the user's daily Chrome profile or inspect
  sensitive browser stores from any profile.
---

# Chrome Profiles For Agents

Use a dedicated profile so user login and agent automation can share a
controlled browser state without exposing the daily profile.

## Rules

- Inspect existing profiles and processes before creating or launching another.
- Reuse a running managed profile; do not relaunch it on another port.
- Resolve profiles by their stored identity and path, not by a guessed port.
- Use a visible window for user authentication and sensitive challenges.
  Reserve headless launches for mechanical checks.
- Do not read cookies, Login Data, browser history, raw local storage, or profile
  databases unless the user explicitly requests a safe redacted diagnostic.
- Connect only to the helper-reported endpoint, then verify the profile and
  target before acting.
- Warn that while the local debugging port is open, other local processes can
  inspect and control the authenticated browser session.
- Treat profile deletion as destructive: inspect processes and stored data,
  confirm the exact target, then verify removal.
- Delete only profiles inside the managed root with the helper's marker. Adopt
  only unmarked Chrome profiles already copied into the managed root, letting the
  helper create the marker. Never delete or adopt while Chrome is using them.

Use the bundled profile helper and read its current help for operations and
options. Do not manually reproduce its state-management logic.
