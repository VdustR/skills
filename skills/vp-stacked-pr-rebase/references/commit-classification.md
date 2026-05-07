# Commit Classification

Classify commits so parent PR work is excluded and the user's own work is kept.

## Data To Collect

```bash
gh api repos/<OWNER>/<REPO>/pulls/<PARENT_PR>/commits --paginate --jq '.[].sha'
git log --format="%H %s" "$(git merge-base HEAD origin/<baseRefName>)"..HEAD
```

## Rules

```text
Parent PR original commits: {aaa1111, bbb2222}
Current PR commits:         [aaa1111, bbb2222, ccc3333, ddd4444]

For each current PR commit:
  if commit.sha is in parent PR commits:
    exclude as parent commit
  else:
    keep as user-owned commit
```

Apply these rules in order:

| Priority | Condition | Classification | Confidence |
|----------|-----------|----------------|------------|
| 1 | SHA in parent PR original commits | parent, exclude | high |
| 2 | message matches parent commit exactly, non-generic, same author, different SHA | parent, exclude | high |
| 3 | message match is generic or author differs | uncertain, ask user | none |
| 4 | everything else | user-owned, keep | high |

## Classification Output

```text
Commit Classification:

aaa1111  feat(x): implement feature A  parent  HIGH
bbb2222  feat(x): implement feature B  parent  HIGH
ccc3333  feat(y): implement feature C  own     HIGH
ddd4444  feat(y): implement feature D  own     HIGH

Commits to cherry-pick: ccc3333, ddd4444
Commits to exclude: aaa1111, bbb2222

Does this look correct?
```

## Uncertain Commits

```text
Commit bbb2222 is uncertain:
- Message "fix: address review feedback" matches a parent PR commit.
- The author differs from the parent PR commit.
- This may be your own amended work or inherited parent work.

Options:
1. Exclude - it is from the parent PR.
2. Keep - it is my own work.
3. Show diff - review the changes before deciding.

Which option?
```

## Manual Selection

Use manual selection when the user requests it or automatic classification is
not trustworthy.

```text
Here are all commits in your branch, oldest first:

1. [aaa1111] feat(x): implement feature A - by @alice, 3 days ago
2. [bbb2222] feat(x): implement feature B - by @alice, 3 days ago
3. [ccc3333] fix: handle edge case in feature Y - by @you, 2 days ago
4. [ddd4444] feat(y): implement feature C - by @you, 1 day ago

Which commits are your own work to keep?
Enter commit numbers, for example "3,4" or "3-4".
```
