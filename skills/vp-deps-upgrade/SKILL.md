---
name: vp-deps-upgrade
description: >-
  Upgrade dependencies with breaking-change and compatibility analysis. Use for
  version bumps, outdated packages, security updates, and dependency-bot PRs.
  Boundary: use vp-deps-migrate when replacing a library or API family.
---

# Dependency Upgrade

Treat the lockfile, manifest, release notes, runtime support, and repository
tests as one compatibility surface.

## Workflow

1. Identify the requested package, current and target versions, dependency
   ownership, and repository toolchain.
2. Read current primary-source release and migration guidance.
3. Check peer, transitive, runtime, generated-code, and related-package impact.
4. Separate mechanical version changes from required source migrations.
5. Make the smallest coherent update with the repository package manager.
6. Verify focused behavior, lockfile integrity, build and type checks, then
   broader checks proportional to risk.

For dependency-bot PRs, independently verify the current head and diff rather
than trusting the bot summary. Read only the relevant reference:

- `references/package-managers.md`
- `references/repo-conventions.md`
- `references/context7-integration.md`
- `references/confidence-index.md`
- `references/deps-bot-handling.md`

## Related skills

- [`vp-deps-migrate`](https://github.com/VdustR/skills/tree/main/skills/vp-deps-migrate)
  when the work replaces the dependency or API family.
- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  when a dependency-bot PR has actionable review feedback.
