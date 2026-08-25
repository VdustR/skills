---
name: vp-agent-browser-session
description: >-
  Manage persistent, login-required agent-browser sessions and dedicated Chrome
  profiles. Use to select installed or CLI-bundled agent-browser guidance,
  create, reuse, migrate, inspect, or delete managed profiles, and run
  agent-browser with a stable worktree-scoped session. Boundary: never attach to
  the user's daily Chrome profile or inspect sensitive browser stores.
---

# Agent Browser Sessions

Delegate browser operation details to agent-browser's complete, version-aware
guidance. Keep this skill focused on session selection and safe profile
lifecycle management.

## Load Agent Browser Guidance

If a native agent-browser skill is available in the current skill catalog, read
and follow it completely. Otherwise, run the bundled helper's `core-skill`
command and follow the returned CLI-bundled guidance. Treat CLI-bundled guidance
as authoritative when installed guidance conflicts with the installed CLI.

If agent-browser is unavailable, report the missing dependency. Do not install
it or fetch instructions from GitHub without user authorization.

## Select Persistence

- Use agent-browser restore state for ordinary cookies and local storage.
- Use a managed profile for login flows that require complete Chrome state,
  including IndexedDB, service workers, SSO, or repeated manual challenges.
- Do not combine restore state with a managed profile.
- Use a stable worktree-scoped session for each managed profile. Run browser
  commands through the helper so the session and profile remain consistent.
- Do not pass alternate session, profile, restore, state, connection, namespace,
  or domain-containment flags through the helper's managed `run` command.
- Close only the managed session; do not pass `close --all` through the helper.

## Rules

- Inspect existing profiles and processes before creating or launching another.
- Reuse a running managed session; do not launch the profile through another
  browser process.
- Resolve profiles by their stored identity and path.
- Use a visible window for user authentication and sensitive challenges.
  Reserve headless operation for mechanical checks.
- Do not read cookies, Login Data, browser history, raw local storage, or profile
  databases unless the user explicitly requests a safe redacted diagnostic.
- Treat profile deletion as destructive: inspect processes and stored data,
  confirm the exact target, then verify removal.
- Delete only profiles inside the managed root with the helper's marker. Adopt
  only unmarked Chrome profiles already copied into the managed root, letting the
  helper create the marker. Never delete or adopt while Chrome is using them.

Use the bundled session helper and read its current help for operations and
options. Do not manually reproduce its profile or session identity logic.

## Related skills

- [`vp-long-running-processes`](https://github.com/VdustR/skills/tree/main/skills/vp-long-running-processes)
  for browser processes that must remain running outside the current task.
- [`vp-session-wrapup`](https://github.com/VdustR/skills/tree/main/skills/vp-session-wrapup)
  when a session ends with managed profiles or browser state to report.
