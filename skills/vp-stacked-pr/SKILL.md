---
name: vp-stacked-pr
description: >-
  Build, submit, merge, and repair stacks of dependent pull requests, merge
  requests, or branches. Use when a change is split across layers that each depend
  on the one below, when a dependent branch broke after its parent merged, or when
  choosing between GitHub's native stacks and a manual rebase. Platform automation
  exists on GitHub only; the manual repair path is plain Git and works on GitLab,
  Gitea, or any other host. Boundary: use vp-git for single-branch commits,
  cleanup, and ordinary PR lifecycle work.
---

# Stacked Pull Requests

Two workflows live here and they are not interchangeable. Pick by host and stack
shape before touching history.

| Situation | Workflow |
|---|---|
| GitHub, all layers in one repository | Native `gh stack`. Read `references/github-native.md`. |
| GitLab, Gitea, or any other host | Manual rebase. Read `references/manual-rebase.md`. |
| GitHub, but cross-fork or never registered as a stack | Manual rebase. Read `references/manual-rebase.md`. |

Only GitHub has platform automation for this. The manual path is plain Git, so it
carries the whole workflow on every other host: `git rebase --update-refs` and
`git rebase --onto` do the work that `gh stack` would otherwise do server-side.

Hand-rebuilding history for a registered GitHub stack throws away the server-side
rebase and retarget the platform already does, and can leave the stack
unmergeable. The reverse mistake, reaching for `gh stack` on an unsupported stack,
fails loudly and costs nothing.

## Identify the host before running anything

Read the remote, not the habit. `gh` commands fail or mislead on a non-GitHub
remote, and a repository can have several remotes pointing at different hosts.

```bash
git remote -v
```

If the remote is not GitHub, go straight to `references/manual-rebase.md`. Nothing
below applies.

On GitHub, the native path needs the `gh` CLI with GitHub's stack extension added.
Confirm the extension is present before routing there, and install it if the user
agrees.

```bash
gh repo view --json url,isFork,parent
gh stack view 2>&1 | head -5
```

`isFork` and `parent` decide whether the stack is cross-fork, which the native
feature does not support. `gh stack view` fails on a branch that is not part of a
stack, which tells you whether these branches are registered.

## Safety rules for the manual path

These hold regardless of host:

- Classify every commit as parent-owned, child-owned, or uncertain before
  rewriting, and show the classification.
- Leave uncertain ownership to the user; do not guess from branch names or commit
  messages.
- Create a backup branch before any rewrite, and never delete it automatically.
- Require explicit confirmation before `--force-with-lease`, and never use an
  unguarded force push.
- Verify the resulting history, diff, and PR/MR metadata after the rewrite.

## Authoritative sources

Native stacking is in active preview, so confirm flags against the source rather
than a memorized recipe:

- `gh stack <command> --help`
- https://gh.io/stacks
- https://docs.github.com/en/pull-requests/reference/stacked-pull-requests

Other hosts ship their own dependency features on their own schedules, and none of
them were checked here. Before assuming a host has nothing, look up whether it
offers dependent or stacked merge requests, and what its plan tier requires.

## Related skills

- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for
  single-branch commits, cleanup, and ordinary pull-request lifecycle work.
- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  when a PR in the stack has actionable author-side feedback.
