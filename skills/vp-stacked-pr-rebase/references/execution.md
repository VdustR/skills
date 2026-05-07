# Rebase Execution

Use this sequence only after the user confirms the parent PR, commit
classification, and execution plan.

## Pre-Execution Confirmation

```text
Ready to rebase PR #456 onto updated main.

Plan:
- Parent PR: #123 (merged via squash)
- Commits to exclude: aaa1111, bbb2222
- Commits to keep: ccc3333, ddd4444
- Backup branch: backup-pr456-<timestamp>

This will rewrite your branch history.
Proceed?
```

## Command Sequence

```bash
git fetch origin <baseRefName>
git branch backup-pr<NUMBER>-$(date +%Y%m%d%H%M%S) HEAD

git branch -D temp-rebase 2>/dev/null || true
git checkout -b temp-rebase origin/<baseRefName>

git cherry-pick <own_commit_1> <own_commit_2>

git checkout <original_branch>
git reset --hard temp-rebase
git branch -D temp-rebase
```

Cherry-pick own commits oldest first. If a cherry-pick conflicts, follow
`conflict-resolution.md`.

## Verification

Before pushing:

```bash
git log --oneline -10
git status
git diff origin/<branch>..HEAD --stat
```

## Force-Push Confirmation

```text
Ready to force push to origin/<branch>.

Changes:
- Removed parent commits: aaa1111, bbb2222
- Kept your commits: ccc3333 -> ccc3333'
                     ddd4444 -> ddd4444'

This will replace the remote branch.
Proceed?
```

Then:

```bash
git push --force-with-lease origin <branch>
```

## Summary Report

```markdown
## Stacked PR Rebase Summary

**PR:** #456 - Feature Y
**Parent PR:** #123 - Feature X (merged via squash)

### Commits Preserved
| Original | Rebased | Message |
|----------|---------|---------|
| ccc3333 | ccc3333' | feat(y): implement feature C |
| ddd4444 | ddd4444' | feat(y): implement feature D |

### Actions Taken
1. Created backup branch: backup-pr456-<YYYYMMDDHHMMSS>
2. Identified parent PR #123.
3. Classified 4 commits.
4. Cherry-picked 2 commits onto the updated base.
5. Force pushed with lease.

### Conflicts Resolved
| File | Type | Resolution |
|------|------|------------|
| none | - | - |

### Next Steps
- Review the rebased PR.
- Run CI checks.
- Delete backup only when satisfied: `git branch -D backup-pr456-<YYYYMMDDHHMMSS>`
```
