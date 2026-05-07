# Interactive Decision Points Summary

Every point where the skill must pause and ask the user, consolidated for reference:

## 1. Which PR to rebase?

**Trigger:** User doesn't specify a PR, or current branch has no PR.

```
I need to know which PR to rebase. Options:
1. PR #456 (feature-y) — current branch matches this PR
2. Let me specify a different PR number
3. Show all my open PRs so I can pick one
```

## 2. Which is the parent PR?

**Trigger:** Confidence is MEDIUM or LOW, or multiple candidates exist.

See `parent-detection.md` for output examples. Always present numbered options with a recommendation.

## 3. Are the commit classifications correct?

**Trigger:** ALWAYS shown before execution. For auto-classification: show the full classification table. For manual selection: show the user's chosen commits for confirmation.

## 4. How to handle uncertain commits?

**Trigger:** Commit cannot be clearly classified (amended, message-only match, different author).

Options: Exclude / Keep / Show diff. See `commit-classification.md` for the uncertain-commit example.

## 5. Ready to execute?

**Trigger:** ALWAYS, before any destructive operation.

See `execution.md` for the pre-execution confirmation example.

## 6. How to handle conflicts?

**Trigger:** Cherry-pick produces merge conflicts that cannot be auto-resolved.

See Phase 4 Conflict Handling and `conflict-resolution.md`.

```
Conflict in file: src/auth/handler.ts

The conflict appears to be a semantic change (both parent and your PR
modified the same function).

Options:
1. Show me the conflict — I'll resolve it manually
2. Keep my version (yours) for all conflicts in this file
3. Keep the base version (main) for all conflicts in this file
4. Abort the rebase — restore from backup
```

**If user chooses Abort (option 4):**
```bash
# If cherry-pick is in progress on temp-rebase branch:
git cherry-pick --abort
git checkout <original_branch>
git branch -D temp-rebase 2>/dev/null || true

# If original branch was already reset (Phase 4 step completed partially):
git reset --hard backup-pr<NUMBER>-<timestamp>
```

## 7. Ready to force push?

**Trigger:** ALWAYS, before pushing.

See `execution.md` for the force-push confirmation example.
