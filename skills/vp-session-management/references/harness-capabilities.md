# Harness Capabilities

Read only the relevant client section. These are discovery starting points, not
a product-wide support table. Distinguish an agent acting on itself from an
external operator controlling a client. Verify current tools, permissions, exact
target, and readback before use.

Apply the non-blocking harness policy in `SKILL.md` to every route below. A
failed hook, tool, SDK companion, or inconclusive readback ends that attempt;
leave the operation unverified or unavailable as supported and continue the
underlying task. Do not require successful metadata management for delivery or
BYE, and do not bypass a denied action.

Version-specific observations below were recorded on November 1 and 2, 2026.
Recheck when the relevant client, permissions, tools, or target context changes.

## Codex

When exposed in the desktop app, `set_thread_title` renames a chat; omitting
`threadId` targets the caller. `list_threads` reads titles and sidebar sections;
`read_thread` supplies context when necessary. `create_sidebar_section` and
`move_thread_to_sidebar_section` organize authorized targets. Read back exact
thread and section membership, using host-qualified identities when needed.
Sidebar organization is not execution ancestry. Do not substitute project moves,
handoff, or global grouping preferences.

The official [App Server protocol](https://learn.chatgpt.com/docs/app-server)
documents `thread/name/set` and structured thread reads. Protocol support does
not establish a registered, authorized interface to the current client's store.
Do not start another server or edit its database to simulate missing app tools.
CLI, IDE, desktop, and remote targets require separate capability checks.

## Claude Code

The official [session documentation](https://code.claude.com/docs/en/sessions#name-your-sessions)
describes startup `--name`, interactive `/rename`, and picker renaming. Check the
installed version and surface: CLI, desktop, and extensions can have different
session lists and naming behavior.

In a Claude Code 2.1.212 print-mode probe, the exposed tool inventory contained
no rename operation; the agent loaded this skill and provided a manual command.
An external operator then used `/rename` in an owned interactive CLI and verified
the title after exiting and resuming the same session ID. This establishes that
operator route, not a self-rename tool or permission to attach to arbitrary live
sessions. Preserve the distinction when reporting support.

An absent built-in tool does not rule out supported local APIs. The official
[Agent SDK](https://code.claude.com/docs/en/agent-sdk/typescript#renamesession)
provides `renameSession` and `getSessionInfo`, scoped by session ID and project
directory. Use a verified registered companion when available; do not infer
its installation or manually rewrite transcript records.

The Claude desktop app's Code tab exposes an agent-callable rename tool. On
November 2, 2026, in app 4.4212.0, `mcp__ccd_session_mgmt__set_session_title`
with `session_id: "self"` renamed the current session from the app-generated
`Session name modification test` to `Session 改名能力測試`, and
`mcp__ccd_session_mgmt__get_session` with `self` read back the new title. Both
tools were deferred in those sessions, so load their schemas through tool search
before calling them. The tool description states the consent policy: the app
replaces a title it generated without asking and asks the user before replacing
a title the user set. In bypass-permissions mode it replaces a user-set title
without asking; in an unattended session it declines. A subagent cannot rename
the session it runs in. This verifies the app's own rename and readback for the
current session, not what a CLI or Remote Control view of the same session shows.

The app's check therefore does not protect a user-chosen title in every mode,
and `get_session` returned no field that identifies who set the title. Before
renaming, keep a title the conversation shows the user chose or kept, and keep
a title that changed since the agent last read it when nothing explains the
change.

In the desktop app, a `custom-title` transcript record does not mean the user
renamed the session. The app writes its own titles as `custom-title` records,
the record type a manual rename writes, and the records carry no timestamp. One
desktop session on November 2, 2026 held seven identical `custom-title` records
for a title the user never edited. A check that treats a newly appearing
`custom-title` record as an intervening user edit therefore refuses every
desktop rename. On that date, the personal integration below refused seven
desktop sessions this way, each with `The name changed after the hook ran;
preserving that change.` These observations cover the desktop app; they do not
establish how the CLI writes the same record type.

The personal [Claude session-naming integration](https://github.com/VdustR/dotfiles/tree/main/home/.claude/session-naming)
uses native `SessionStart` and `UserPromptSubmit` hooks to bind the current
session and load this workflow independently of description matching. The hooks
decide when naming applies; the rename route depends on the surface. Its
`session-name.ts set 'Title'` command renames through the SDK and checks SDK
readback, which suits a surface with no agent-callable rename tool, such as the
CLI probe above. When the desktop app exposes its rename tool, rename and read
back through that tool instead of the SDK command. `protect` records an
explicit request to retain a managed name. Native hooks can refresh the
already-persisted title through
[`hookSpecificOutput.sessionTitle`](https://code.claude.com/docs/en/hooks#userpromptsubmit-decision-control).
SDK persistence, a running CLI's rendered title, the desktop sidebar, and Remote
Control propagation are separate verification boundaries. Do not promise an
immediate update of every surface from SDK readback alone.

Picker grouping or shared repository paths do not establish an arbitrary
user-created group operation. Discover grouping separately. Explicitly inspect
the active permission mode; a default can inherit local settings. Do not enable
bypass mode or assume resumed sessions retain the desired permission context.

## Antigravity

Discover App, IDE, and `agy` CLI capabilities separately. In an App 2.28.2 probe,
the requested exact name was not applied by the agent. An external operator used
the conversation's **More actions > Rename**, committed the edit, and verified
the title in the sidebar and after leaving and reopening the same conversation.
This verifies App UI renaming across navigation, not an agent-callable metadata
API, full application restart, or cross-device synchronization.

In an `agy` 1.4.12 print-mode probe, a required `read_file` permission could not be
prompted for: stderr reported an automatic denial, stdout was empty, and the
process exited 0. Inspect diagnostics and actual state; do not follow a diagnostic
suggestion to bypass permissions. First-run interactive onboarding may be a
separate prerequisite; do not import extensions or change settings just to
complete metadata discovery.

The CLI [command reference](https://antigravity.google/docs/cli/reference)
documents user commands, not proof of agent-callable tools. The
[`/title` command](https://antigravity.google/docs/cli/commands/title/) changes
terminal window-title behavior. IDE [task groups](https://antigravity.google/docs/tools/)
present work within a conversation. Neither establishes conversation naming or
cross-conversation grouping. Project membership can carry execution context;
do not move conversations between projects as a grouping substitute.

## Other clients and missing operations

Require current operation and readback evidence. Unknown support is not a
confirmed product limitation. Use interaction routing for eligible UI operations;
otherwise provide an actionable documented manual step or report the missing
prerequisite. Do not invent commands, storage formats, or group features.
