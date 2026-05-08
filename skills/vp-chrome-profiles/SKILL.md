---
name: vp-chrome-profiles
description: >-
  Use when a user needs persistent Chrome profiles for agent-assisted browser
  debugging, login-required web work, Chrome DevTools MCP sessions, or shared
  manual-and-agent browser collaboration. Also use when listing, creating,
  launching, connecting, migrating, or deleting dedicated agent Chrome profiles.
  Boundary: not for attaching to a user's daily Chrome profile or extracting
  browser credentials.
---

# Chrome Profiles For Agents

Manage dedicated Chrome profiles for browser work shared between a user and
agents. Profiles live under `~/.agents/chrome-profiles/<name>` and can be opened
visibly so the user signs in, then connected to Chrome DevTools MCP through a
local debugging endpoint.

## Core Rules

1. **Use dedicated profiles** - Do not attach to the user's daily Chrome profile.
   Chrome 136+ blocks remote debugging against the default data directory, and
   attaching to a real daily profile exposes too much user state.
2. **Use named profiles** - Prefer clear names such as `work`, `personal`,
   `github-debug`, or `client-a`.
3. **Never inspect credentials** - Do not read cookies, `Login Data`, browser
   history, local storage, or profile database contents unless the user
   explicitly requests a safe redacted diagnostic.
4. **Delete only managed profiles** - Only delete profiles inside
   `~/.agents/chrome-profiles` that contain this skill's `.vp-chrome-profile`
   marker.
5. **Warn about open debug ports** - While a Chrome remote debugging port is
   open, local processes can inspect and control that browser session.
6. **Keep attach mode out of the main path** - `--autoConnect` and existing
   browser attach flows require explicit user-side setup and are not the
   supported lifecycle path for this skill.

## Helper

Resolve `scripts/chrome-profilectl` from this skill directory and use it as the
source of truth for profile lifecycle operations.

```bash
scripts/chrome-profilectl doctor
scripts/chrome-profilectl list
scripts/chrome-profilectl create work
scripts/chrome-profilectl launch work --port 9344 --url https://example.com
scripts/chrome-profilectl mcp-args work --port 9344
scripts/chrome-profilectl status --port 9344
scripts/chrome-profilectl delete work --yes
```

The default root is always `~/.agents/chrome-profiles`. For tests, set `HOME` to
a temporary directory instead of adding a custom root.

Use `--headless` only for mechanical endpoint checks. User login and debugging
sessions should be visible Chrome windows so the user can see what the agent can
inspect.

## Workflow

### 1. Inspect Existing Profiles

Run:

```bash
scripts/chrome-profilectl doctor
scripts/chrome-profilectl list
```

If no suitable profile exists, ask for the intended profile name and create it:

```bash
scripts/chrome-profilectl create <name>
```

### 2. Launch For User Login

Open a visible Chrome window with a dedicated user data directory:

```bash
scripts/chrome-profilectl launch <name> --port 9344 --url https://example.com
```

Ask the user to complete any login or setup inside that window. Do not ask the
user to paste session tokens, cookies, passwords, or other secrets into chat.

### 3. Connect Chrome DevTools MCP

Use the browser URL printed by `launch`, or generate MCP args:

```bash
scripts/chrome-profilectl mcp-args <name> --port 9344
```

For MCP client configuration, pass `--browser-url=http://127.0.0.1:<port>` to
`chrome-devtools-mcp@latest`. Prefer `--no-usage-statistics` unless the user
explicitly wants the upstream default.

### 4. Verify Before Acting

Before claiming a profile is usable:

```bash
scripts/chrome-profilectl status --port 9344
```

Then use Chrome DevTools MCP to list pages and verify the expected title or URL.
Only inspect page content needed for the user's task.

### 5. Delete Safely

Deletion is destructive. Before deleting, show the profile name and path and get
explicit confirmation. Then run:

```bash
scripts/chrome-profilectl delete <name> --yes
```

If the profile lacks a `.vp-chrome-profile` marker, stop. Do not bypass this by
removing files manually. If Chrome is still using the profile, close that Chrome
window first.

If `launch` reports that a profile is already in use, do not retry with a new
port. Use `status --port <existing-port>` when the debug port is known, or ask
the user to close that Chrome window before launching the profile again.

## Migration Notes

If the user wants to move an existing profile such as a Hermes profile, first
close every Chrome process using it. Copy the profile directory into
`~/.agents/chrome-profiles/<name>`, then run:

```bash
scripts/chrome-profilectl adopt <name> --yes
```

Adopt only profiles already inside `~/.agents/chrome-profiles`; never adopt the
daily Chrome data directory.

## Common Mistakes

- **Using `--isolated` for login work**: that creates a temporary profile and
  loses state when Chrome closes.
- **Connecting to `127.0.0.1:9222` by habit**: avoid the default Chrome debug
  port unless the user intentionally chose it and you verified the endpoint is
  the dedicated managed profile, not a daily Chrome session.
- **Launching Chrome directly on macOS**: use the helper; macOS GUI sessions are
  more reliable through `open -na "Google Chrome" --args`.
- **Expecting full Chrome logs from macOS `open`**: the profile launch log
  captures helper/open output. Chrome itself may write GUI diagnostics to system
  Chrome logs.
- **Using a temporary `HOME` for visible login**: macOS may show a Keychain
  prompt. Use the real user `HOME` for visible login, or `--headless` only for
  mechanical endpoint checks.
- **Treating extension targets as user pages**: filter DevTools pages by
  `type: "page"` and expected URL/title.
