# Browser Routing

Use DOM-aware browser tooling for web-page content and interaction. Choose the
browser surface according to the session state the task requires.

## Current User Browser

Use a connected Chrome or Edge plugin when the task requires any of these:

- the user's current tabs or navigation state;
- an existing login, SSO session, passkey flow, or browser extension;
- direct handoff between the agent and user in the same browser;
- behavior that must be observed in the user's actual browser environment.

Treat access to the daily browser as a broader data boundary. Avoid unrelated
tabs and do not inspect cookies, passwords, profile databases, or storage files.

## Isolated Agent Browser

Use agent-browser when the task benefits from isolation, reproducibility,
concurrency, headless execution, worktree-scoped identity, or explicit network
and debugging controls.

- Use restore state for ordinary cookies and local storage.
- Use a dedicated managed profile when complete Chrome state is required,
  including IndexedDB, service workers, SSO, or repeated manual challenges.
- Do not combine restore state and a managed profile unless the installed
  agent-browser guidance explicitly requires it.
- Never attach routine automation to the user's daily Chrome profile. Use the
  `vp-agent-browser-session` skill for managed profile lifecycle work.
- Use a visible browser for manual authentication and sensitive challenges.

## Selection

Use the current user browser for shared state. Use agent-browser for controlled
state. A public one-off task may use any already available DOM-aware browser
that does not add unnecessary setup.

Browser chrome, download dialogs, permission prompts, and other native UI are
outside the page DOM. Route those surfaces through native UI automation.
