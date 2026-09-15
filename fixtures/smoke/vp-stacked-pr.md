# vp-stacked-pr Smoke Fixture

## Prompt

Use `$vp-stacked-pr` for three stacked-change situations and route each to the correct
reference before acting:

**Situation 1 — GitHub, same repository.** Build and land a three-layer stack of
dependent pull requests, then merge it.

**Situation 2 — self-managed GitLab host.** A dependent branch broke after its
parent MR !123 was squash-merged into `main`. This host has no native stacked
pull requests, so the dependent branch must be rebased by hand. The child branch
contains these commits, oldest first:

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

Assume each working tree is clean and authenticated host metadata is available.

**Situation 3 — ad-hoc GitHub stack.** PR #201 targets `main`, PR #202 targets
the `feature/layer-one` branch from PR #201, and PR #203 also targets
`feature/layer-one`. PR #201 is ready to squash-merge with branch deletion. The
stack is not registered with `gh stack`. First describe the safe merge order.
Then assume `feature/layer-one` was deleted before retargeting, both child PRs
closed, and the branch's verified pre-deletion tip was `abc1234`; recover the
original PRs without replacing them.

## Expected Behavior

Situation 1 (GitHub native stack) routes to `references/github-native.md`:

- Build with `gh stack init`, then `gh stack add` per layer, and open the PRs with
  `gh stack submit`; do not hand-rebuild history for a GitHub same-repo stack.
- Land bottom up with `gh stack merge`; a member of a registered stack cannot be
  merged with plain `gh pr merge` and must go through the stack merge API.
- Rely on the server-side auto-rebase and retarget of upper PRs rather than a
  manual reconstruction.

Situation 2 (non-GitHub manual repair) routes to `references/manual-rebase.md`:

- Confirm the intended parent and detect the squash-merge.
- Exclude `aaa1111` and `bbb2222` as parent-owned commits.
- Keep `ccc3333` and `ddd4444` as child-owned commits.
- Exclude `eee5555` as already integrated through patch equivalence.
- Present `fff6666` as uncertain and require the user to decide.
- Show the classification and obtain pre-execution confirmation.
- Create a recoverable backup outside `refs/heads` with the exact command
  `git update-ref refs/backup/<name> <branch> ""`, and record its object ID
  before the rewrite. The expected-empty guard must fail rather than overwrite a
  retained backup that has the same name. A backup branch pointing into the
  rebased range is unsafe because `--update-refs` moves it with the stack
  branches.
- Reconstruct the child branch from the current remote base with only
  child-owned commits.
- Ask before semantic conflict decisions and before force-with-lease.
- Verify history, status, diff, and MR metadata.
- Confirm the backup ref did not move after the rebase. Never use an unguarded
  force push or delete the backup ref automatically.

Situation 3 (GitHub ad-hoc stack) routes to `references/manual-rebase.md`:

- Before merging PR #201 or deleting `feature/layer-one`, enumerate every open
  PR based on that branch with a REST query paginated to exhaustion.
- Retarget PR #202 and PR #203 to their intended new bases, then read back each
  PR's `state` and `baseRefName`. A default-limited listing is incomplete
  evidence.
- Stop the merge and branch deletion if either child is not open or still names
  `feature/layer-one` as its base. This gate also applies to automatic branch
  deletion and `gh pr merge --delete-branch`.
- For recovery, push `abc1234` back to
  `refs/heads/feature/layer-one`, reopen each original child with
  `gh api -X PATCH repos/<owner>/<repo>/pulls/<child-pr> -f state=open`, retarget
  it while open, and verify its state and base metadata.
- Delete the recreated branch only after both original PRs are open, both bases
  are verified, and no other open PR uses the branch. Do not open replacement
  PRs or discard their review history.

## Regression Coverage

- GitHub same-repo stacks route to the native `gh stack` workflow, not manual
  reconstruction;
- a stacked member merges only through the stack merge API, never plain
  `gh pr merge`;
- native GitHub stacking is not assumed on a non-GitHub host;
- squash-merge evidence is not mistaken for ancestry;
- uncertain ownership remains a user decision;
- destructive rewriting has a backup ref outside `refs/heads` whose object ID is
  verified unchanged;
- repeated backup creation cannot overwrite a retained recovery point;
- force-with-lease requires explicit confirmation;
- backup ref cleanup remains a separate manual action.
- GitHub ad-hoc stacks retarget every affected child PR before a merged base
  branch is deleted;
- dependent PR discovery is paginated to exhaustion rather than capped by a
  command default;
- failed retarget readback blocks merge and branch deletion;
- recovery recreates the exact missing base, uses REST to reopen the original
  PR, retargets it while open, and deletes the recreated branch only after
  complete metadata verification.
