# vp-interaction-routing Smoke Fixture

## Prompt

Use `$vp-interaction-routing` to choose tools for four tasks:

- update a GitHub issue when an authenticated connector is available;
- inspect a page that is already signed in within the user's current Chrome;
- run repeatable signed-in web checks in parallel worktrees;
- operate a native macOS application from Claude Code or Antigravity when their
  first-party computer use is unavailable.

## Expected Behavior

- Prefer the authenticated connector for the GitHub semantic operation.
- Use the Chrome plugin when the user's current tabs, login, or extensions are
  required.
- Use agent-browser with worktree-scoped sessions and dedicated managed
  profiles for isolated, repeatable checks that require complete Chrome state.
- Do not attach agent-browser to the user's daily Chrome profile.
- Prefer the host agent's first-party computer use for ordinary native UI when
  it is available.
- Use Codex Computer Use from Claude Code or Antigravity only through a
  compatible MCP bridge; do not register codex app-server itself as MCP.
- Apply the host agent's authorization policy before a direct bridge mutation.
- Use Peekaboo for macOS windows, menus, dialogs, Spaces, unfocused apps, deep
  accessibility inspection, capture, or troubleshooting.
- Refresh state after failure and after switching tools. Do not reuse selectors
  or element identifiers across interfaces.
- Use screenshot-coordinate interaction only as the final fallback and verify
  the visible result.

## Regression Coverage

- semantic connectors precede GUI automation
- Chrome plugin preserves the user's real session use case
- agent-browser owns isolated and managed-profile workflows
- first-party computer use precedes optional bridge use
- Codex app-server requires an MCP bridge for other agents
- direct bridge calls retain host authorization requirements
- Peekaboo retains its macOS extended and troubleshooting role
- tool switching invalidates prior selectors and identifiers
- token savings do not outrank authorization or verification
