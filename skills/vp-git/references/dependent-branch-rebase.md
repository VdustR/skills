# Dependent Branch Rebase

Repair a dependent branch by identifying its intended base and preserving only
the commits that branch owns. This is a host-agnostic Git task, not a fallback
for any one platform's stacking feature.

## When To Use This

- Use it on hosts without native stack support (GitLab, Gitea, plain Git), or on
  GitHub for stacks the native feature does not cover: cross-fork stacks, or
  ad-hoc branches never registered as a GitHub stack.
- On GitHub with a registered native stack, the platform rebases and retargets
  upper PRs for you, including across squash merges; read `stacked-prs.md`
  instead of rebuilding history by hand.

## Prefer Native Git First

- To keep an unmerged local stack consistent after editing a lower branch, prefer
  `git rebase --update-refs` (or set `rebase.updateRefs=true`); it moves every
  intermediate branch ref in a single rebase. Requires Git 2.38 or newer.
- When the parent was integrated but its old tip is still cleanly identifiable and
  was not collapsed, `git rebase --onto <new-base> <old-parent-tip>` drops the
  parent-owned commits directly.
- Reserve the full reconstruction below for squash or rebase merges, patch-
  equivalent commits, or uncertain ownership, where a plain rebase would reapply
  or duplicate already-integrated work.

## Establish The Stack

Use PR/MR metadata, merge bases, commit history, patch identity, and changed-file
intent together. Do not infer the parent solely from branch names or commit
messages. Determine how the parent was integrated because regular, squash, and
rebase merges leave different evidence.

## Preserve Work

- Refresh the intended remote base and verify its exact current commit before
  creating a reconstruction branch.
- Classify each candidate commit as parent-owned, branch-owned, equivalent,
  already integrated, or uncertain.
- Show every classification and its keep or exclude decision before rewriting
  history.
- Require the user to decide every uncertain ownership classification.
- Create a recoverable backup reference before execution.
- Retain the backup after verification; deleting it is a separate cleanup action
  that requires target-specific approval.
- Prefer reconstruction on a temporary branch when the surviving commit set is
  clearer than an in-place rebase.
- Resolve conflicts semantically. When multiple behaviorally valid resolutions
  exist, ask the user before choosing; never choose a side globally.

Verify commit range, diff against the intended base, tests, and PR/MR metadata.
History rewriting and force pushing require separate explicit authorization.
When a rewritten branch must be pushed, require force-with-lease; never use an
unguarded force push.
