# Commit Strategy

Use commits to describe code changes, not reviewer requests. A commit should
make sense outside PR-review context.

## Commit Message Format

Follow the repository convention. If none exists, use Conventional Commits:

```text
<type>(<scope>): <what changed>

<why this change was needed - optional>
```

Good:

```text
fix(auth): add null check for user session

The session object may be undefined when the user is not logged in. Added a
defensive check to prevent TypeError.
```

Bad:

```text
fix: address PR review comments
```

## Group By Topic

Group by modification topic, not by comment count.

Use one commit when multiple comments point to the same logical change:

```text
Comment A: "Add null check for session"
Comment B: "Handle undefined session gracefully"
Comment C: "Session might be null here"

All three -> same topic -> one commit
```

Use separate commits when comments cover different concerns:

```text
Comment A: "Add error handling"
Comment B: "Improve performance here"
Comment C: "Add input validation"

Three different topics -> three commits
```

## Decision Guide

| Scenario | Commits | Why |
|----------|---------|-----|
| Same topic, different locations | 1 | Same logical change |
| Same function, different concerns | N | Different modifications |
| Same line, same fix | 1 | Literally one change |
| Related but independent | N | Can be reverted separately |

After a shared commit addresses multiple comments, reply to each related comment
with the same commit link and a short note that the commit covers the topic.
