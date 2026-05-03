---
name: vp-git-cleanup
description: >-
  Audit and safely clean up Git branches, worktrees, stashes, and stale
  remote-tracking refs. Use when the user asks to "clean up git", prune old
  branches, remove merged branches, tidy stale worktrees, review old stashes,
  prune remotes, or reduce local Git clutter. Also trigger for periodic repo
  hygiene before starting or after finishing feature work. Boundary: not for
  stacked PR rebasing, history rewriting, repository repair, or .gitignore
  generation.
---

# Git Cleanup

Audit first, then clean up only after explicit confirmation. Treat branch,
worktree, stash, and remote-ref cleanup as separate risk classes.

## Core Rules

1. **Default to read-only audit** - Do not delete branches, worktrees, stashes,
   or refs until the user approves an exact plan.
2. **Protect active work** - Never delete the current branch, base branch,
   checked-out branches, dirty worktrees, locked worktrees, or stashes that have
   not been inspected.
3. **Separate local and remote risk** - Local branch cleanup and remote branch
   deletion require separate confirmation.
4. **Prefer safe Git checks** - Use `git branch -d` for merged local branches.
   Use `git branch -D` only when the user explicitly accepts the force-delete
   risk.
5. **Execute sequentially** - Run cleanup commands one at a time and stop on
   unexpected failures. Do not batch destructive Git commands in parallel.

## Quick Start

Start with a read-only audit. Use commands as evidence, not as an automatic
cleanup script. Adapt the base branch, remote, stale threshold, and keep
patterns to the repository.

## Workflow

### 1. Establish Cleanup Policy

Confirm or infer:

- Base branch: default remote HEAD, then `main`, `master`, `trunk`,
  `develop`, or the current branch as a fallback.
- Remote: `origin` if present, otherwise the first configured remote.
- Stale threshold: default 60 days unless the user specifies another value.
- Protected branches: `main`, `master`, `develop`, `trunk`, `release/*`,
  `hotfix/*`, the current branch, the base branch, and any user-provided
  patterns.

If the user asks to actually clean up, still run the audit first and present
the exact commands before deleting.

### 2. Audit Candidates

Use read-only commands to gather evidence:

```bash
git status --short --branch
git remote -v
git branch --show-current
git symbolic-ref --quiet --short refs/remotes/<remote>/HEAD
git worktree list --porcelain
git -C <worktree-path> status --short
git branch --format='%(refname:short) %(committerdate:short) %(upstream:short) %(upstream:track)'
git branch --merged <base>
git branch --no-merged <base>
git merge-base --is-ancestor <branch> <base>
git stash list --date=local
git remote prune --dry-run <remote>
```

Group findings:

- **Merged local branch candidates**: local branches whose tips are ancestors
  of the base ref and are not protected or checked out.
- **Squash/rebase-merged candidates**: branches with a merged PR on the hosting
  service but whose tip is not an ancestor of the base ref.
- **Gone-upstream branches**: branches whose upstream tracking ref is marked
  `[gone]`; these need review unless also merged.
- **Old unmerged branches**: review-only unless the user explicitly chooses to
  abandon them.
- **Worktree removal candidates**: clean, unlocked, non-current worktrees whose
  branch is merged.
- **Worktree review items**: dirty, locked, detached, prunable, current,
  primary, active, unmerged, or upstream-gone worktrees.
- **Old stash candidates**: stashes older than the threshold; inspect before
  dropping.
- **Remote-tracking refs**: review via dry-run prune before changing refs.

### 3. Add Optional Host Checks

When `gh` is available and the repository is hosted on GitHub, use it for
ambiguous branch/worktree decisions:

```bash
gh pr list --head <branch> --state all --json number,state,title,mergedAt,url
gh pr view <number> --json number,state,mergedAt,headRefName,baseRefName,url
```

Keep branches or worktrees for open PRs. For closed-but-unmerged PRs, report
the state and ask before deletion.

### 4. Classify Merge Evidence

Use evidence tiers instead of treating every "looks old" branch as merged:

| Evidence | Detects | Cleanup default |
|----------|---------|-----------------|
| `git merge-base --is-ancestor <branch> <base>` succeeds | Regular merge, fast-forward merge, rebase merge where branch tip is in base history | Safe local candidate; use `git branch -d` |
| GitHub PR has `state: MERGED` / non-null `mergedAt` | PR merged by regular merge, squash merge, or rebase merge | Review as host-merged; local Git may require `git branch -D` after confirmation |
| `git cherry -v <base> <branch>` shows patch-equivalent commits | Some cherry-pick/rebase-equivalent cases | Supporting evidence only; not proof for all squash merges |
| Upstream is `[gone]` | Remote tracking branch was deleted or pruned | Review only; not proof of merge |

Squash merge caveat: after a squash merge, the branch tip is usually not an
ancestor of the base branch. `git branch --merged <base>` and
`git branch -d <branch>` may both treat it as unmerged even though the PR was
merged. In that case, rely on host PR evidence and require explicit
confirmation before using `git branch -D`.

### 5. Present The Cleanup Plan

Before destructive actions, show grouped commands:

```text
Will run:
- git branch -d <merged-branch>
- git worktree remove <clean-merged-worktree>
- git stash drop stash@{3}

Requires separate confirmation:
- git push origin --delete <remote-branch>
- git branch -D <unmerged-abandoned-branch>
```

Ask for confirmation once for the safe local cleanup group. Ask separately for
remote deletion or force deletion.

### 6. Execute Safely

Branches:

- Switch to the base branch before local branch deletion when feasible so Git's
  deletion checks are evaluated from the intended cleanup context.
- Use `git branch -d <branch>` for merged local branches.
- If `git branch -d` refuses, stop and re-check ancestry, upstream, and host PR
  evidence before considering any force delete.
- If the branch is checked out in a worktree, remove the worktree first.
- For squash/rebase-merged branches that Git cannot prove with ancestry, show
  the merged PR evidence before asking whether to use `git branch -D`.
- Do not delete stale unmerged branches unless the user explicitly selects them
  for abandonment.
- Treat `[gone]` upstream as "review needed", not proof of safe deletion.

Worktrees:

- Use `git worktree remove <path>` first.
- Do not use `--force` unless the user confirms the worktree is disposable and
  the audit shows it is clean or merged.
- Never remove the current worktree, primary worktree, dirty worktrees, locked
  worktrees, or worktrees for open PRs.
- Run `git worktree prune` only after reviewing the audit and confirming stale
  administrative records should be removed.

Stashes:

- Inspect each candidate first with `git stash show --stat <stash>`.
- Avoid `git stash clear`.
- When dropping multiple stashes by index, drop the highest index first because
  stash indexes shift after each drop.

Remote refs:

- Preview with `git remote prune --dry-run <remote>`.
- Run `git remote prune <remote>` only after confirmation.
- Delete remote branches with `git push <remote> --delete <branch>` only after
  separate confirmation and PR-state review.

### 7. Verify

After cleanup, rerun the relevant read-only audit commands and report:

- Commands that succeeded.
- Items skipped and why.
- Remaining dirty, locked, open-PR, or review-only items.
- Any failed command and the exact error.
