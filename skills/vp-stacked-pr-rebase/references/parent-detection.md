# Parent Detection

Use this reference to identify which merged PR is the parent of the current
stacked PR.

## Detection Strategy

Try these in order:

1. **Commit containment** - Get original commits from recently merged PRs via the
   GitHub API. If the current PR contains those commits, that merged PR is a
   likely parent.
2. **Branch relationship** - Look for branch naming or base branch relationships,
   such as the current PR base branch matching the parent PR head branch.
3. **Commit messages** - Look for PR references like `(#123)`.
4. **Ask the user** - If evidence is weak or conflicting, present candidates.

Commit containment works across regular, squash, and rebase merges because it
compares against the original commits stored in the GitHub API, not only against
the current base branch history.

## Confidence Criteria

Overlap formula:

```text
overlap = parent commits found in current branch / parent PR commit count
```

When the parent PR has 3 or fewer commits, cap confidence at medium because a
small overlap can be coincidental.

| Confidence | Criteria | Action |
|------------|----------|--------|
| High | single candidate, overlap >= 80%, parent has more than 3 commits, SHAs match | proceed to classification |
| Medium | multiple candidates, overlap 50-79%, small parent PR, or branch naming suggests relationship | present options |
| Low | overlap < 50%, no commit overlap, only weak hints, or branch was rebased/amended | ask before proceeding |

## High-Confidence Output

```text
Situation Analysis:
- Current PR: #456 (feature-y)
- Base branch: main
- Parent PR: #123 (feature-x) - merged 2 hours ago
- Confidence: HIGH (5/5 parent commits found in current branch)

Proceeding with PR #123 as parent. Review classification below before execution.
```

## Medium Or Low Confidence Output

```text
I found recently merged PRs that could be the parent of PR #456:

1. PR #123 (feature-x) - merged 2h ago via squash
   - 2 of 5 commits match by SHA
   - Branch name suggests relationship
   Recommendation: most likely parent

2. PR #100 (refactor-auth) - merged 1d ago via rebase
   - 1 of 5 commits has a matching message
   - No branch name relationship
   Recommendation: possible but less likely

3. None of the above - I will specify the parent PR number manually
4. No parent PR - my branch was created directly from main

Which option?
```

## No Candidates Found

```text
I could not automatically identify a parent PR for PR #456.

Possible reasons:
- The parent PR was merged long ago.
- Your branch was force-pushed or rebased, changing commit SHAs.
- The parent branch was deleted before merging.

Options:
1. Enter the parent PR number manually.
2. Show all recently merged PRs so I can pick one.
3. Skip parent detection and manually specify which commits to keep.

Which option?
```
