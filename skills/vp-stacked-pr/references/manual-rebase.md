# Dependent Branch Rebase

Repair a dependent branch by identifying its intended base and preserving only
the commits that branch owns. This is a host-agnostic Git task, not a fallback
for any one platform's stacking feature.

## When To Use This

- Use it on hosts without native stack support (GitLab, Gitea, plain Git), or on
  GitHub for stacks the native feature does not cover: cross-fork stacks, or
  ad-hoc branches never registered as a GitHub stack.
- On GitHub with a registered native stack, the platform rebases and retargets
  upper PRs for you, including across squash merges; read `github-native.md`
  instead of rebuilding history by hand.

## Prefer Native Git First

- To keep an unmerged local stack consistent, rebase from the top branch of the
  stack — so every intermediate commit is in the rebased range — with
  `git rebase --update-refs` (or set `rebase.updateRefs=true`). It force-updates
  only branches that point at commits being rebased, so rebasing a lower branch
  alone leaves the upper layers stale; branches checked out in another worktree
  are skipped and must be moved by hand. A backup branch inside the rebased range
  moves too, so create the backup outside `refs/heads` as described in Preserve
  Work. Requires Git 2.38 or newer. Confirm each intermediate ref moved as
  intended and the backup ref did not move before force-pushing.
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
- Create a recoverable backup ref outside `refs/heads` before execution. Record
  its original object ID so the post-rebase check can prove that it did not move:

  ```bash
  git update-ref refs/backup/<name> <branch> ""
  git rev-parse refs/backup/<name>
  ```

  The empty expected old value makes creation fail if that backup ref already
  exists. Choose a new name instead of overwriting a retained recovery point.
  Do not use a local branch for this backup when the rewrite uses
  `--update-refs` or `rebase.updateRefs=true`; Git can move any branch that
  points into the rebased range.
- Retain the backup after verification; deleting it is a separate cleanup action
  that requires target-specific approval.
- Prefer reconstruction on a temporary branch when the surviving commit set is
  clearer than an in-place rebase.
- Resolve conflicts semantically. When multiple behaviorally valid resolutions
  exist, ask the user before choosing; never choose a side globally.

## Retarget Before Deleting A GitHub Base Branch

For an ad-hoc GitHub stack, do not rely on branch deletion to retarget the PRs
above a merged layer. GitHub documents automatic retargeting for open PRs in the
same repository, but verify and update the actual PR metadata before deleting
the merged layer's branch:

1. List every open PR whose base is the branch that will be deleted. Determine
   the intended new base for each PR from the stack, rather than assuming that
   every child moves directly to the default branch. Record the branch's exact
   tip so a squash or rebase merge does not erase the old parent boundary needed
   to repair child history.

   ```bash
   gh api --method GET --paginate repos/<owner>/<repo>/pulls \
     -f state=open -f base=<branch-to-delete> -f per_page=100 \
     --jq '.[] | {number, baseRefName: .base.ref, headRefName: .head.ref}'
   ```

   Exhaust every page. A default-limited listing cannot establish that every
   affected PR is safe.

2. Retarget each affected PR while it is still open:

   ```bash
   gh pr edit <child-pr> --base <new-base>
   gh pr view <child-pr> --json state,baseRefName,headRefName
   ```

3. Stop if any affected PR is not open or its `baseRefName` does not match the
   intended new base. Merge the lower layer and delete its branch only after
   every affected PR passes this readback.
4. After the lower layer merges, repair each retargeted child branch before
   treating its PR as mergeable. Retargeting changes PR metadata; it does not
   remove the lower layer's original commits from child history. For a squash or
   rebase merge, use the recorded old parent tip with
   `git rebase --onto <new-base> <old-parent-tip>` when ownership is clear, or
   use the reconstruction workflow above. Follow the backup and force-with-lease
   gates, then verify the child commit range, three-dot diff, tests, and PR base.

This ordering applies whether branch deletion is explicit, part of
`gh pr merge --delete-branch`, or enabled automatically in repository settings.

If deleting the base branch has already closed a child PR, preserve its number
and review history with this recovery sequence:

1. Before reopening anything, inventory every PR whose base is the deleted
   branch across all states with complete pagination. Use stack metadata and PR
   history to distinguish children closed by the deletion from merged or
   intentionally closed PRs, and record the complete affected set:

   ```bash
   gh api --method GET --paginate repos/<owner>/<repo>/pulls \
     -f state=all -f base=<deleted-base> -f per_page=100 \
     --jq '.[] | {number, state, baseRefName: .base.ref, headRefName: .head.ref}'
   ```

2. Identify and verify the deleted base branch's exact pre-deletion tip. For a
   merged layer, use the commit that the branch pointed to when it was merged;
   do not substitute the squash or merge commit unless it is the same object.
3. Recreate the missing base branch at that commit:

   ```bash
   git push origin <merged-layer-sha>:refs/heads/<deleted-base>
   ```

4. Reopen and retarget every PR in the recorded affected set. Use the REST API
   to reopen each PR, then retarget it while it is open:

   ```bash
   gh api -X PATCH repos/<owner>/<repo>/pulls/<child-pr> -f state=open
   gh pr edit <child-pr> --base <new-base>
   gh pr view <child-pr> --json state,baseRefName,headRefName
   ```

   `gh pr reopen` and GraphQL base edits can obscure the missing-base cause. If
   recovery fails, inspect the REST response instead of replacing the PR.
5. Delete the recreated base branch only after every PR in the recorded affected
   set is open and its new base is confirmed. Repeat the fully paginated
   all-state inventory and stop if any affected PR remains closed, unverified,
   or based on the recreated branch:

   ```bash
   gh api -X DELETE repos/<owner>/<repo>/git/refs/heads/<deleted-base>
   ```

Branch recreation and deletion are remote writes. Require the authorization
that the surrounding delivery or recovery workflow needs before performing
them.

Verify the backup ref still resolves to its recorded pre-rebase object ID, then
verify the commit range, diff against the intended base, tests, and PR/MR
metadata. History rewriting and force pushing require separate explicit
authorization. When a rewritten branch must be pushed, require force-with-lease;
never use an unguarded force push.
