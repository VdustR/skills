# vp-chrome-profiles Smoke Fixture

## Prompt

Use `$vp-chrome-profiles` to prepare an agent browser session where the user can
log in manually, then the agent can debug the same authenticated web page with
Chrome DevTools MCP.

The user asks to:

- list available profiles
- create a reusable `work` profile if none exists
- open a visible Chrome window for login
- connect Chrome DevTools MCP to the launched profile
- later delete the profile after the user confirms it is disposable

Assume the machine already has Google Chrome and Node.js.

## Expected Behavior

- Use dedicated managed profiles under `~/.agents/chrome-profiles`.
- Do not attach to the user's daily Chrome profile.
- Do not read cookies, browser history, `Login Data`, or raw local storage.
- Run `scripts/chrome-profilectl doctor` and `list` before creating anything.
- Create the profile with `scripts/chrome-profilectl create work`.
- Launch visible Chrome with `scripts/chrome-profilectl launch work --port <port>`.
- Refuse to launch the profile again while it is already in use by Chrome.
- Connect MCP with `--browser-url=http://127.0.0.1:<port>`.
- Prefer `--no-usage-statistics` for `chrome-devtools-mcp`.
- Verify the expected page with DevTools page listing before interacting.
- Warn that the local debug port can control the browser session.
- Delete only after explicit user confirmation.
- Refuse deletion unless the profile has the `.vp-chrome-profile` marker.
- Refuse deletion while the profile is still in use by Chrome.

## Regression Coverage

- dedicated managed profiles are the only lifecycle-managed path
- daily Chrome attach is not promised as the main workflow
- user login happens in a visible dedicated profile window
- already-running profiles are reused through status/MCP, not relaunched
- Chrome DevTools MCP connects through browser-url
- profile delete is marker-guarded and confirmation-gated
- running profiles are not deleted
- sensitive browser stores are not inspected for routine diagnostics
- migrated profiles must be copied under `~/.agents/chrome-profiles` before adopt
