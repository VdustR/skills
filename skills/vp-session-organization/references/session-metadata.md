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
   rename and grouping capabilities separately, including result readback.
   A product's documented user command is not proof of a model-callable API.
3. Inspect only enough current metadata and conversation context to identify the
   targets, names, organization, and relationship. Use stable session identifiers
   from supported APIs; titles need not be unique. A summary is context, not a
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

Use the supported metadata operation for the exact target. Read back its title
or group membership after each change. If a write fails or the result is
uncertain, read current state before any retry; do not duplicate sections or
blindly repeat moves. If readback cannot confirm the change, report it as
unverified. Stop the affected metadata action on a control denial and follow
the applicable approval policy; another interface does not resolve the denial.

When a capability is unavailable, retain any independently supported operation
and continue the original work. Never invent commands, edit internal session
storage, or launch/resume another conversation to simulate a metadata API.
Briefly report a limitation when the user requested an operation that could
not be completed; avoid repeating it on every ordinary reply.

## Harness examples and limits

These are capability checks, not a promise that every installation exposes
the same tools. Rediscover the available interface in the active harness.

- **Codex desktop:** When exposed, `set_thread_title` supports renaming; omitting
  `threadId` targets the calling chat. `list_threads` reads titles and sidebar
  sections; `read_thread` supplies conversation context when needed.
  `create_sidebar_section` and `move_thread_to_sidebar_section` can organize
  authorized targets, using the exact section and thread identifiers returned
  by those tools. Read back the title and section membership with `list_threads`.
  Sidebar sections do not establish execution ancestry. Do not use project
  moves, handoff, or global grouping preferences as substitutes.
- **Claude Code:** The official [session naming documentation](https://code.claude.com/docs/en/sessions#name-your-sessions)
  describes user-facing `/rename` and startup naming. It does not establish a
  model-callable self-renaming API. Picker grouping does not establish arbitrary
  user-created groups. Without a callable supported interface, provide a title
  or a documented user action when requested and continue the task.
- **Other harnesses:** Require an exposed, supported operation and readback for
  each requested capability. Do not infer support from another product.
