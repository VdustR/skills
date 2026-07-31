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

- To keep an unmerged local stack consistent, rebase from the top branch of the
  stack — so every intermediate commit is in the rebased range — with
  `git rebase --update-refs` (or set `rebase.updateRefs=true`). It force-updates
  only branches that point at commits being rebased, so rebasing a lower branch
  alone leaves the upper layers stale; branches checked out in another worktree
  are skipped and must be moved by hand. Requires Git 2.38 or newer. Confirm each
  intermediate ref moved as intended before force-pushing.
- When the child's original parent tip is still identifiable,
  `git rebase --onto <new-base> <old-parent-tip>` replays only the child's own
  commits onto the new base and drops the parent-owned ones directly. This handles
  squash and rebase merges, where a plain `git rebase` would instead try to reapply
  the already-integrated parent commits.
- Reserve the full reconstruction below for when the old parent tip is not cleanly
  identifiable, or commits are patch-equivalent, interleaved, or of uncertain
  ownership.

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
