# Cross-Repository Delivery

This applies when the change spans more than one repository, or when the task
in one repository depends on a change that must land elsewhere first: a
contract and its consumer, a shared package and its callers, a definition in
one system and the code that reads it. Each repository is one leg. The session
that holds the user's request is the orchestrating session; it delivers at most
its own repository's leg and delegates every other leg.

## Each repository follows its own rules

A leg is delivered under the rules of its own repository: its instructions,
branch model, review and integration gating, deploy triggers, release
mechanism, and ownership, read from that repository. Nothing is carried over
from the orchestrating repository. The brief for each leg names the rule files
of that repository and says that they override anything the orchestrating
session assumed. The orchestrating session fills a delivery brief section per
repository, including the integration and release classification, before the
plan is written.

## The orchestration plan

The orchestrating session fills each repository's brief section and writes
the orchestration plan before any leg starts; each leg's readiness check then
runs right before that leg starts. One row per leg:

| Leg | Repository | Order (dependency terms) | Risk if it fails or ships alone | Rollback (concrete, already available) | Verification that gates the next leg |
|-----|------------|--------------------------|----------------------------------|----------------------------------------|--------------------------------------|

- **Order** is stated in dependency terms: which leg produces what the next
  one consumes, and what state the producer must reach (merged, deployed,
  published) before the consumer may start. Producer legs start before
  consumer legs.
- **Risk** names what happens when this leg fails midway or ships while the
  others do not.
- **Rollback** is a concrete mechanism that already exists for that
  repository: a revert path, a flag that turns the change off, a down
  migration, redeploying the previous version, restoring a configuration.
  "Fix forward" is not a rollback. A leg with no rollback, or whose rollback
  leaves another leg broken, goes to the user before anything starts. A leg
  that cannot be rolled back runs last, after every earlier leg is verified.
- **Verification** is the check whose success lets the next leg start, read
  at the real interface rather than inferred from the delegate's report.

A leg with material risk goes to the user before anything starts. Under an
explicit auto-development request, a plan whose every leg has a rollback and
no material risk proceeds; otherwise the plan is put to the user as one
decision, with the row that needs it named.

## Readiness check before a delegate starts

Each other repository is delivered in its own session or delegate, started
only after every item below is confirmed for that leg. A row that cannot be
confirmed stops the run with that row named; nothing starts half-ready.

| Item | Confirmed when |
|------|----------------|
| Session | The session or delegate can be created where that repository is reachable |
| Authorization | The user's authorizing words and the scope they cover are relayed in the brief, with the selected endpoint, any earlier stop required by ownership or policy, and the reason |
| Push access | The account the delegate uses can push to that repository |
| Gating known | Review and integration gating for that repository are recorded in its brief section |
| Systems reachable | Every web system, connector, or service the leg needs is reachable and signed in |
| Identifiers verified | Every resource identifier the leg must use is known and verified against the live system |
| Permissions | Permissions on those resources hold for the account the delegate uses |
| Hand-off values | Every value the leg consumes from an earlier leg, or produces for a later one, is fixed and written in the brief |
| Stop conditions | The gates at which the delegate must stop and report are relayed |
| Rollback executable | The assigned rollback can be executed by the account and tools the delegate has |

## Running the plan

- Producer legs start before consumer legs, and a consumer starts only after
  the producer's gating verification passed.
- A delegate's report is a claim. Verify it against the plan at the real
  interface before letting the next leg start or reporting the leg done.
- A leg that fails verification stops the run. If anything shipped, execute
  its rollback, then report what shipped, what was rolled back, and what
  remains.
- A change to the plan after a leg started (a new leg, a changed order, a
  rollback that turned out unavailable) stops the run until the plan is
  rewritten and the affected readiness rows are reconfirmed.

## Coordinate by assignment

Record these decisions for each leg before dispatch. Use the user's current
instructions or applicable policy. Session creation, ancestry, and sidebar
membership identify relationships but do not establish any of these decisions.

| Decision | What to record |
|----------|----------------|
| Delivery | Who delivers the result, who accepts it, the terminal state, and the evidence or artifact the receiver needs. The orchestrator still owns integration and verification of its dependencies. |
| User reporting | Whether the orchestrator is the single contact or the user works directly with the delegate for this leg. Record where urgent blockers and decisions go and who follows up if receipt is pending. |
| Archive | Any separate authorization identifying the actor, target, and conditions. An empty entry leaves the chat open. Route an authorized closeout to `vp-session-wrapup`. |

In single-contact mode, the delegate makes the result and non-urgent findings
available to the orchestrator for consolidation. In direct mode, the delegate
reports details to the user, and the orchestrator receives only what its
dependencies or overall outcome require. Use a permitted delivery route. Where
pushing a message needs separate authorization, the orchestrator can read the
delegate's result and confirm acceptance through a supported route.

Apply an explicit change of reporting contact only to its stated assignment.
A question or a correction in the delegate chat can be answered there while
the recorded reporting contact remains in place. A reporting change by itself
does not reassign delivery, acceptance, or archive authority. Keep the last
verified arrangement when the evidence is ambiguous and clarify only when it
affects a pending decision.

Escalate a time-sensitive blocker or required decision through the authorized
route promptly. If the receiver is unavailable, keep the result or blocker
accessible, record the owner and resume condition, and stop affected work.
Sent and accepted are separate states. Before the next leg starts, verify
the prerequisite at the real interface and record its acceptance. A completed
transfer of responsibility additionally requires the receiving owner's
confirmation.

## Group sessions after dispatch

When dispatch returns the canonical identity of a child session, the
orchestrating session checks whether grouping is authorized and hands eligible
sessions to [`vp-session-organization`](https://github.com/VdustR/skills/tree/main/skills/vp-session-organization).
Use the verified parent-child relationship to scope the operation. Reuse a
suitable group, preserve the user's existing organization, and read back both
sessions' membership before reporting them as grouped.

Report the grouping result separately from the repository leg's delivery
status. For a child session whose identity is missing, or when grouping is
unauthorized, unavailable, or unverified, record the reason and continue the
repository delivery checks.

## Report

Each leg appears in the final report with its repository, state, rollback
availability, and the verification that was run, alongside the
single-repository report rows.
