---
name: vp-session-management
description: >-
  Manage task relationships across agent sessions: automatically distinguish
  independent tasks from subtasks, coordinate delivery, reporting, dependencies,
  and responsibility transfers, and manage authorized session names and groups.
  Use for session delegation or continuation, naming requests, or when a durable
  objective becomes clear or changes under a standing naming policy.
  Boundary: grants no session-operation authority; domain workflows own execution
  and verification, and vp-session-wrapup owns closeout. Harness failures do not
  block the underlying task.
---

# Session Management

Keep task responsibility explicit across sessions. Session ancestry, sidebar
membership, and the tool used to create a session do not assign responsibility.

## Choose the relevant workflow

- **Title suggestions only:** Return only the title unless alternatives or
  rationale were requested. Read the naming guidance in
  [session metadata](references/session-metadata.md); make no metadata calls,
  even under a standing auto-naming policy.
- **Task coordination:** Classify the work below, then use
  [session coordination](references/session-coordination.md) for an assignment,
  dependency, reporting change, or responsibility transfer.
- **Metadata management:** Use [session metadata](references/session-metadata.md)
  and its [decision tree](references/decision-tree.md) for authorized naming or
  grouping. Read only the relevant
  [harness guidance](references/harness-capabilities.md) when selecting a route.

Use only the workflow needed for the request. A naming request does not require
delegation planning; a task assignment does not require successful sidebar
updates. Domain workflows still own implementation and acceptance checks.

## Classify by the assigned outcome

Determine the current session's promised outcome and completion conditions
before classifying another assignment. Automatically infer the relationship
from the user's request and verified task context; do not ask merely to choose
a label.

| Type | Decision rule | Default responsibility |
| --- | --- | --- |
| Independent task session | The work has its own completion conditions and is outside the current session's required deliverables. It may concern the same product or repository. | The receiving session delivers, verifies, and reports its own assignment. Its unfinished work does not block the originating session. |
| Subtask session | The work is a necessary part of the current session's assigned outcome and its result must feed back into that outcome. | The child delivers its assigned result; the coordinator retains integration, acceptance, and overall delivery. |

Use `subtask` as one word. Avoid `branch task session`, which can be confused
with a Git branch or a conversation fork. These are workflow terms, not claims
that a harness stores these types natively.

Track other relationships separately rather than adding task types:

- **Related work:** A reference between independently deliverable tasks.
- **Dependency:** A required result from another task, including one that
  already exists and is not controlled by this coordinator.
- **Continuation or responsibility transfer:** The same assignment moves to a
  new session or owner. Transfer is complete only when authorized and accepted;
  creating or forking a chat alone does not transfer responsibility.
- **Work role:** Research, implementation, testing, or review describes an
  assignment's role, not whether it is independent or a subtask.

Resolve uncertainty only when it changes a pending responsibility, authorization,
or acceptance decision. Do not infer independence merely because the receiver
reports directly to the user, or infer dependency merely from shared ancestry.
Reassess a relationship when the assignment materially changes; record the
changed responsibility rather than silently dropping an existing obligation.

## Preserve authority and ownership

Classification and this skill grant no permission to create, fork, message,
interrupt, archive, delete, or migrate sessions. Naming and grouping authority
does not authorize these operations either. Use only operations the user and
current harness permit. A user-owned chat and a temporary in-process subagent
are distinct execution surfaces; neither is an implicit substitute for the
other.

Record delivery responsibility, the user-facing reporting window, and archive
authority separately before an authorized dispatch. Relay the user's authorized
scope and terminal state to the receiver. A report being sent or a child turn
ending does not establish acceptance or release the coordinator's obligations.
Use the coordination reference for the brief and handoff procedure.

## Skip harness problems without blocking the task

Treat unsupported operations, failed calls, timeouts, and inconclusive readback
as problems with the affected session operation. Stop or skip that operation,
retain the last verified state, and continue safe, authorized task work. Do not
turn session bookkeeping into a task blocker, required user action, or BYE TODO.

A failed response does not prove the write failed. If a cheap, supported
read-only check can clarify the exact target, use it; otherwise leave the
result unverified and move on. Do not loop on discovery, blindly repeat a
write, launch disruptive clients, or change permissions to obtain confirmation.
Retry only when new evidence, a relevant capability change, or a user request
justifies it. Stop denied actions and honor applicable controls; skipping an
operation does not permit bypassing a denial.

If dispatch fails, keep the assignment with its existing owner and continue
locally or sequentially where feasible. If dispatch or message delivery is
uncertain, do not assume a receiver started, accepted, or stopped work; avoid
duplicate work that could conflict with a possibly active receiver. Continue
independent work and reconcile ownership when evidence becomes available.

Report a skipped operation briefly when the user requested it or uncertainty
affects coordination. Do not claim success without evidence, repeatedly report
the same limitation, or require the user to repair the harness before the main
task can proceed. Required substantive deliverables and their verification
remain required: report any unmet outcome as such, rather than treating harness
bookkeeping as a new completion gate.

Use the [decision scenarios](references/decision-scenarios.md) when reviewing
changes. Manual walkthroughs and static fixture checks do not prove automatic
skill selection or live cross-harness behavior.

## Related skills

- [`vp-interaction-routing`](https://github.com/VdustR/agent-plugin-vp-interaction-routing/tree/main/skills/vp-interaction-routing)
  when selecting an eligible interface for an authorized session operation.
- [`vp-autodev`](https://github.com/VdustR/skills/tree/main/skills/vp-autodev)
  when a coordinated assignment requires development delivery and integration.
- [`vp-session-wrapup`](https://github.com/VdustR/skills/tree/main/skills/vp-session-wrapup)
  when an assigned outcome is ready for closeout or authorized archival.
