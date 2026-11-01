# Session Metadata

Read this reference for management mode. Generating a title alone does not
require session enumeration or metadata tools.

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

For verified families, evidence may include the user's identification of the
sessions, a recorded creation or fork result, or conversation context assigning
them distinct parts of one objective. Being in the same repository or sharing
words is insufficient. Do not scan and reorganize historical sessions merely
to find matches. Parent and child sessions may span repositories; verify the
relationship without moving their execution or access context.

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
read current state before any retry; do not duplicate sections or blindly repeat
moves. A successful exit or dispatch is insufficient, including headless runs
that cannot present permission prompts. If readback cannot confirm the change,
report it as unverified. Stop the affected metadata action on a control denial
and follow the applicable approval policy; another interface does not resolve
the denial.

When a capability is unavailable, retain any independently supported operation
and continue the original work. Never invent commands, edit internal session
storage, or launch/resume another conversation to simulate a metadata API.
Briefly report a limitation when the user requested an operation that could
not be completed; avoid repeating it on every ordinary reply.
Verify any proposed manual fallback against documentation or the actual UI.
Unknown group support cannot become a recommendation to group in a picker.

## Evidence and reporting

Classify an operation as verified only after state readback. Mark it unverified
when attempted without conclusive readback, unavailable when current capability
discovery establishes no eligible route, or blocked when authorization, a control,
or a prerequisite prevents it. Uninspected capabilities remain unknown.

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
