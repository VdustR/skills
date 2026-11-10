# Delivery Brief

The delivery brief is started in validate, completed in plan delivery units
before the first edit, and kept current through release. It records what the later phases act on, so that a gate is evaluated
from evidence that was read, not from an assumption carried over from another
repository or an earlier task. Every row is filled from the repository itself:
its instructions, protection settings, code-owner files, workflow files, and
documented procedures.

Policy overlays add rows; they do not remove or blank any row below.

## Rows

| Row | What to record | Evidence source |
|-----|----------------|-----------------|
| Acceptance criteria | The observable outcomes that show the change is done, and what remains out of scope | Issue disposition, user request, validate phase |
| Base branch | The branch the unit targets, and the branch the repository releases from when they differ | Repository instructions, default branch, documented branch model |
| Review and integration gating | Branch protection and rulesets; code owners for the touched paths; review automation, what it accepts, and its documented re-trigger; protected paths; size or per-unit caps | Protection settings, code-owner files, workflow files, repository instructions |
| Deploy triggers for the touched paths | Which workflows deploy, what event triggers them, and whether their path filters cover the touched paths | Workflow files on the base branch |
| Release mechanism and ownership | The cells from [release-ownership.md](release-ownership.md): who owns integration, how the repository releases, where the release conditions are evaluated, and the terminal state | Protection settings, contribution rules, release procedures, deploy workflows |
| Delivery units | The decision from [delivery-units.md](delivery-units.md): one unit or an ordered sequence, one row per unit with its review route and dependencies, and the reason | Plan delivery units phase, repository caps and routing rules |
| Host prerequisites | Each host mechanism the run will need that only the user can enable (a loop or scheduled wake-up command, a host-tracked goal, a monitor or auto-merge switch, a permission), whether it was requested, and the user's answer | Host rules, tool descriptions, the terminal state |
| Confirmation checklist | One maintained list of questions, assumptions, risks, required communication, decisions, and discovered problems; preserve the pre-implementation baseline and the pre-integration comparison below | User request, repository evidence, all delivery phases and feedback |

A row that cannot be filled from evidence is an open question in the
confirmation checklist. Resolve design-affecting questions before design.
Other questions may wait during research and planning, but must pass the
pre-implementation gate below before the first edit.

## Confirmation checklist

Maintain one canonical checklist from validate through integration; do not
rebuild a separate list for merge. Keep resolved rows and stable item IDs so
late discoveries and changed decisions remain visible. Use this record:

| Item | Matter and impact if left open | Evidence and confirmation | Required communication or decision, with outcome | Disposition | Follow-up (issue or session TODO) |
|------|--------------------------------|---------------------------|------------------------------------------------|-------------|----------------|

The dispositions are unresolved, blocking, resolved, or deferred. A deferred
item needs evidence that leaving it open cannot invalidate the accepted scope,
correctness, safety, required verification, or delivery authority. Record why
it can wait, then choose the follow-up before passing the gate or setting aside
a problem discovered during implementation:

- **Tracking issue (default):** create or reuse an issue in the authorized
  repository or internal tracker, verify it exists, and link it with the
  completion condition. Use this for durable, cross-session, externally owned,
  or uncertain-duration work. A promise to open one later is insufficient.
- **Session TODO (optional):** explicitly select this route for bounded work
  this session can own and complete before closeout. Record its owner, exact
  action, completion evidence, why it can wait past implementation or merge,
  and that it blocks BYE until discharged. This can include creating the
  tracking issue before BYE. The agent may select this for a clear, low-risk
  local obligation within its authority; follow the user's choice otherwise.
  Preserve it in the session's durable working notes and link it here so
  `vp-session-wrapup` can find it after resumption.

Neither route permits unconfirmed premises, missing necessary decisions, or
delivery blockers to pass. A denied issue write is not a reason to silently
switch to a TODO: follow the denial's remedy and authorization rules. If neither
route is valid, stop dependent work. Recording a follow-up never completes work
required by this session's acceptance criteria or transfers its responsibility.

Before implementation, explicitly check for unconfirmed assumptions, unanswered
questions, blockers, and missing necessary communication or decisions. Every
item must be resolved or confirmed safe to defer with its recorded follow-up.
Complete required communication with the decision owner; silence is not a
decision. Routine low-risk implementation choices within the agent's authority
can be recorded with their rationale without asking the user again.
Preserve a dated baseline of this checklist and the gate decision. If no
matters exist, record an explicitly checked empty list rather than omitting it.

Planned evidence such as tests on the future implementation or CI on the future
PR remains in the delivery gates; those results cannot exist before editing.
Record their acceptance conditions now and require the results at their gate.
This does not permit deferring an unknown premise that determines what to build
or a necessary human decision, nor waiving required verification through a follow-up.

After final reconciliation, immediately before merge or enabling auto-merge,
recheck the same checklist against the current head and feedback. For a
handoff to another integration owner, do this before the Ready handoff.
Confirm that no unresolved or blocking item or required communication remains,
and revalidate the justification and follow-up for each deferral. A session
TODO may remain after merge only when its completion cannot change the merge
decision; it still blocks BYE. Green CI cannot
substitute for this check. A later mutation or new finding reopens the affected
items and invalidates the gate decision.

Compare item IDs, scope, assumptions, required decisions, and deferral reasons
with the preserved pre-implementation baseline. Ideally the same list and
decisions still apply. For any addition, removal, or substantive change, use
`vp-retro` before proceeding: record the difference, when and why it emerged,
what earlier evidence or communication could have exposed it, and whether a
reusable correction is warranted. Even a justified late discovery gets this
review; do not rewrite the baseline to hide it. Routine completion of planned
verification with unchanged acceptance conditions only updates evidence and
does not itself change the list. Record the comparison and retro outcome in
the brief. Retro does not clear a blocker, authorize persistent guidance
changes, or replace any other delivery gate.

At closeout, hand the same checklist and remaining session TODOs to
`vp-session-wrapup`. Discharge each TODO by completing and verifying its action,
or by creating the promised issue and confirming the remaining work is outside
this session's acceptance criteria or has a completed authorized responsibility
transfer. Do not relabel an in-scope obligation as optional or close it merely
because an issue exists. An unfinished TODO or unknown disposition blocks BYE;
merge and session closeout are distinct decisions.

## Cross-repository work

When the change spans repositories, the brief has one section per repository,
each filled from that repository, plus the orchestration plan and readiness
check from [cross-repository.md](cross-repository.md).

## Report skeleton

End the run with this report. Policy overlays append rows; they do not remove
any.

| Section | Rows |
|---------|------|
| Delivery units | One row per unit: PR link, state (Draft, Ready, merged, released), and the gate it stopped at when it did not reach the terminal state |
| Gates evaluated | One row per gate evaluated: the gate, the decision, and the evidence it was read from (head commit, check, policy file, workflow trigger) |
| Confirmation comparison | Pre-implementation and pre-integration checkpoint references; differences and their retro outcome; issue links or explicit session TODOs for deferred items, including remaining BYE blockers |
| Escalations sent | One row per escalation: where it was posted, who was asked, the resume event, and the reply if any |
| Rollback per leg | For cross-repository work, one row per leg: rollback mechanism and whether it is still available |
| Unverified items | Everything the run could not verify, and what would verify it |
| User action | Whether the user must act, and the exact decision or step if so |
