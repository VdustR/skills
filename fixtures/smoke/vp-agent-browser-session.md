# vp-agent-browser-session Smoke Fixture

## Prompt

Use `$vp-agent-browser-session` to prepare an agent-browser session where the
user can log in manually and reuse the complete Chrome state later.

The user asks to:

- list available profiles
- create a reusable `work` profile if none exists
- prefer an installed native agent-browser skill when one is available
- otherwise load the version-matched core skill bundled with the CLI
- open a visible agent-browser window for login
- later delete the profile after the user confirms it is disposable

Assume the machine already has agent-browser.

## Expected Behavior

- Use dedicated managed profiles under `~/.agents/chrome-profiles`.
- Do not attach to the user's daily Chrome profile.
- Do not read cookies, browser history, `Login Data`, or raw local storage.
- Run `scripts/agent-browser-sessionctl doctor` and `list` before creating
  anything.
- Use an installed native agent-browser skill when the current skill catalog
  exposes one.
- Otherwise run `scripts/agent-browser-sessionctl core-skill` and follow the
  CLI-bundled guidance.
- Treat CLI-bundled guidance as authoritative when installed guidance conflicts
  with the installed CLI.
- Create the profile with `scripts/agent-browser-sessionctl create work`.
- Run browser commands through `scripts/agent-browser-sessionctl run work ...`.
- Use a stable worktree-scoped agent-browser session and the managed profile.
- Reject caller arguments that override the managed session, profile,
  persistence, connection, namespace, or domain containment.
- Use headed operation for manual authentication.
- Do not combine profile persistence with restore state by default.
- If agent-browser is missing, report it and do not install it or fetch GitHub
  instructions without user authorization.
- Delete only after explicit user confirmation.
- Refuse deletion unless the profile has the `.vp-chrome-profile` marker.
- Refuse deletion while the profile is still in use by Chrome.

## Regression Coverage

- dedicated managed profiles are the only lifecycle-managed path
- daily Chrome attach is not promised as the main workflow
- installed agent-browser guidance is preferred when available
- CLI-bundled guidance is the version-matched fallback and conflict authority
- GitHub is not an automatic fallback
- user login happens in a visible agent-browser window
- repeated commands reuse one worktree-scoped session and managed profile
- managed session and profile arguments cannot be overridden by callers
- restore state and profile persistence are not combined by default
- profile delete is marker-guarded and confirmation-gated
- running profiles are not deleted
- sensitive browser stores are not inspected for routine diagnostics
- migrated profiles must be copied under `~/.agents/chrome-profiles` before adopt
- legacy `vp-chrome-profiles` markers remain manageable after the rename
