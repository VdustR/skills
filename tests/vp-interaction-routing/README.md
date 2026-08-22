# vp-interaction-routing tests

Coverage for `skills/vp-interaction-routing/scripts/codex-cua-bridge.mjs`.

| Suite | Needs | Run by |
|-------|-------|--------|
| `codex-cua-bridge-protocol.test.mjs` | Node only | `npm run validate`, including CI |
| `codex-cua-bridge-live.test.mjs` | macOS, ChatGPT.app with the Computer Use component | `npm run validate` on a capable host; skips elsewhere |

The protocol suite covers everything the bridge answers before it reaches
Computer Use: JSON-RPC framing and error codes, `initialize` validation and
version negotiation, notification handling, request-id rules, the advertised
tool surface and its annotations, argument validation against each tool's
schema, and graceful degradation when the Codex binary is missing.

The live suite drives the real service against Calculator, which ships with
macOS and whose display makes a performed click observable. It covers the health
report, diff versus full reads, screenshot opt-in and its size cap,
window-relative coordinates, focus preservation, cancellation actually
preventing a click, and recovery after the app-server child is killed.

`liveUnavailable()` in `helpers/mcp-client.mjs` decides whether the live suite
can run. It reports a reason instead of failing when the host cannot support it.

## Notes for anyone extending these

- **Re-read before every click.** Element indexes are valid only for the read
  that produced them. Entering an expression inserts a result row and renumbers
  every control below it, so a cached index acts on the wrong control.
- **Assert a starting state.** One press of the clear key clears the current
  entry but not a pending operation, so `resetCalculator` presses until the
  display reads zero.
- **Assert both directions.** The cancellation test also performs the same click
  uncancelled, because "the display did not change" would otherwise pass even if
  a click could never be detected.
- **`skip` must be `false`, not `null`.** Node treats any non-`undefined` value
  as a skip directive, so a null reason silently skips the whole suite.
