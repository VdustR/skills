# vp-interaction-routing tests

Coverage for `skills/vp-interaction-routing/scripts/codex-cua-bridge.mjs`.

| Suite | Needs | Run by |
|-------|-------|--------|
| `codex-cua-bridge-protocol.test.mjs` | Node only | `npm run validate`, including CI |
| `codex-cua-bridge-approvals.test.mjs` | Node only, via a fake upstream | `npm run validate`, including CI |
| `codex-cua-bridge-runtime.test.mjs` | Node only, via a fake upstream | `npm run validate`, including CI |
| `codex-cua-bridge-live.test.mjs` | macOS, ChatGPT.app with the Computer Use component | `npm run validate` on a capable host; skips elsewhere |

`helpers/fake-app-server.mjs` stands in for the Codex binary. The bridge spawns
it as `<bin> app-server --stdio`, so behavior that needs a live upstream can be
tested without ChatGPT.app: reverse approval requests, the output cap, and the
timeout that tears down the shared session. Point the bridge at it with
`CODEX_CUA_BRIDGE_CODEX_BIN`.

The protocol suite covers everything the bridge answers before it reaches
Computer Use: JSON-RPC framing and error codes, `initialize` validation and
version negotiation, notification handling, request-id rules, the advertised
tool surface and its annotations, argument validation against each tool's
schema, and graceful degradation when the Codex binary is missing.

The approvals suite covers the bridge's primary safety boundary: each reverse
request method answered in its own response shape, recognized approvals declined
by default, unclassifiable requests refused with `-32601`, and
`CODEX_CUA_BRIDGE_AUTO_APPROVE` flipping only the recognized ones.

The runtime suite covers the output cap, the timeout and session reset,
protocol-reserved `_`-prefixed keys being tolerated but not forwarded, and the
standalone CLI.

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
- **Assert a starting state, and prove it settled.** One press of the clear key
  clears the current entry but not a pending operation, which survives as a
  separate result row. A single read can also race the previous test's actions
  still landing, which was observed leaving a stale value in place and failing
  the cancellation test only in the full run. `resetCalculator` therefore
  requires no pending expression and two consecutive identical readings.
- **Share one index between the negative and positive halves.** The cancellation
  test resolves `element_index` once and uses it for both the cancelled and the
  allowed click. A stale index pointing at something that does not change the
  display would otherwise satisfy the cancelled half for the wrong reason.
- **Assert both directions.** The cancellation test also performs the same click
  uncancelled, because "the display did not change" would otherwise pass even if
  a click could never be detected.
- **`skip` must be `false`, not `null`.** Node treats any non-`undefined` value
  as a skip directive, so a null reason silently skips the whole suite.
- **Suites run serially.** `validate-skills.sh` passes `--test-concurrency=1`.
  The live suite drives one shared macOS UI, and parallel files also saturate the
  machine enough to trip request timeouts.
- **Assert the negative capability too.** `frontmostApp()` fails when `osascript`
  cannot answer, because an empty string on both sides of the focus comparison
  would pass even if focus had been stolen.
- **Validation fails when no suite is found.** An unmatched glob would reach
  `node --test` literally and exit zero having run nothing.
- **Ask AppKit for the frontmost app, not System Events.** Its AppleEvent IPC
  blocks under load; it has been seen timing out after two minutes on a machine
  where the AppKit query answered in a fraction of a second. Note that a
  `spawnSync` timeout reports a null status, so say so rather than printing an
  unexplained `null !== 0`.
- **Assert what crossed the boundary, not just the response.** The upstream
  ignores arguments it does not know, so a forwarded `_meta` would still produce
  a successful call. `FAKE_ARGS_LOG` records the real arguments to assert on.
- **Prove the process changed, not just the message.** The timeout test compares
  upstream pids via `FAKE_PID_LOG`; asserting only on "session was reset" would
  pass if the reset regressed to reusing the hung process.
- **Keep draining after the expected response.** The cancellation test continues
  reading for a grace period, because a regressed bridge could answer the
  cancelled request just after the occupying one.
- **Assert the value, not the absence of an error.** A tolerated numeric
  `element_index` must arrive upstream as the integer it names. Checking only
  that validation passed would miss a coercion that mangled it, and targeting
  the wrong element is the defect that tolerance once caused.
- **Mutation-check an assertion you rely on.** Forcing `element_index` to zero in
  the bridge makes that test fail, which is how its value was confirmed rather
  than assumed.
