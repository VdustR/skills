# Cleanup

Audit branches, worktrees, stashes, and remote-tracking refs as separate risk
classes. Identify exact candidates before deleting anything. For a general
cleanup request, present them for approval; for already authorized post-merge
cleanup, apply the procedure below without requesting the same approval again.

## Protect

Never remove the current or default branch; current, dirty, locked, or otherwise
active worktrees; uninspected stashes; open-PR branches; or user-protected
patterns. A clean, unlocked, inactive worktree with a safely merged branch may
be removed only after exact approval.

## Evidence

- Ancestry proves regular merge history but may not recognize squash merges.
- A deleted upstream is not proof that work was merged.
- Hosting-platform merge state can establish a squash or rebase merge, but does
  not make a force deletion harmless.
- Age is a review signal, never sufficient deletion evidence.

Use safe deletion for ancestry-proven local branches. Force deletion, remote
branch deletion, stash dropping, and worktree removal each require explicit
authorization. Carry forward authorization already granted for the exact scope;
do not ask again merely because the merge has completed. Execute destructive
steps sequentially and verify after each risk class.

## After a PR merge

Include cleanup of the merged PR head in the merge plan. When the user has
already authorized removing unused merged branches, including through applicable
standing instructions, complete it without another confirmation. Merge authority
alone does not authorize unrelated branch cleanup or repository setting changes.

1. Record the PR's head repository, branch, and final head commit before merge.
   Verify the host reports the PR merged into the intended base. Read whether
   automatic head deletion is enabled, then query the actual head ref in its
   owning repository. A setting, a successful merge command, or
   `gh pr merge --delete-branch` is not proof the branch disappeared. A failed
   query or permission error is unknown state, not an absent branch.
2. If the remote head remains, verify its tip still equals the merged PR head
   and no open PR, dependent stack, protected pattern, or ongoing work needs it.
   Check the local branch and all worktrees separately. Route dependent stacks
   through `vp-stacked-pr` before deciding a parent branch is unused. Do not
   delete a fork head through the base repository's remote.
3. Delete the exact remaining unused remote head under the existing cleanup
   authorization. Guard the deletion against a concurrent push, for example
   `git push --force-with-lease=refs/heads/<branch>:<verified-head> <remote> :refs/heads/<branch>`.
   If the tip changes or the lease fails, stop that deletion and inspect the new
   work; never retry with an unconditional deletion. Read back remote absence.
4. Synchronize the local base without discarding changes, switching off the
   merged branch only when safe. Never delete a branch still checked out in any
   worktree or remove a worktree as an implicit part of branch cleanup. Delete
   the unused local head with `git branch -d` when ancestry proves integration.
   For a squash or rebase merge, `-D` is covered only when the cleanup authority
   includes that deletion, host merge evidence matches the exact local tip,
   and no extra commits or ongoing use remain. Otherwise retain it and report
   the reason. Do not reset the branch to make safe deletion appear to pass.
5. Prune stale remote-tracking refs for the verified remote, and read back local
   and remote refs independently. Report automatic removal, explicit deletion,
   or a retained branch with its reason. Report cleanup as incomplete when a
   query or deletion failed; do not silently treat merge success as cleanup
   success.

The GitHub CLI's [merge options](https://cli.github.com/manual/gh_pr_merge)
can request branch deletion; Git's [push lease semantics](https://git-scm.com/docs/git-push)
and [branch deletion rules](https://git-scm.com/docs/git-branch) govern the
separate guarded remote and local operations above.
