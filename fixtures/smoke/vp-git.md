# vp-git Smoke Fixture

## Prompt

Use `$vp-git` to repair PR #456 after its parent PR #123 was squash-merged into
`main`.

The child branch contains two parent-owned commits followed by two child-owned
commits. GitHub reports the same two parent commits for PR #123. Assume the
working tree is clean and authenticated host metadata is available.

## Expected Behavior

- Confirm the intended parent and detect the squash merge.
- Classify parent-owned, child-owned, equivalent, and uncertain commits before
  changing history.
- Show the classification and obtain pre-execution confirmation.
- Create a recoverable backup branch.
- Reconstruct the child branch from the current remote base with only
  child-owned commits.
- Ask before semantic conflict decisions and before force-with-lease.
- Verify history, status, diff, and PR metadata.
- Never use an unguarded force push or delete the backup branch automatically.

## Regression Coverage

- squash-merge evidence is not mistaken for ancestry;
- uncertain ownership remains a user decision;
- destructive rewriting has a backup branch;
- force-with-lease requires explicit confirmation;
- backup branch cleanup remains a separate manual action.
