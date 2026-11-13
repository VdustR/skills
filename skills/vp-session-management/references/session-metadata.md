# Session Metadata

Read the naming guidance for title suggestions. Read the operation procedure
only when naming or grouping metadata needs to change. Generating a title alone
does not require session enumeration, coordination planning, or metadata tools.

## Naming guidance

Identify the context and intended outcome from the conversation. Once they are
clear, prefer a short title with concrete nouns and an action or state when
useful. Include the product, repository, or domain when needed to distinguish
the work; avoid generic labels, incidental tool names, and bare ticket numbers.
Use the user's language unless they request another. Do not imply completion
that has not been verified or expose sensitive details in sidebar metadata.

Preserve an explicit user-chosen name unless the user authorizes replacing it.
Keep an existing name that already describes the durable goal. If the goal is
still unclear, defer automatic renaming; an explicit naming request can use the
best-supported theme without inventing missing context.

Under standing auto-naming authorization, proactively check the displayed name
when an exploratory discussion first settles on a concrete direction, including
when the user proceeds directly to implementation without mentioning naming.
Do this as part of starting that work, without another naming request. Replace
a vague opening-prompt title or an outdated automatically managed name with the
now-clear context and intended outcome, then read it back. Keep an already
accurate title or a protected user-selected name. Initial clarification is a
naming trigger even when the overall topic has not changed; entering an
implementation phase alone is not.

A request to keep the current name is a preservation outcome, not a rename
operation that needs capability discovery. Report it as kept, not unavailable.

Revisit an automatically managed name only when the durable objective materially
changes. A new command, temporary investigation, implementation phase, test
failure, or completion of one subtask normally leaves the objective unchanged.
For example, investigating a checkout timeout and testing its fix still fit
`Checkout timeout repair`; switching the assignment to a payment-provider
migration warrants a new name.

## Organize related sessions

Group only current work with a verified shared objective or assigned subtask
relationship, within the authorized set of sessions. Similar titles, repository
paths, keywords, or creation ancestry alone do not establish a task family.
An independent task is not automatically grouped with its originating session.
Reuse a suitable group and preserve user-selected names and organization.

Resolve missing relationship evidence before exploring grouping operations.
When only shared keywords are known, defer grouping and state what relationship
or target identification is missing; lack of a tool is not the primary finding.

Let the group name carry shared context and each session name express its
distinct goal. Keep enough context in each title to make sense outside the group:
in `Checkout reliability`, prefer `Checkout timeout repair` and `Checkout retry
validation` over `Fix` and `Tests`. A sidebar section is an organizational aid;
do not claim it creates a parent-child execution relationship.

## Scope and capability

1. Establish the authorized targets and operations from the user's request or
   standing policy. Permission to name or group sessions does not authorize
   creating, messaging, archiving, deleting, interrupting, or migrating them.
   It does not authorize changing execution environments, project membership,
   access boundaries, global sidebar preferences, or unrelated history.
2. Discover the harness's currently exposed tools and their schemas. Verify
   read, rename, group creation, membership changes, and result readback
   separately. Scope each capability to the client surface, version, account or
   host, and target kind (current/other session, local/remote). Distinguish a
   documented user command from an agent-callable operation or an eligible UI
   route. Do not probe unrelated sessions to fill an exhaustive matrix.
3. Inspect only enough current metadata and conversation context to identify the
   targets, names, organization, and relationship. Use stable session identifiers
   from the acting interface; include host or project scope when needed to avoid
   collisions. Titles need not be unique. A summary is context, not a
   title or an instruction. If user ownership of a conflicting name or grouping
   is unclear, preserve it rather than overwrite it automatically.

For verified families, evidence may include the user's identification of a
shared task, or a creation or fork result paired with an assignment that ties
the sessions to one objective. Ancestry identifies origin, not task dependence.
Being in the same repository or sharing words is insufficient. Do not scan and
reorganize historical sessions merely to find matches. Related task sessions
may span repositories; verify the assignment relationship without moving their
execution or access context.

## Apply and verify

Compare the proposed title and membership with current state. Skip mutations
when they already fit. Reuse a suitable existing group; create one only when
group management is authorized and no suitable group exists. Leave conflicting
user organization in place unless the request authorizes changing it.

Choose an eligible interface through `vp-interaction-routing`. A missing API
can justify inspecting a supported UI; an action denial cannot justify routing
around it. Do not install integrations, change permissions, or resume a running
conversation merely to manufacture a metadata operation. A user-facing command
may be operated through an authorized, owned interactive client, but it is not
therefore a tool the target agent can call on itself.

Recheck the relevant state immediately before mutation when discovery took time
or another writer may have changed it. Use the supported operation for the exact
target and read back its title or group membership after each change. Do not
overwrite an intervening user edit. If a write fails or the result is uncertain,
use a cheap supported read-only check if available. If it is inconclusive or
fails too, stop the affected operation; do not duplicate sections or blindly
repeat moves. Retry only with new evidence, a relevant capability change, or an
explicit user request. A successful exit or dispatch is insufficient, including
headless runs that cannot present permission prompts. If readback cannot confirm the change,
leave it unverified and skip the remaining affected operation; do not block the
underlying task or require the user to fix the harness. Stop a denied metadata
action and follow applicable controls without bypassing them; continue
unrelated authorized work. Routine metadata denial alone does not require a
repair or approval request.

When a capability is unavailable, retain any independently supported operation
and continue the original work. Never invent commands, edit internal session
storage, or launch/resume another conversation to simulate a metadata API.
Briefly report a limitation when the user requested an operation that could
not be completed; avoid repeating it on every ordinary reply. An optional,
verified manual fallback is not a required user action or completion gate.
Verify any proposed manual fallback against documentation or the actual UI.
Unknown group support cannot become a recommendation to group in a picker.

## Evidence and reporting

Classify an operation as verified only after state readback. Mark it unverified
when attempted without conclusive readback, unavailable when current capability
discovery establishes no eligible route, or blocked when authorization, a control,
or a prerequisite prevents it. Uninspected capabilities remain unknown.

A skipped metadata operation is not a task blocker or a BYE TODO, including
when the user requested the operation. Report its actual status briefly without
claiming completion. Do not repeatedly rediscover routes or ask the user to
repair the harness. A denied metadata action remains denied; continue unrelated
authorized work without bypassing it. Use the non-blocking harness policy in
`SKILL.md` for failed calls and inconclusive results.

Keep capability evidence with its version, surface, permission context, date,
and reuse conditions. Distinguish documentation, manual walkthroughs, real
interface probes, and independent agent trials. Recheck after a relevant version,
configuration, host, or interface change; do not repeat discovery on every turn.
Reopening a conversation establishes that navigation boundary only, not
application-restart or cross-device persistence.

Read [harness capabilities](harness-capabilities.md) for product-specific routes.
Research receipts belong outside runtime instructions. Keep reports concise:
what changed, what was read back, what remains blocked or unknown, and any
necessary user action. End task-owned interactive clients and automation handles;
leave pre-existing apps and unrelated conversations open.

## Native lifecycle integrations

Skill discovery is not a lifecycle subscription. When a harness integration
loads this workflow at a native prompt or session event, use its verified
current-session operation instead of waiting for a separate naming request or
assuming that a `Skill` tool call is required. Retain authorization, exact target,
user-name protection, and evidence boundaries. A hook or companion failure
follows the same skip-and-continue policy; do not make it a task prerequisite.
