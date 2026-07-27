# Stacked Branches

Repair a dependent branch by identifying its intended base and preserving only
the commits owned by that branch.

## Establish The Stack

Use PR metadata, merge bases, commit history, patch identity, and changed-file
intent together. Do not infer the parent solely from branch names or commit
messages. Determine how the parent was integrated because regular, squash, and
rebase merges leave different evidence.

## Preserve Work

- Classify each candidate commit as parent-owned, branch-owned, equivalent,
  already integrated, or uncertain.
- Show every classification and its keep or exclude decision before rewriting
  history.
- Create a recoverable backup reference before execution.
- Retain the backup after verification; deleting it is a separate cleanup action
  that requires target-specific approval.
- Prefer reconstruction on a temporary branch when the surviving commit set is
  clearer than an in-place rebase.
- Resolve conflicts semantically; do not choose a side globally without
  reviewing the affected behavior.

Verify commit range, diff against the intended base, tests, and PR metadata.
History rewriting and force pushing require separate explicit authorization.
When a rewritten branch must be pushed, require force-with-lease; never use an
unguarded force push.
