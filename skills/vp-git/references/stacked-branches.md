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
- Show uncertain classifications before rewriting history.
- Create a recoverable backup reference before execution.
- Prefer reconstruction on a temporary branch when the surviving commit set is
  clearer than an in-place rebase.
- Resolve conflicts semantically; do not choose a side globally without
  reviewing the affected behavior.

Verify commit range, diff against the intended base, tests, and PR metadata.
History rewriting and force pushing require separate explicit authorization.
