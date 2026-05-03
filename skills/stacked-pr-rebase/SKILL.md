---
name: stacked-pr-rebase
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

Automate rebasing of stacked PRs after their parent PR is merged. Identifies your commits, handles different merge types (regular, squash, rebase), and cherry-picks only your work onto the updated base.

## Core Principles

1. **Analyze Before Acting** - Always understand the dependency relationship and merge type before making changes
2. **Preserve User Work** - Only cherry-pick/rebase the user's own commits; never lose work
3. **Smart Detection** - Automatically detect parent PR and merge type when possible; ask user only when uncertain
4. **Handle Conflicts Gracefully** - Auto-resolve simple conflicts; ask user for complex semantic conflicts
5. **Safe Operations** - Always create backup branch; use `--force-with-lease`; require confirmation for force push
6. **Clear Reporting** - Show exactly what will happen before and after

## Quick Start

### Basic Usage

```
User: My PR depends on PR #123 which just got merged. Help me rebase.
```

Workflow:
1. Analyze current PR's commit history
2. Identify parent PR (from branch/commits analysis or ask user)
3. Detect how parent PR was merged (regular/squash/rebase)
4. Classify commits: "parent's" vs "your own"
5. Create backup branch
6. Cherry-pick your commits to updated base
7. Handle any conflicts
8. Force push with user confirmation
9. Generate summary report

### With Explicit Parent PR

```
User: Rebase my PR, parent was PR #456
```

## Workflow Overview

### Phase 1: Situation Analysis

Gather context about the current PR and identify the parent PR.

```bash
# Get current PR info
gh pr view <PR_NUMBER> --json number,title,headRefName,baseRefName,commits

# Find merge-base with target branch
git merge-base HEAD origin/<baseRefName>

# List commits from merge-base to HEAD
git log --oneline $(git merge-base HEAD origin/<baseRefName>)..HEAD

# Get recently merged PRs targeting the same base branch
gh pr list --state merged --base <baseRefName> --limit 20 \
  --json number,title,headRefName,mergeCommit,commits

# For stacked PRs (baseRefName != main/master):
# Find the PR whose head branch IS your base branch — that's likely the parent PR
gh pr list --state merged --head <baseRefName> --limit 5 \
  --json number,title,headRefName,mergeCommit,commits
```

**Detection Strategy (try in order):**

1. **Check commit containment** (most reliable for squash merge):
   - Get original commits from each recently merged PR via GitHub API
   - Check if current PR's commits **contain** those original commits
   - If current PR contains merged PR's original commits → that's the parent PR

   ```
   Merged PR #123 original commits (from API): A, B
   Current PR commits (from git log): A, B, C, D

   → Current PR contains A, B → Parent PR is #123
   → C, D are "your own" commits to keep
   ```

2. **Check branch relationship**: Look for branch naming patterns (e.g., `feature-x` → `feature-x-part2`)
3. **Check commit messages**: Look for PR references like `(#123)` in commit messages
4. **Ask user**: If no clear match, present candidates and ask

> **Note:** This strategy works regardless of how the parent PR was merged (regular, squash, or rebase), because we compare against the **original commits stored in GitHub API**, not against what's currently in main.

**Confidence Criteria:**

**Overlap formula:** `overlap = |parent_commits ∩ current_commits| / |parent_commits|` (ratio of parent PR's commits found in current branch). When parent PR has ≤3 commits, cap confidence at MEDIUM to require user confirmation.

| Confidence | Criteria | Action |
|------------|----------|--------|
| **HIGH** | Single candidate with overlap ≥80%; parent PR has >3 commits; SHAs match exactly | Proceed automatically, show classification for confirmation |
| **MEDIUM** | Multiple candidates; or overlap 50-79%; or parent PR has ≤3 commits; or branch naming suggests relationship | Present candidates with recommendation |
| **LOW** | Overlap <50%; or no commit overlap; only branch naming or commit message hints; or user's branch was rebased/amended | Must ask user before proceeding |

**Output (HIGH confidence):**
```
Situation Analysis:
- Current PR: #456 (feature-y)
- Base branch: main
- Parent PR: #123 (feature-x) - merged 2 hours ago
- Confidence: HIGH (2/2 parent commits found in current branch)
- Proceeding with PR #123 as parent. Review classification below before execution.
```

**Output (MEDIUM/LOW confidence) — Present Options:**

When confidence is not HIGH, present structured options to the user:

```
I found the following recently merged PRs that could be the parent of your PR #456:

1. PR #123 (feature-x) — merged 2h ago via squash
   - 2 of 5 commits match by SHA
   - Branch name suggests relationship
   → Recommended: most likely parent

2. PR #100 (refactor-auth) — merged 1d ago via rebase
   - 1 of 5 commits has matching message
   - No branch name relationship
   → Possible but less likely

3. None of the above — I'll specify the parent PR number manually

4. No parent PR — my branch was created directly from main
   (use regular rebase instead)

Which option? [1/2/3/4]
```

**When no candidates found:**
```
I couldn't automatically identify a parent PR for your PR #456.

Possible reasons:
- The parent PR was merged long ago (>20 recent merges)
- Your branch was force-pushed or rebased, changing commit SHAs
- The parent branch was deleted before merging

Options:
1. Enter the parent PR number manually
2. Show me ALL recently merged PRs so I can pick one
3. Skip parent detection — I'll manually specify which commits to keep

Which option? [1/2/3]
```

### Phase 2: Merge Type Detection

Determine how the parent PR was merged to choose the correct rebase strategy.

```bash
# Get parent PR's merge commit details
gh api graphql -f query='
{
  repository(owner: "<OWNER>", name: "<REPO>") {
    pullRequest(number: <PARENT_PR_NUMBER>) {
      mergeCommit {
        oid
        parents(first: 2) {
          nodes { oid }
        }
      }
      commits(first: 100) {
        nodes {
          commit { oid message }
        }
      }
    }
  }
}'
```

**Detection Logic:**

| Merge Type | Detection | Strategy |
|------------|-----------|----------|
| **Regular Merge** | `mergeCommit.parents` has 2 nodes | Cherry-pick own commits |
| **Squash Merge** | 1 parent + original commits not in main | Cherry-pick own commits |
| **Rebase Merge** | 1 parent + original commits rewritten in main | Cherry-pick own commits |

> **Note:** We use cherry-pick for ALL merge types for consistency and predictability.

```
Decision Tree:
                    mergeCommit.parents.length
                           │
            ┌──────────────┴──────────────┐
            │                              │
          2 parents                    1 parent
            │                              │
            ▼                              ▼
      REGULAR MERGE          Check if original commits in main
                                          │
                               ┌──────────┴──────────┐
                               │                      │
                          Not found            Found (rewritten)
                               │                      │
                               ▼                      ▼
                        SQUASH MERGE           REBASE MERGE
```

### Phase 3: Commit Classification

Identify which commits are "parent's" (to exclude) vs "your own" (to keep).

**Key Insight for Squash Merge:**
- The parent PR's original commits (A, B) still exist in your branch
- They were squashed in main, but GitHub API still has their SHAs
- Compare your branch commits against parent PR's original commits from API

```bash
# Get parent PR's original commits from GitHub API
# Note: GitHub REST API returns max 250 commits per page.
# For PRs with 250+ commits, paginate or fall back to manual selection.
gh api repos/<OWNER>/<REPO>/pulls/<PARENT_PR>/commits --paginate --jq '.[].sha'
# Output: aaa1111, bbb2222

# List all commits in current branch
git log --format="%H %s" $(git merge-base HEAD origin/<baseRefName>)..HEAD
# Output: aaa1111, bbb2222, ccc3333, ddd4444
```

**Classification Logic:**

```
Parent PR's original commits (from API): {aaa1111, bbb2222}
Current PR's commits (from git log):     [aaa1111, bbb2222, ccc3333, ddd4444]

For each commit in current PR:
  if commit.sha IN parent_pr_commits:
    → Parent commit → EXCLUDE
  else:
    → Your commit → KEEP
```

**Classification Rules (applied in order):**

| Priority | Condition | Classification | Confidence |
|----------|-----------|---------------|------------|
| 1 | SHA in parent PR's original commits list | Parent → Exclude | HIGH |
| 2 | Commit message matches parent PR commit exactly (non-generic) AND same author AND different SHA | Parent (rebased) → Exclude | HIGH |
| 3 | Commit message matches a parent PR commit but author differs; OR message is generic (e.g., "fix: typo", "chore: lint") with same author | **UNCERTAIN** → Ask user | — |
| 4 | Everything else | **Your commit → Keep** | HIGH |

**Output — Always show for user confirmation:**
```
Commit Classification:
┌──────────┬─────────────────────────────────────┬────────────┬────────────┐
│ SHA      │ Message                             │ Type       │ Confidence │
├──────────┼─────────────────────────────────────┼────────────┼────────────┤
│ aaa1111  │ feat(x): implement feature A        │ Parent (A) │ HIGH       │
│ bbb2222  │ feat(x): implement feature B        │ Parent (B) │ HIGH       │
│ ccc3333  │ feat(y): implement feature C        │ OWN ✓      │ HIGH       │
│ ddd4444  │ feat(y): implement feature D        │ OWN ✓      │ HIGH       │
└──────────┴─────────────────────────────────────┴────────────┴────────────┘

Commits to cherry-pick (2): ccc3333, ddd4444
Commits to exclude (2): aaa1111, bbb2222

Does this look correct? [y/N]
```

**When classification has UNCERTAIN commits:**
```
Commit Classification:
┌──────────┬─────────────────────────────────────┬────────────┬────────────┐
│ SHA      │ Message                             │ Type       │ Confidence │
├──────────┼─────────────────────────────────────┼────────────┼────────────┤
│ aaa1111  │ feat(x): implement feature A        │ Parent (A) │ HIGH       │
│ bbb2222  │ fix: address review feedback         │ ??? ⚠️     │ UNCERTAIN  │
│ ccc3333  │ feat(y): implement feature C        │ OWN ✓      │ HIGH       │
│ ddd4444  │ feat(y): implement feature D        │ OWN ✓      │ HIGH       │
└──────────┴─────────────────────────────────────┴────────────┴────────────┘

⚠️ Commit bbb2222 is UNCERTAIN:
  Message "fix: address review feedback" matches a parent PR commit,
  but the author differs (you vs parent PR author).
  This may be a commit you amended from the parent PR.

Options for bbb2222:
1. Exclude — it's from the parent PR (I didn't change it)
2. Keep — it's my own work (I rewrote/amended it)
3. Show diff — let me review the changes before deciding

Which option? [1/2/3]
```

**Manual commit selection (fallback):**

When user chose "specify which commits to keep" or when auto-classification fails:
```
Here are all commits in your branch (oldest first):

1. [aaa1111] feat(x): implement feature A — by @alice, 3 days ago
2. [bbb2222] feat(x): implement feature B — by @alice, 3 days ago
3. [ccc3333] fix: handle edge case in feature Y — by @you, 2 days ago
4. [ddd4444] feat(y): implement feature C — by @you, 1 day ago
5. [eee5555] feat(y): implement feature D — by @you, 1 day ago

Which commits are YOUR OWN work to keep?
Enter commit numbers (e.g., "3,4,5" or "3-5"):
```

### Phase 3.5: Pre-Execution Confirmation

**ALWAYS confirm with user before proceeding to execution.** Show a summary:

```
Ready to rebase PR #456 onto updated main.

Plan:
- Parent PR: #123 (merged via squash)
- Commits to EXCLUDE (parent's): aaa1111, bbb2222
- Commits to KEEP (yours):       ccc3333, ddd4444
- Backup branch will be created: backup-pr456-<timestamp>

⚠️ This will rewrite your branch history.
Proceed? [y/N]
```

If user says no, offer alternatives:
```
Options:
1. Re-classify commits — let me adjust which commits to keep/exclude
2. Abort entirely — keep my branch as-is
3. Use manual mode — let me pick commits interactively
```

### Phase 4: Rebase Execution

Execute the rebase/cherry-pick operation with conflict handling.

**1. Preparation:**
```bash
# Fetch latest
git fetch origin <baseRefName>

# Create backup branch
git branch backup-pr<NUMBER>-$(date +%Y%m%d%H%M%S) HEAD
```

**2. Execute Strategy (same for ALL merge types):**

```bash
# Clean up any leftover temp branch from previous failed attempt
git branch -D temp-rebase 2>/dev/null || true

# Create temp branch from updated base
git checkout -b temp-rebase origin/<baseRefName>

# Cherry-pick own commits in order (oldest first)
git cherry-pick <own_commit_1> <own_commit_2> ...

# Replace original branch
git checkout <original_branch>
git reset --hard temp-rebase
git branch -D temp-rebase
```

> **Why cherry-pick for all?** Consistent, predictable behavior regardless of merge type. No surprises.

**3. Conflict Handling:**

See `references/conflict-resolution.md` for detailed conflict handling.

| Conflict Type | Example | Action |
|---------------|---------|--------|
| **Whitespace-only** | Trailing spaces, line endings, indentation | Auto-resolve; list resolved files for user review |
| **Additive** | Both sides added different imports/lines | Attempt keep-both; ask if result is unclear |
| **Semantic** | Same line modified, function signature changed | Always ask user |

```bash
# During conflict, check status
git status

# View conflict details
git diff

# After resolving
git add <resolved_file>
git cherry-pick --continue
```

### Phase 5: Completion & Report

Verify, push, and report results.

**1. Verify:**
```bash
# Check commit history
git log --oneline -10

# Confirm file status
git status

# Compare with remote (run BEFORE force push — shows what will change on remote)
git diff origin/<branch>..HEAD --stat
```

**2. Confirm Force Push:**

```
⚠️ Ready to force push to origin/<branch>

Changes:
- Removed parent commits: aaa1111, bbb2222
- Kept your commits: ccc3333 → ccc3333' (rebased)
                     ddd4444 → ddd4444' (rebased)

This will REPLACE the remote branch. Proceed? [y/N]
```

**3. Push:**
```bash
git push --force-with-lease origin <branch>
```

**4. Summary Report:**

~~~~~~
## Stacked PR Rebase Summary

**PR:** #456 - Feature Y
**Parent PR:** #123 - Feature X (merged via squash)

### Before
```
main ── M1 ── M2 ── [PR #123 squash] ──────────────
                │
PR Y:          └── A ── B ── C ── D  (your PR, forked before squash)
```

### After
```
main ── M1 ── M2 ── [PR #123 squash] ── C' ── D'  (rebased)
```

### Commits Preserved
| Original | Rebased | Message |
|----------|---------|---------|
| ccc3333  | ccc3333' | feat(y): implement feature C |
| ddd4444  | ddd4444' | feat(y): implement feature D |

### Actions Taken
1. Created backup branch: backup-pr456-<YYYYMMDDHHMMSS>
2. Identified parent PR #123 (squash merged)
3. Classified 4 commits (2 parent, 2 own)
4. Cherry-picked 2 commits onto new base
5. Force pushed to origin/feature-y

### Conflicts Resolved
| File | Type | Resolution |
|------|------|------------|
| (none) | - | - |

### Next Steps
- [ ] Review the rebased PR
- [ ] Run CI checks
- [ ] Delete backup when satisfied: `git branch -D backup-pr456-<YYYYMMDDHHMMSS>`
~~~~~~

## Important Guidelines

### DO

- **Verify parent PR identification** before proceeding; ask user if uncertain
- **Always create backup branch** before any destructive operation
- **Use `--force-with-lease`** instead of `--force` for safety
- **Require user confirmation** before force pushing
- **Handle all three merge types** (regular, squash, rebase)
- **Preserve commit messages** and authorship when cherry-picking
- **Report clearly** what was done and what commits were affected

### DON'T

- **Don't assume parent PR** without verification; ask if confidence is low
- **Don't force push without confirmation**
- **Don't lose commits** - always classify carefully
- **Don't auto-resolve complex conflicts** - ask user for semantic changes
- **Don't delete backup branch automatically** - let user decide
- **Don't proceed if unsure** about commit classification

## Error Handling

| Error | Action |
|-------|--------|
| Cannot identify parent PR | Ask user to specify PR number |
| Parent PR not yet merged | Abort with message; suggest waiting |
| No own commits found | Warn user; may already be rebased |
| Cherry-pick conflict | Classify and handle (auto/ask) |
| Own commit is a merge commit | Warn user: `cherry-pick -m 1` only keeps changes from one parent's perspective. Recommend squashing merge commits first via `git rebase -i` before running this skill. Ask user to confirm. |
| Force push rejected | Check if branch protection; suggest user intervention |
| Backup branch exists | Use timestamp suffix for uniqueness |
| Current branch has no PR | Ask user which PR to operate on, or create one |
| Multiple parent PRs in chain | Identify all parent PRs, collect all their commits, keep only commits not belonging to any parent PR. Cherry-pick in topological order (oldest first) to preserve dependencies. |
| temp-rebase branch already exists | Delete it before proceeding: `git branch -D temp-rebase` |
| Parent PR has 250+ commits | Use `--paginate` flag or fall back to manual commit selection |

## Additional Resources

- **`references/merge-strategies.md`** - Detailed merge type detection and handling
- **`references/conflict-resolution.md`** - Conflict classification and resolution strategies
- **`references/decision-points.md`** - Consolidated summary of all interactive decision points

## Notes

- Requires `gh` CLI authenticated with appropriate permissions
- Works with GitHub PRs (GitLab/Bitbucket not supported)
- Branch must be checked out locally
- Always test with a backup before critical operations
