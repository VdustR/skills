# Pull Request Event Streams

Use `gh event listen` to wait for supported PR changes instead of repeatedly
fetching unchanged state. Events are prompts to reconcile current state, not
proof that the calling workflow's review, CI, or merge gate passed.

## Check capability and coverage

Check `gh version` and `gh event listen --help`. The preview requires GitHub CLI
2.105.0 or later, GitHub.com, and Event Streams access for the account behind the
credential. It is unavailable on GitHub Enterprise Server and GHE.com. User
tokens and installation tokens need read access to the PR; an installation's
preview access does not enable its members' user tokens. Do not infer access
from a working command or upgrade, enroll, or broaden credentials without the
task's authorization.

Prefer a host notification that covers the awaited transition. Supplement an
incomplete host monitor with Event Streams only when the host permits the
listener and can resume the caller. An in-turn command wait or a verified
host-managed background completion notification can provide that resumption.
Starting a process or printing JSON alone does not wake an ended agent turn.
When the command, account, platform, signal, or resume path is unsupported,
retain a host-permitted fallback and report any uncovered required signal.
Never bypass a host restriction on waiting or polling.

| Needed signal | Event suffix after `com.github.pull_request.` |
| --- | --- |
| Submitted review, including individual review comments and replies | `review.submitted.v1` |
| Merge, close, reopen, Ready, or conversion to Draft | `state.changed.v1` |
| New PR head commit | `head.changed.v1` |
| Detected merge conflict | `merge_conflict.v1` |
| A check suite on the head completes, regardless of conclusion | `check_suite.status.changed.v1` |

PR conversation issue comments and REST commit statuses have no corresponding
events in this preview. The documented event list also provides no reaction
event. Retain the calling workflow's inspection of those surfaces. Conflict
detection depends on GitHub evaluating the PR and can be delayed. A check-suite
event cannot substitute for a deployment or arbitrary workflow-run signal.

## Listen, then reconcile

For example, wait for a check suite to complete on an already identified PR:

```bash
gh event listen --resource https://github.com/OWNER/REPO/pull/NUMBER \
  --event com.github.pull_request.check_suite.status.changed.v1 \
  --timeout 10m
```

Choose event types for the actual gate, including head and terminal state changes
when they invalidate the wait. Repeat `--event` or use comma-separated types.
The command emits one CloudEvent JSON object per stdout line; status messages
go to stderr. It exits after the first event by default. `--count` waits for a
number of events; `--follow` keeps listening. Bound either mode by the task's
budget with `--timeout` rather than relying on its unlimited default.

1. Start the listener through the selected host-permitted execution mechanism.
   Wait for `Listening for events.` on stderr, then read the PR's current state
   even if stdout is empty or a previous read showed pending work. The execution
   interface must let the caller inspect that attachment message and fetch state
   while the listener runs; a wholly blocking call cannot establish this order.
2. Reconcile again on every attachment after reconnecting. There is no replay:
   changes before attachment or during a disconnect may never appear as events.
   Automatic CLI reconnection does not recover those changes.
3. After each event, read the current head and the signals required by the
   caller. `data.api_url` identifies the changed object; most events do not
   contain its resulting state. Events may be duplicated or out of order, so
   make decisions from fetched state rather than event count or arrival order.
4. For CI, read all applicable PR checks, for example with `gh pr checks`, and
   any separately required commit statuses. Each completed suite emits its own
   event and includes `data.conclusion`; one `success` does not mean all checks
   passed. A new head invalidates earlier positive evidence.
5. Stop when the caller's gate is verified or the task is canceled, the budget
   expires, access is lost, or the PR reaches a state that ends the task. If a
   one-event listener exits before the gate passes, reattach and reconcile
   before waiting again. Timeout exits with status `8`; it is not a pass.

The CLI handles stream reconnection and expired-subscription recreation.
For service errors, follow the official error table: do not retry an account
access `403` or an inaccessible subscription `404`; correct the prerequisite
or use an authorized fallback. Respect `Retry-After` and bounded backoff for
transient errors. Keep required missing evidence visible to the caller.

## Own the subscription lifecycle

`listen --resource` creates a subscription or reuses an active subscription for
the same PR and event types. It leaves the subscription after exit. Subscriptions
expire after 24 hours; the preview permits up to 100 active subscriptions per
user, app, or installation token. Record the actual subscription and consumers
before deleting it. Never infer exclusive ownership from having run `listen`.

Use `gh event subscription list`, `view`, `create`, and `delete` when explicit
lifecycle management is needed. `create` is idempotent too; it does not prove a
subscription is new. `listen --subscription` attaches to a known subscription.
Stop task-owned streams first, then delete only a subscription whose ownership,
remaining consumers, and cleanup authorization are established. Deletion does
not close open streams. Preserve shared subscriptions. For subscriptions made
with a workflow's nonrenewable `GITHUB_TOKEN` and owned exclusively by that job,
stop their streams and delete the subscriptions before the job ends.

## Sources and verification limits

Reviewed November 19, 2026 against the [CLI listen manual](https://cli.github.com/manual/gh_event_listen),
the [subscription command](https://cli.github.com/manual/gh_event_subscription_create),
and [Using GitHub Event Streams](https://docs.github.com/integrations/how-tos/using-github-event-streams).
These are preview contracts and can change. The
[public feedback discussion](https://github.com/orgs/community/discussions/211595)
also describes a local consumer test that found completed checks through a read
after attachment; its author explicitly lacked preview access. That is useful
scenario evidence, not a live-service test. Decision walkthroughs and static
fixtures do not establish account access, service delivery, or harness wake-up.
