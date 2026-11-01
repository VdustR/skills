# Harness Capabilities

Read only the relevant client section. These are discovery starting points, not
a product-wide support table. Distinguish an agent acting on itself from an
external operator controlling a client. Verify current tools, permissions, exact
target, and readback before use.

Version-specific observations below were recorded on November 1, 2026. Recheck
when the relevant client, permissions, tools, or target context changes.

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
