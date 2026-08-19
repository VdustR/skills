# GitHub Stacked Pull Requests

GitHub-native stacked pull requests (public preview, 2026-07-30) split a change
into an ordered chain of dependent PRs and let the platform keep them consistent.
This is a GitHub-only feature. For other hosts, or for stacks the native feature
does not cover, read `manual-rebase.md`.

## Prerequisites

Verify before starting:

- `gh` CLI is installed and the `github/gh-stack` extension is added
  (`gh extension install github/gh-stack`).
- All stack branches live in the same repository; cross-fork stacks are not
  supported.
- Each layer keeps a linear history with the layer below, which merging requires.

## Build And Submit

- Start the stack before adding layers: `gh stack init <branch>`. `gh stack add`
  and `gh stack view` fail on a branch that is not yet part of a stack.
- Commit each layer, then stack the next: `gh stack add -Am "<message>" <branch>`.
- Create or update the PRs with `gh stack submit`. Use `--auto` to skip the
  editor (implicit in non-interactive runs); add `--open` to mark new PRs ready
  instead of draft.
- Each PR targets the layer below it, and GitHub records the set as one stack.

## Merge And Restack

- Merge from the bottom up: `gh stack merge [<pr-or-stack>] --squash|--rebase|--merge --yes`.
  Every layer up to and including the chosen PR merges in one all-or-nothing step.
- A member of a registered stack cannot be merged with plain `gh pr merge` or the
  web merge button; GitHub requires the stack merge API. Use `gh stack merge`.
- Merging a lower layer auto-rebases and retargets the PRs above it server-side,
  including across squash merges: the parent's now-integrated commits are dropped
  rather than replayed, so the squash-orphan problem does not occur and the next
  PR retargets the trunk automatically. Genuine content conflicts with the updated
  base still surface — resolve them with `gh stack rebase` (`--continue` /
  `--abort`).

## Authoritative Reference

The feature is in active preview; confirm current behavior and flags against the
official sources rather than memorized recipes:

- Command help: `gh stack <command> --help`
- Docs: https://gh.io/stacks and
  https://docs.github.com/en/pull-requests/reference/stacked-pull-requests
