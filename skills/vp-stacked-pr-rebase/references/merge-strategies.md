# Merge Strategies Reference

Detailed guide for detecting and handling the three GitHub merge types.

## Overview

When a parent PR is merged, GitHub offers three merge methods. Each requires a different rebase strategy:

| Merge Type | What Happens | Detection | Rebase Strategy |
|------------|--------------|-----------|-----------------|
| **Regular Merge** | All commits preserved + merge commit | 2 parents in merge commit | Cherry-pick own commits |
| **Squash Merge** | All commits squashed into 1 new commit | 1 parent + original commits not in main | Cherry-pick own commits |
| **Rebase Merge** | All commits rewritten with new SHAs | 1 parent + commits exist in main with different SHAs | Cherry-pick own commits |

## Detection Algorithm

### Step 1: Get Merge Commit Parents

```bash
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
    }
  }
}' --jq '.data.repository.pullRequest.mergeCommit'
```

### Step 2: Apply Decision Tree

```
                    mergeCommit.parents.length
                           │
            ┌──────────────┴──────────────┐
            │                              │
          = 2                            = 1
            │                              │
            ▼                              ▼
      REGULAR MERGE          Are original commits in main?
                                          │
                               ┌──────────┴──────────┐
                               │                      │
                              No                     Yes
                               │                      │
                               ▼                      ▼
                        SQUASH MERGE           REBASE MERGE
```

### Step 3: Verify (for single-parent cases)

```bash
# Get parent PR's original commits
PARENT_COMMITS=$(gh api repos/<OWNER>/<REPO>/pulls/<PARENT_PR>/commits --jq '.[].sha')

# Check if any original commit exists in main (with same message but different SHA)
# Note: This is a best-effort heuristic. Common messages like "fix: typo" may
# produce false positives. When ambiguous, ask the user for the merge type.
# Warning: If parent commits are not in local history (e.g., branch deleted after merge),
# MSG will be empty for all commits. If zero matches found, warn user:
# "Could not verify merge type locally. Please confirm: squash or rebase merge?"
for commit in $PARENT_COMMITS; do
  MSG=$(git log -1 --format="%s" $commit 2>/dev/null || echo "")
  if [ -n "$MSG" ]; then
    # Search in main for commit with same message (use --fixed-strings for safety)
    MAIN_MATCH=$(git log origin/<baseRefName> --format="%H" --fixed-strings --grep="$MSG" -1)
    if [ -n "$MAIN_MATCH" ] && [ "$MAIN_MATCH" != "$commit" ]; then
      echo "REBASE MERGE detected: $commit rewritten as $MAIN_MATCH"
      break
    fi
  fi
done
```

## Regular Merge

### Characteristics

- Creates a merge commit with **two parents**:
  - Parent 1: The target branch (main) at merge time
  - Parent 2: The PR branch's HEAD
- All original commits are preserved with their original SHAs
- Commit history shows the branch structure

### Visual

```
Before merge:
main:    M1 ── M2 ── M3
                     │
PR X:                └── A ── B
                              │
PR Y:                         └── C ── D

After merge (regular):
main:    M1 ── M2 ── M3 ──────────── MERGE
                     │               /
PR X:                └── A ── B ────┘
                              │
PR Y:                         └── C ── D  (still has A, B, C, D)
```

### Rebase Strategy

Use cherry-pick for consistency with other merge types:

```bash
# 1. Identify your commits (C, D) - not in parent PR's original commits
OWN_COMMITS="ccc3333 ddd4444"

# 2. Start fresh from updated main
git checkout -b temp-rebase origin/<baseRefName>

# 3. Cherry-pick only your commits
git cherry-pick $OWN_COMMITS

# 4. Replace original branch
git checkout <your-branch>
git reset --hard temp-rebase
git branch -D temp-rebase
```

> **Note:** While `git rebase` also works for regular merge, we use cherry-pick for consistency across all merge types.

## Squash Merge

### Characteristics

- Creates a **single new commit** containing all changes
- Original commits (A, B) are **not** in main
- The squash commit's SHA is completely new
- Commit message usually contains PR title and may list original commits

### Visual

```
Before merge:
main:    M1 ── M2 ── M3
                     │
PR X:                └── A ── B
                              │
PR Y:                         └── C ── D

After squash merge:
main:    M1 ── M2 ── M3 ── [A+B squashed]
                     │
PR X:                └── A ── B  (original commits NOT in main)
                              │
PR Y:                         └── C ── D  (still has A, B, C, D)
```

### Rebase Strategy

Cannot use simple `git rebase` because Git won't recognize A, B are "already applied":

```bash
# This will NOT work correctly for squash merge!
git rebase origin/<baseRefName>
# Git will try to apply A, B, C, D - causing conflicts or duplicates
```

**Correct approach - cherry-pick only your commits:**

```bash
# 1. Identify your commits (C, D) - not in parent PR's original commits
OWN_COMMITS="ccc3333 ddd4444"

# 2. Start fresh from updated main
git checkout -b temp-rebase origin/<baseRefName>

# 3. Cherry-pick only your commits
git cherry-pick $OWN_COMMITS

# 4. Replace original branch
git checkout <your-branch>
git reset --hard temp-rebase
git branch -D temp-rebase
```

## Rebase Merge

### Characteristics

- Each original commit is **rewritten** with a new SHA
- Commit messages are preserved
- The new commits are **linear** on main (no merge commit)
- Original SHAs (A, B) become new SHAs (A', B') in main

### Visual

```
Before merge:
main:    M1 ── M2 ── M3
                     │
PR X:                └── A ── B
                              │
PR Y:                         └── C ── D

After rebase merge:
main:    M1 ── M2 ── M3 ── A' ── B'  (same content, different SHA)
                     │
PR X:                └── A ── B  (original SHAs, NOT in main)
                              │
PR Y:                         └── C ── D  (still has old A, B)
```

### Rebase Strategy

Same as squash merge - cherry-pick only your commits:

```bash
# Git rebase won't work because A (sha:aaa) ≠ A' (sha:aaa')
# Even though the content is the same, SHAs differ

# Use cherry-pick strategy (same as squash merge)
git checkout -b temp-rebase origin/<baseRefName>
git cherry-pick ccc3333 ddd4444  # Only your commits
git checkout <your-branch>
git reset --hard temp-rebase
git branch -D temp-rebase
```

## Summary: Always Use Cherry-pick

| Merge Type | Strategy | Why cherry-pick? |
|------------|----------|------------------|
| Regular | Cherry-pick | Consistency |
| Squash | Cherry-pick | Original commits NOT in main |
| Rebase | Cherry-pick | SHAs differ even if content same |

**We always use cherry-pick** for:
- Consistent, predictable behavior
- Works for ALL merge types
- Explicit control over which commits to keep

## Identifying Your Commits

Regardless of merge type, the commit identification is the same:

```bash
# 1. Get parent PR's original commits from GitHub API (one per line)
PARENT_COMMITS=$(gh api repos/<OWNER>/<REPO>/pulls/<PARENT_PR>/commits --paginate --jq '.[].sha')

# 2. Get all commits in your branch
ALL_COMMITS=$(git log --format="%H" $(git merge-base HEAD origin/<baseRefName>)..HEAD)

# 3. Filter to keep only YOUR commits (use exact line match to avoid substring false positives)
OWN_COMMITS=""
for commit in $ALL_COMMITS; do
  if ! echo "$PARENT_COMMITS" | grep -Fxq "$commit"; then
    OWN_COMMITS="$OWN_COMMITS $commit"
  fi
done

echo "Your commits to cherry-pick: $OWN_COMMITS"
```

## Edge Cases

### Multiple Parent PRs (PR Chain)

If PR Y depends on PR X, and PR X depends on PR W:

```
W: commits W1, W2
X: commits W1, W2, X1, X2  (depends on W)
Y: commits W1, W2, X1, X2, Y1, Y2  (depends on X)
```

When both W and X are merged, Y contains commits from both. Solution:

1. Identify all merged parent PRs in the chain
2. Collect all their original commits from each PR via GitHub API
3. Union all parent commits: `{W1, W2, X1, X2}`
4. Cherry-pick only commits NOT in the union: `{Y1, Y2}`

**When uncertain about the chain:**
```
Your PR #789 appears to have multiple parent PRs:
- PR #100 (W) — merged 1d ago, contributes commits W1, W2
- PR #200 (X) — merged 2h ago, contributes commits W1, W2, X1, X2

Options:
1. Exclude commits from ALL parent PRs (recommended — keeps only Y1, Y2)
2. Exclude only the immediate parent PR #200 (keeps W1, W2, Y1, Y2)
3. Let me specify which commits to keep manually
```

### Amended Commits

If you amended a commit that was originally from the parent PR:

- The SHA will differ from the parent PR's records
- You may accidentally classify it as "your own"
- **Detection:** Check commit messages and authors, not just SHAs
- **When uncertain:** Present the commit with context and ask user

```
⚠️ Commit fff6666 "fix: typo in config" has the same message as parent PR
commit aaa1111, but with a different SHA and author (@you instead of @alice).

Did you amend this commit from the parent PR, or is this your own independent fix?
1. It's from the parent — exclude it
2. It's my own work — keep it
3. Show diff — let me compare both commits
```

### Interactive Rebase Before Merge

If you ran `git rebase -i` and squashed/reordered commits:

- Your commit SHAs will differ from what the parent PR had
- SHA-based matching will fail; fall back to commit message matching
- If messages were also rewritten, fall back to manual selection
- **Always ask user to confirm** classification when SHAs don't match

### Force-Pushed Child Branch

If the child PR branch was force-pushed (e.g., after a local rebase):

- The commits in the local branch may have different SHAs from both the parent PR API records AND the original child branch
- **Strategy:** Compare by commit message + author as primary, SHA as secondary
- If still uncertain, use manual commit selection
