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

Before closing, check the session evidence for strongly recommended, doable
improvements to skills, AGENTS.md, or local agent memory. A candidate needs an
observed problem, a feasible correction, and enough reuse value to justify
persistence. Present qualifying candidates to the user first, then apply
`$vp-retro` to classify them and refine the recommendation. This handoff does
not itself authorize edits; preserve authorization already granted within its
scope, including an applicable auto-development request. With no qualifying
candidate, skip the retro;
do not manufacture a recommendation or make every goodbye a full audit.

An optional improvement awaiting approval is not an existing session TODO.
State its pending status separately. If session risks or TODOs remain, report
them and the next action without claiming the session is clear. When none
remain, say the session is ready to close. Archiving and other mutations still
follow the applicable authorization rules.

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
