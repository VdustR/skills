# Session Coordination

Read this reference for task assignments, dependencies, reporting changes, and
continuation. Classify the relationship using `SKILL.md` before choosing an
execution surface. Classification alone does not authorize dispatch or messages.

## Establish the assignment

Use a concise brief with only the fields needed for the actual work:

| Field | What to establish |
| --- | --- |
| Outcome and relationship | Independent task or subtask, its completion conditions, and how its result relates to the originating task. |
| Delivery and acceptance | Who delivers, who accepts, who integrates, and what evidence establishes completion. Keep one accountable owner for each assigned outcome. |
| Scope and authority | The user's authorizing words, allowed resources and writes, terminal state, and stop conditions. Include the receiver's applicable repository rules. |
| Dependencies | Required inputs, their owners, readiness evidence, and the condition that permits dependent work to start. |
| Reporting window | Whether the coordinator reports to the user or the user works directly with the receiver; where urgent blockers go and who follows up. |
| Archive authority | Any separate authorization naming the actor, target, and conditions. An empty entry leaves the session open. |
| Result location | Where the receiver preserves results and evidence so the accepting owner can retrieve and use them. |

For independent tasks, default delivery, acceptance verification, and direct
user reporting to the receiving session under its own assignment. A request to
open a task does not make the originator its integration owner. For subtasks,
default user reporting to the coordinator unless the user directs otherwise;
the coordinator retains overall integration and verification. Respect explicit
assignments over these defaults.

Do not pass an entire transcript when a bounded brief suffices. Carry necessary
facts, source references, decisions, and scope; do not copy secrets or unrelated
private context. Identify stable targets through the current harness, not title
matching. Resolve identities only for the sessions needed by the task.

## Dispatch and receive

Use a supported session or subagent operation only within its authorization and
execution boundary. A session-creation response identifies a session; it does
not prove that the task ran, the recipient accepted it, or the result is valid.
Record a verified session identity when available. Missing metadata or grouping
does not stop the assignment's safe execution.

If dispatch fails or its result is uncertain, apply the non-blocking harness
policy in `SKILL.md`. Retain the existing responsibility; do not create duplicate
receivers, replay messages blindly, or claim a transfer. When no receiver
started and the current session can perform the authorized work, continue
locally. When execution may already be in progress, avoid conflicting writes
and continue independent work until ownership can be reconciled.

Verify a subtask result against its acceptance conditions and real artifacts
before consuming it or reporting the overall task complete. A receiver's
self-report is evidence to check, not acceptance by itself. Preserve required
integration and end-to-end checks with their assigned owner.

## Reporting and escalation

In single-window work, the coordinator reports to the user and retrieves the
receiver's result through an authorized route. In direct collaboration, the
receiver reports its assignment to the user and shares only what the coordinator
needs for integration. A user question in the receiving chat can be answered
there without silently transferring delivery or archive authority.

An explicit reporting change affects only that assignment. Keep the last
verified arrangement when intent is ambiguous; clarify only when the next
decision depends on it. Escalate time-sensitive risks or necessary decisions
through an authorized route. If a harness call fails, retain the result, owner,
and resume condition in accessible working state and continue independent work;
do not make successful message delivery a prerequisite for unrelated progress.

## Continue or transfer responsibility

A continuation carries the same assignment to another session; it does not
create an independent task or automatically discharge the original owner.

1. Prepare the current scope, authorized endpoint, verified state, result
   locations, remaining obligations, and next action for the receiver.
2. Use an authorized handoff route and verify that the receiving owner accepted
   the stated responsibility. Sent, received, and accepted are distinct states.
3. Record the accepted responsibility boundary. The original owner retains any
   integration, verification, or handoff obligations not included in the transfer.

If acceptance cannot be confirmed, record an unverified transfer, retain the
last verified ownership, and continue safe work. Do not report the task as
transferred or complete. When delivery and preservation are established, route
closeout to `vp-session-wrapup`; archive authority remains separate.
