---
name: vp-stacked-pr-rebase
description: >-
  Rebase stacked PRs after parent PR is merged, preserving only your commits.
  Use when the user asks to "rebase my PR after parent merged", "update stacked PR",
  "fix PR after dependency merged", "cherry-pick my commits to new base",
  "sync stacked PR", or when a PR contains commits from a merged parent PR
  that need to be removed. Also trigger when the user mentions stacked PRs,
  dependent PRs, PR chains, or parent PR merges affecting their branch.
  Boundary: not for regular rebases onto main or resolving merge conflicts
  in non-stacked PRs.
---

# Stacked PR Rebase

Rebase a stacked PR after its parent PR has merged by identifying parent commits,
preserving only the user's own commits, recreating the branch from the updated
base, and force-pushing only with explicit confirmation.

## Core Principles

1. **Analyze before acting** - Understand the PR relationship, merge type, and
   commit ownership before changing history.
2. **Preserve user work** - Keep only the user's own commits and never discard
   uncertain commits without confirmation.
3. **Use one predictable strategy** - Cherry-pick owned commits onto the updated
   base for regular, squash, and rebase merges.
4. **Create a backup** - Make a timestamped backup branch before destructive
   operations.
5. **Require confirmation** - Ask before execution and again before
   `--force-with-lease`.
6. **Report exact changes** - Show excluded commits, preserved commits, conflicts,
   verification, and next steps.

## Phase 1: Situation Analysis

Gather:

- current branch and working tree status
- current PR number, title, head branch, and base branch
- merge base between current branch and target base
- commits currently in the PR branch
- recently merged PRs targeting the same base
- merged PR whose head branch matches the current PR base branch, when the PR is
  stacked on a branch instead of the default branch

Useful commands:

```bash
gh pr view <PR_NUMBER> --json number,title,headRefName,baseRefName,commits
git merge-base HEAD origin/<baseRefName>
git log --oneline "$(git merge-base HEAD origin/<baseRefName>)"..HEAD
gh pr list --state merged --base <baseRefName> --limit 20 \
  --json number,title,headRefName,mergeCommit,commits
gh pr list --state merged --head <baseRefName> --limit 5 \
  --json number,title,headRefName,mergeCommit,commits
```

Read `references/parent-detection.md` for the detailed detection strategy,
confidence rules, and user-facing option examples. When the user names the
parent PR explicitly, skip detection but still verify it: confirm the PR is
merged and its head branch relates to the current PR's base.

## Phase 2: Merge Type Detection

Detect how the parent PR merged so the report is accurate. The execution
strategy remains cherry-picking owned commits for all merge types.

| Merge type | Detection | Strategy |
|------------|-----------|----------|
| Regular merge | merge commit has 2 parents | cherry-pick own commits |
| Squash merge | one parent, original commits not in base | cherry-pick own commits |
| Rebase merge | one parent, original commits rewritten in base | cherry-pick own commits |

Read `references/merge-strategies.md` for GraphQL queries, diagrams, and merge
type details.

## Phase 3: Commit Classification

Classify commits in the current PR branch:

| Priority | Condition | Classification |
|----------|-----------|----------------|
| 1 | SHA appears in parent PR original commits | parent commit, exclude |
| 2 | same non-generic message, same author, different SHA | likely parent commit, exclude |
| 3 | message match is generic or author differs | uncertain, ask user |
| 4 | everything else | user-owned, keep |

Always show the classification before execution, even when confidence is high.
Read `references/commit-classification.md` for examples, manual selection, and
uncertain-commit prompts.

## Phase 3.5: Pre-Execution Confirmation

Before any destructive operation, show:

- current PR and branch
- parent PR and merge type
- commits to exclude
- commits to keep
- uncertain commits and selected treatment
- backup branch name
- exact high-level operation

Ask for explicit confirmation. If the user declines, offer to reclassify, switch
to manual selection, or abort.

All interactive pause points are summarized in
`references/decision-points.md`.

## Phase 4: Rebase Execution

Use a fresh branch from the updated base, then cherry-pick only user-owned
commits in oldest-first order.

High-level sequence:

1. Fetch the latest base branch.
2. Create `backup-pr<NUMBER>-<timestamp>` at the original branch HEAD.
3. Create a temporary branch from `origin/<baseRefName>`.
4. Cherry-pick user-owned commits, preserving commit messages and authorship.
5. Resolve conflicts or ask for semantic conflicts.
6. Replace the original branch with the temporary branch.
7. Delete the temporary branch.

Read `references/execution.md` for the exact command sequence, verification
steps, force-push confirmation, and summary report template. Read
`references/conflict-resolution.md` for conflict classification.

## Phase 5: Verify And Push

Before force-pushing:

```bash
git log --oneline -10
git status
git diff origin/<branch>..HEAD --stat
```

Then ask before:

```bash
git push --force-with-lease origin <branch>
```

Never use plain `--force`. Never delete the backup branch automatically.
In the final report, include conflicts encountered, verification results, and
the backup branch name.

## Error Handling

| Error | Action |
|-------|--------|
| Cannot identify parent PR | Ask user to specify PR number |
| Parent PR not merged | Abort and suggest waiting |
| No user-owned commits found | Warn that the branch may already be rebased |
| Cherry-pick conflict | Classify conflict and resolve or ask |
| Own commit is a merge commit | Warn and ask before using `cherry-pick -m 1`; prefer squashing first |
| Force push rejected | Check branch protection or remote drift |
| Backup branch exists | Use timestamp suffix for uniqueness |
| Current branch has no PR | Ask which PR to operate on |
| Multiple parent PRs in chain | Collect commits from all parents, then keep only non-parent commits |
| Parent PR has 250+ commits | Use pagination or manual commit selection |

## Reference Files

- `references/parent-detection.md` - parent PR detection and confidence rules
- `references/merge-strategies.md` - merge type detection and diagrams
- `references/commit-classification.md` - commit ownership examples and prompts
- `references/execution.md` - command sequence and report template
- `references/conflict-resolution.md` - conflict handling guidance
- `references/decision-points.md` - all required user confirmation points

## Notes

- Requires `gh` CLI authenticated with appropriate permissions.
- Works with GitHub PRs. GitLab and Bitbucket are not supported.
- The PR branch must be checked out locally.
- Always test with a backup before critical operations.
