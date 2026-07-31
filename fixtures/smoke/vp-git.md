# vp-git Smoke Fixture

## Prompt

Use `$vp-git` to repair merge request !456 on a self-managed GitLab host after
its parent MR !123 was squash-merged into `main`. This host has no native stacked
pull requests, so the dependent branch must be rebased by hand.

The child branch contains these commits, oldest first:

```text
aaa1111 feat(parent): add shared auth helper
bbb2222 test(parent): cover shared auth helper
ccc3333 feat(child): use shared auth helper in session flow
ddd4444 test(child): cover session retry behavior
eee5555 refactor: normalize retry delay
fff6666 fix: adjust auth fallback
```

The host reports `aaa1111` and `bbb2222` as the original commits from parent MR
!123. Patch comparison shows `eee5555` is equivalent to a commit already on the
current `main`. Commit `fff6666` overlaps both parent and child changes, and the
available metadata does not establish its ownership.

Assume the working tree is clean and authenticated host metadata is available.

## Expected Behavior

- Confirm the intended parent and detect the squash-merge.
- Exclude `aaa1111` and `bbb2222` as parent-owned commits.
- Keep `ccc3333` and `ddd4444` as child-owned commits.
- Exclude `eee5555` as already integrated through patch equivalence.
- Present `fff6666` as uncertain and require the user to decide.
- Show the classification and obtain pre-execution confirmation.
- Create a recoverable backup branch.
- Reconstruct the child branch from the current remote base with only
  child-owned commits.
- Ask before semantic conflict decisions and before force-with-lease.
- Verify history, status, diff, and MR metadata.
- Never use an unguarded force push or delete the backup branch automatically.

## Regression Coverage

- native GitHub stacking is not assumed on a non-GitHub host;
- squash-merge evidence is not mistaken for ancestry;
- uncertain ownership remains a user decision;
- destructive rewriting has a backup branch;
- force-with-lease requires explicit confirmation;
- backup branch cleanup remains a separate manual action.
