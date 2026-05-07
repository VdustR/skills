# vp-stacked-pr-rebase Smoke Fixture

## Prompt

Use `$vp-stacked-pr-rebase` to rebase PR #456 after parent PR #123 was squash
merged into `main`.

Current branch commit list, oldest first:

```text
aaa1111 feat(parent): add shared auth helper
bbb2222 test(parent): cover shared auth helper
ccc3333 feat(child): use shared auth helper in session flow
ddd4444 test(child): cover session retry behavior
```

GitHub API reports PR #123 original commits:

```text
aaa1111
bbb2222
```

Assume working tree is clean, branch is checked out locally, and `gh` is
authenticated.

## Expected Behavior

- Confirm PR #123 is the parent and report squash merge detection.
- Classify `aaa1111` and `bbb2222` as parent commits to exclude.
- Classify `ccc3333` and `ddd4444` as user-owned commits to keep.
- Show commit classification before changing history.
- Ask for pre-execution confirmation.
- Create a timestamped backup branch before destructive operations.
- Recreate the branch from `origin/main`.
- Cherry-pick only `ccc3333` and `ddd4444`, oldest first.
- Ask before any semantic conflict resolution.
- Verify `git log`, `git status`, and remote diff before pushing.
- Ask before `git push --force-with-lease`.
- Never use plain `--force`.
- Never delete the backup branch automatically.

## Regression Coverage

- squash merges do not use plain `git rebase`
- original parent commits from GitHub API drive exclusion
- commit classification is user-visible before execution
- uncertain commits require user selection
- destructive operations have a backup branch
- force push requires explicit confirmation and uses `--force-with-lease`
- backup branch cleanup remains a manual next step
