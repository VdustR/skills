---
name: vp-deps-migrate
description: >-
  Replace a library or migrate deprecated API patterns. Use when switching
  dependencies, frameworks, build tools, or APIs. Boundary: use
  vp-deps-upgrade for a version change within the same dependency.
---

# Dependency Migration

Map behavior and ownership before changing imports. A successful migration
preserves required runtime behavior, lifecycle, data compatibility, and
operational expectations—not merely type-checking.

## Workflow

1. Identify repository constraints, package ownership, runtime targets, and
   relevant tests.
2. Classify usages by behavior and lifecycle instead of applying blind
   replacement.
3. Compare current official guidance, compatibility layers, and related package
   requirements.
4. Define success evidence and material risks before editing.
5. Migrate in reviewable slices, removing obsolete code introduced by the old
   dependency.
6. Verify focused behavior first, then broader integration and repository
   checks.

Read only the relevant reference:

- `references/migration-patterns.md`
- `references/package-managers.md`
- `references/repo-conventions.md`
- `references/context7-integration.md`
- `references/confidence-index.md`
