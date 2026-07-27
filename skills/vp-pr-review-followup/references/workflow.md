# Workflow

## Snapshot

Record the PR head and review time. Fetch the full original thread, later
replies, current code or diff, relevant checks, and any related discussion
comments.

## Re-evaluate

Restate the original concern as a concrete behavioral or maintainability claim.
Check whether the current implementation addresses that claim, merely changes
the referenced line, or makes the concern obsolete.

Classify:

- resolved with evidence;
- partially addressed;
- unsupported author response;
- obsolete after scope or code change;
- product or architecture decision needed.

## Respond

Reply on the original thread. A useful response says what evidence was checked,
what remains true, and the next action. Avoid reopening settled wording debates
or adding new unrelated review scope.

Resolve only a thread the acting reviewer owns, after confirming the concern is
closed. For other reviewers' threads, provide evidence or a recommendation but
leave resolution to them.

Re-fetch after writes and report the current head, decisions, replies,
resolutions, and remaining blockers.
