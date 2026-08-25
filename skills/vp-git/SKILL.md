---
name: vp-git
description: >-
  Handle personal Git and GitHub workflows, including commits, repository
  setup, gitignore files, cleanup, and pull request lifecycle decisions. Use for
  Git changes that need safety, repository conventions, or host-aware evidence.
  Boundary: use vp-stacked-pr for stacks of dependent PRs or branches, and the
  specialized PR skills for briefing, checklist verification, review follow-up,
  or comment resolution.
---

# Git Workflows

Use repository evidence before applying a generic workflow. Treat local history,
remote state, and hosting-platform state as separate sources of truth.

## Principles

- Start with read-only inspection and identify the repository's own conventions.
- Preserve unrelated work and make the smallest reversible change.
- Require explicit authorization for writes to history, remotes, branches, PR
  state, or other collaborators' surfaces.
- Verify the exact resulting diff, history, remote state, and checks that matter
  to the requested outcome.
- Prefer Git's current help and repository tooling over copied command recipes.

## Route

- Commit scope and messages: read `references/commits.md`.
- Clone and repository setup: read `references/repositories.md`.
- `.gitignore` creation or repair: read `references/gitignore.md`.
- Branch, worktree, stash, and ref cleanup: read `references/cleanup.md`.
- Draft, ready, review, and merge decisions: read
  `references/pull-requests.md`.

Load only the references needed for the request. Specialized PR skills remain
authoritative for their narrower workflows.

## Related skills

- [`vp-stacked-pr`](https://github.com/VdustR/skills/tree/main/skills/vp-stacked-pr)
  for dependent branches or pull requests.
- [`vp-pr-briefing`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-briefing)
  for understanding an unfamiliar pull request before acting.
- [`vp-github`](https://github.com/VdustR/skills/tree/main/skills/vp-github) for
  attachments, Markdown rendering, and GitHub credential boundaries.
- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  for author-side PR feedback.
- [`vp-pr-review-followup`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-review-followup)
  for reviewer-side PR follow-up.
