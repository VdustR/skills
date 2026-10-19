---
name: vp-session-wrapup
description: >-
  Close out an agent session: summarize the outcome and open items, then find
  leftover state such as scratch files, uncommitted or unpushed Git work,
  running services, staged secrets, and temporary configuration. Use when the
  user ends, wraps up, hands off, or archives a session, including a
  conditional request to clean up whatever carries no risk. Boundary: use
  vp-retro for workflow improvement analysis after identifying a strong,
  actionable improvement candidate.
---

# Session Wrap-Up

Leave the session archivable: nothing important unrecorded, and nothing hidden
still running, staged, or half-finished.

## Conditional goodbye

Interpret `bye` as `bye if no risk or todo for this session`. Quoted examples
and requests to edit the bye workflow do not end the current session.

Establish this session's responsibility from its initial assignment and any
explicit scope changes before deciding what counts as a TODO. A session assigned
only a subtask can finish when that subtask and its required verification and
handoff are complete. Unfinished work owned by a parent, sibling, or other
session is not this session's TODO merely because it is visible, related, or in
the same repository. Mention relevant external work separately without taking
it over or using it to block an otherwise complete subtask session.

If this session owns the overall goal, evaluate completion against that goal.
Delegating implementation does not remove responsibility for required subtasks,
integration, or final verification. Necessary work still pending in another
session remains a TODO or dependency blocker for the goal-owning session. The
same applies when an assigned subtask itself requires another session's output
to meet its acceptance criteria. Use the assigned responsibility, not the
session's parent or sibling label, to decide the boundary; resolve material
ownership uncertainty from the task context before claiming completion.

Complete authorized, safe remaining work before closeout. Identify unresolved
risks, unfinished obligations, required decisions, and incomplete verification.
A recorded follow-up is still open work; recording it does not satisfy the
condition. Distinguish session obligations from optional future improvements
and intentionally retained state. Do not invent work to keep the session open.

A completed responsibility transfer is different from delegation. Exclude
transferred work from this session's TODOs only when the receiving owner has
confirmed the handoff, the transfer is within the user's authorized scope, and
this session's required handoff and verification are complete. A suggested
owner or a handoff note alone does not transfer responsibility. Unrelated work
does not block closeout.

An optional improvement awaiting approval is not an existing session TODO.
State its pending status separately. If session risks or TODOs remain, report
them and the next action without claiming the session is clear. Archiving and
other mutations still follow the applicable authorization rules.

### Validate blockers and actions

Before concluding that the session cannot bye, verify each proposed blocker
against current evidence and this session's acceptance criteria. Remove stale,
irrelevant, optional, or already transferred items from the blocker list.
For every remaining blocker, validate the next action before recommending it:

- Name the actor, exact target and operation, and observable completion result.
- Check that the operation is supported, its prerequisites and permissions are
  available or obtainable, and the actor can actually perform it. Identify any
  missing prerequisite rather than presenting a conditional step as runnable.
- Explain how it reduces the risk, advances the assigned outcome, or obtains
  evidence needed for a decision. Reject vague advice, ineffective busywork,
  impossible operations, and retries with no new evidence or recovery condition.

Waiting for an external event is a dependency, not an executable action. Check
the current state once when useful; do not turn repeated polling or "wait
longer" into progress. If a genuine session obligation is blocked and no
controllable action exists, say so explicitly. Name the dependency owner when
known, the observable event needed to resume, and any verified feasible
escalation or responsibility-transfer option. Do not invent an action or claim
completion merely because neither the agent nor the user controls the wait.

Only after this check, classify the closeout state. For a non-ready result,
present the validated actions and prerequisites, or the explicit absence of a
controllable action, then ask whether the user wants AUTO Flow for the named
remaining scope. Explain what can run now and what remains gated. If only an
external dependency remains, make clear that AUTO Flow cannot remove it and
that later execution requires that prerequisite. The offer does not authorize
monitoring, scheduling, external messages, or unsupported automatic resumption.
If AUTO Flow is already authorized for that scope, continue its feasible work
without asking again; ask only for a new decision or required approval. After
acceptance, use `$vp-autodev` for development or the directly matching workflow
for other work. An AUTO Flow offer or acceptance never bypasses a risk gate.

### Closeout decision

Use the first applicable state below after completing safe, authorized work.
Report any additional blockers alongside it; the primary state must not hide
them. Risk means a concrete unresolved risk relevant to closing this session,
not hypothetical risk or the mere existence of retained state.

| State | Condition | Decision |
| --- | --- | --- |
| Unresolved risk | Closing would leave a concrete risk, such as exposed credentials or unique work without a safe recovery path. | Cannot bye; identify the risk and the action or approval needed. |
| Actionable TODO | Required work or verification remains within this session's responsibility and can proceed. | Cannot bye; continue authorized work or name the next action. |
| Waiting or blocked | A session obligation requires another result, a user decision, permission, or an unavailable service. | Cannot bye; name the dependency, owner, and condition for resuming. |
| Unverified | Evidence is insufficient to establish completion, ownership, or safe closeout. | Cannot confirm bye yet; identify the missing evidence and how to obtain it. |
| Ready to close | No unresolved session risk or TODO remains, including required verification and handoff. | Can bye, including when only confirmed transferred work, unrelated work, optional improvements, or intentionally retained safe state remains. |

End every closeout report with one standalone sentence stating the decision in
the user's language. When ready to close, explicitly say that the user can bye;
in Traditional Chinese, use `可以 bye。` as the final sentence. Readiness phrasing
such as "ready to close" alone is insufficient. For unresolved risk, actionable
TODOs, or blockers, use `目前不能 bye。`; for insufficient evidence, use
`目前尚無法確認可以 bye。` Explain reasons, validated actions or the lack of a
controllable action, and any AUTO Flow question before that sentence.
Place links, notes, and optional suggestions before it, with nothing after it.
This decision reports readiness; it does not itself archive the session or
authorize any mutation. Requests to edit this workflow remain editing tasks
and do not require a closeout verdict.

### Ready-to-close retro

Once the session otherwise qualifies as ready to close, check its evidence for
actionable improvements to skills, AGENTS.md, or local agent memory. A candidate
needs an observed problem, a feasible effective correction, and enough reuse
value to justify persistence. Identify the exact target, proposed change,
expected benefit, and a representative verification. Reject vague reminders,
unsupported diagnoses, impossible fixes, and changes already covered correctly
by existing guidance.

Present qualifying candidates to the user first, then apply `$vp-retro` to
classify them and refine the recommendation before the final bye verdict. This
handoff does not itself authorize edits; preserve authorization already granted
within its scope, including an applicable auto-development request. An optional
proposal awaiting approval does not block bye. With no qualifying candidate,
briefly report that no actionable retro improvement was found and skip retro;
do not manufacture a recommendation or make every goodbye a full audit.
Recheck closeout only if the analysis exposes a genuine in-scope risk or TODO.

## Report

Summarize the outcome, not the transcript: what changed, what is verified and
what is only assumed, decisions worth keeping, where the work lives, and the
next action for whoever resumes it.

Then inventory what this session created or started that outlives it, derived
from the session's own actions rather than a fixed checklist. Common sources:
Git and pull request state, scratch files and logs, processes and background
jobs, secret material, external or shared writes, and configuration changed
only to unblock the task.

## Cleanup

Remove an item only with evidence that this session created it, that it holds
no unique work, and that it can be reproduced. Name what will be removed before
removing it, and verify the result.

Report instead of removing when the item predates the session, holds unfinished
work, is shared or remote, is hard to reverse, or has unclear ownership.
Uncertainty is a reason to report. For secret material, prefer unstaging and
reporting, and leave credential files to the user.

Wrap-up closes work; it does not start unrelated implementation. Record a newly
found problem as a follow-up. Count it as a session TODO only when it affects
this session's assigned outcome or required verification; report unrelated
follow-ups separately without blocking closeout. Recording an in-scope problem
does not complete it. Improvement analysis follows the handoff above; applying
a recommendation requires authorization that covers that change.

## Related skills

- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for Git
  and pull-request state found during closeout.
- [`vp-long-running-processes`](https://github.com/VdustR/skills/tree/main/skills/vp-long-running-processes)
  for services that must be stopped or left running intentionally.
- [`vp-env-secrets`](https://github.com/VdustR/skills/tree/main/skills/vp-env-secrets)
  for staged or temporary secret material.
- [`vp-agent-browser-session`](https://github.com/VdustR/skills/tree/main/skills/vp-agent-browser-session)
  for managed browser sessions and profiles.
- [`vp-retro`](https://github.com/VdustR/skills/tree/main/skills/vp-retro) when
  a strong, doable improvement has been presented, or the user requests analysis.
