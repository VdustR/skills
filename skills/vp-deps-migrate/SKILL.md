---
name: vp-deps-migrate
description: >-
  Replace one library with another (e.g., moment.js to date-fns, webpack to vite),
  or migrate deprecated API patterns within the same library (e.g., React 19 forwardRef
  removal, Vue 3 Options API to Composition API). Use when asked to "replace X with Y",
  "migrate from X to Y", "switch from X to Y", "swap X for Y", "convert from X to Y",
  "port from X to Y", "remove deprecated forwardRef", "migrate to new API",
  or when planning library replacement or API migration. Also trigger when the user
  mentions switching libraries, finding alternatives, or removing deprecated patterns.
  Boundary: for replacing libraries or migrating API patterns. Use vp-deps-upgrade for
  version bumps within the same library.
---

# Dependency Migration

Replace one library with another, or migrate deprecated API patterns within the same library.

## Quick Start

> Replace moment.js with date-fns

> Migrate from webpack to vite

> Remove deprecated forwardRef usage (React 19)

> Switch from lodash to es-toolkit

> Migrate Vue Options API to Composition API

## Scope

| Type | Example | Trigger |
|------|---------|---------|
| **Library replacement** | moment.js → date-fns | "replace X with Y" |
| **API pattern migration** | React 19 forwardRef removal | "remove deprecated X", "migrate to new Y API" |

Both types follow the same test-first workflow below.

## Workflow

> **Non-linear execution**: Phases are numbered for reference, not strict order. If findings in any phase invalidate earlier assumptions, restart from the affected phase.

### Phase 1: Environment Analysis

- Detect package manager from lockfile (see [package-managers.md](references/package-managers.md))
- Detect monorepo structure
- Detect CI, hooks, changeset config (see [repo-conventions.md](references/repo-conventions.md))
- Detect test infrastructure (test runner, tsconfig.json, linter)

### Phase 2: Identify Migration Target

**For library replacement:**
- Parse source library (to remove) and target library (to add)
- Detect current usage scope: grep for imports/requires of source library
- Count affected files and usage patterns

**For API pattern migration:**
- Identify deprecated/removed API pattern
- Scan all occurrences in codebase
- Identify the replacement pattern from docs

### Phase 3: Documentation & Compatibility Analysis

Consult all sources (use subagents for parallel lookup when possible; see [context7-integration.md](references/context7-integration.md)):
1. **Context7** → Query both libraries for API comparison, migration guides
2. **Community resources** → Search for known migration guides
3. **Code analysis** → Map source API usage to target equivalents

**Conflict resolution**: If sources disagree on API equivalence or behavior, use the most conservative conclusion and flag the discrepancy.

Build an API mapping table:

| Source | Target | Notes |
|--------|--------|-------|
| `moment().format('YYYY')` | `format(date, 'yyyy')` | Different format tokens |
| `React.forwardRef((props, ref) => ...)` | `function Component({ ref, ...props })` | ref is now a regular prop |

See [migration-patterns.md](references/migration-patterns.md) for methodology and common patterns.

### Phase 3.5: Official Tools & Compat Layer Detection

Check for official/community migration tools **before** writing custom migrations:

**For library replacement:**
- **Compat layer** — e.g., `es-toolkit/compat` for lodash
  - Ask user: "Use compat for gradual migration, or full replacement?"
  - Compat-first: swap import paths → verify → optionally migrate to native API later
- **Codemods** — e.g., `jscodeshift` transforms from library authors

**For API pattern migration:**
- **Official codemods** — e.g., `npx react-codemod rename-unsafe-lifecycles`
- **Framework CLI migration** — e.g., `npx @angular/cli update`, `npx storybook automigrate`

Decision flow:
- **Codemod exists** → run codemod first, handle remaining manually
- **Compat layer available** → ask user preference (gradual vs full)
- **Neither** → proceed to Phase 4

### Phase 3.7: Related Package Detection

**For library replacement:**
- Check if `@types/<source>` exists → should be removed (scoped: `@scope/pkg` → `@types/scope__pkg`)
- Check if target requires `@types/<target>` or companion packages
- For each related package found, also check for its `@types/` counterpart (e.g., react-dom → @types/react-dom)
- Check for related adapters or integrations referencing the source library

**For API pattern migration:**
- Usually no related packages needed, but check for community wrappers

Present findings and ask user whether to include.

### Phase 4: Test-First Verification

Validate the migration approach **before** batch execution.

1. **Scan all usage** — comprehensive grep for all patterns to migrate
2. **Write test diffs in /tmp** — pick representative examples (not all files):
   - Select 2-3 diverse usage patterns (simple, complex, edge case). If more than 10 distinct patterns exist, sample at least 30% and reflect actual coverage in the confidence index
   - Create migrated versions in /tmp
   - Run type check + tests against migrated snippets
   ```
   /tmp/deps-shift-verify-<package>-<timestamp>/
   ├── package.json   # Minimal deps (target package only)
   ├── tsconfig.json  # Copied from project, paths/aliases adjusted for /tmp
   ├── original/      # Copy of affected code snippets
   ├── migrated/      # Proposed migration applied
   └── test-runner.sh # Must run tsc --noEmit at minimum, must NOT be just exit 0
   ```
   **Environment setup**: Create a minimal `package.json`, install only the target package version fresh. Copy project's `tsconfig.json`; remove `paths`, `baseUrl`, and `references` fields that point to project-specific locations — /tmp resolves modules through its own `node_modules` only. Never mutate the project's actual `node_modules`.
3. **Verify approach works** before committing to full migration
4. **Pass** → proceed to Phase 5
5. **Fail** → iterate (max 3 attempts), then present failure analysis

**Fallback**: When tests can't be written → subagent 3-pass review loop:
- Pass 1 (Direct): correctness of API mapping, import resolution
- Pass 2 (Best Practice): idiomatic target library usage
- Pass 3 (Critical Think): edge cases, behavioral differences, risks
- Fix + loop until all passes clean

### Phase 5: Migration Plan & Confidence Index

Present structured plan with [confidence index](references/confidence-index.md):
- File-by-file change summary
- API mapping table (validated by Phase 4)
- Potential issues / no direct equivalent
- Confidence index with factor breakdown and boost options
- Repo convention actions

**Always get user confirmation before executing.**

### Phase 6: Execute Migration

1. Install target library (if library replacement)
2. Apply transformations file by file using validated mapping
3. **Checkpoint**: Verify all files have been transformed — grep for remaining source library imports. If any remain, do NOT proceed to removal
4. **Check for peer dependency conflicts** — present options if found
5. Clean up unused imports/types
6. Clean up /tmp verification files

**Note**: Source library removal happens in Phase 8 **after** final verification passes. Do NOT remove it here — keeping it installed during verification ensures rollback is possible if issues are found.

### Phase 7: Repo Convention Compliance

Detect and follow project conventions (see [repo-conventions.md](references/repo-conventions.md)):
- Changesets → create changeset file
- Conventional commits → follow format
- CI checks → run matching local commands
- Pre-commit hooks → ensure hooks pass
- Custom scripts → run test, lint, typecheck

### Phase 8: Final Verification

1. Type check → 2. Lint → 3. Test suite → 4. Build
5. For complex migrations: run subagent Pass 3 (Critical Think) as final quality gate
6. **After all checks pass**: Remove source library from `package.json` (if library replacement). If source is a transitive dep of other packages, it stays in lockfile — only remove the direct dependency
7. Run install to update lockfile after removal
- All pass → report success
- Failures → analyze if migration-related, attempt fix, present remaining to user (source library is still installed, so rollback is straightforward)

## Guidelines

### DO

- **Build a complete API mapping table** — map every source API to target equivalent before migrating
- **Check for official codemods first** — search npm registry and migration guides before writing custom transforms
- **Offer compat layers when available** — ask user preference (gradual vs full), never assume
- **Test migration approach in /tmp first** — validate on representative samples before batch
- **Use Context7 for both libraries** — query source and target library docs in parallel
- **Handle "no equivalent" cases** — ask user, implement custom wrapper, or document manual step
- **Always confirm before execution** — present migration plan, get user approval
- **Follow repo conventions** — detect and comply with changesets, commit format, CI checks

### DON'T

- **Skip codemod detection** — always check for official tools first
- **Skip test-first verification** — never execute batch migration without validating approach
- **Remove source library prematurely** — verify all usage migrated before removing
- **Assume API equivalence** — subtle behavioral differences exist (async vs sync, shallow vs deep copy)
- **Force migration when tests fail** — present failure analysis, let user decide
- **Assume compat layer preference** — always ask user (gradual vs clean break)
- **Migrate test files last** — migrate tests alongside implementation to catch issues early

## Error Handling

| Error | Action |
|-------|--------|
| No direct API equivalent found | Document gap, ask user for custom wrapper or alternative approach |
| Codemod crashes partway | Report progress, show transformed files, suggest manual completion |
| Context7 MCP tool not found | Suggest installation, continue with community guides + code analysis |
| Type errors after migration | Analyze if source/target type mismatch, suggest type assertion or wrapper |
| Behavioral difference detected | Flag to user with before/after examples, get approval |
| Tests still fail after 3 iterations | Present failure analysis, ask user how to proceed |
| /tmp write fails | Fall back to subagent review |

## Reference Files

- [package-managers.md](references/package-managers.md) — Detection matrix and commands
- [repo-conventions.md](references/repo-conventions.md) — Convention detection and compliance
- [confidence-index.md](references/confidence-index.md) — Confidence index specification
- [context7-integration.md](references/context7-integration.md) — Context7 MCP detection and usage
- [migration-patterns.md](references/migration-patterns.md) — Methodology and common patterns

## Notes

- **Requirements**: `gh` CLI (for releases API), package manager CLI
- **Context7**: Optional but recommended; install through the current agent's MCP or tool setup flow.
- **Supported ecosystems**: npm, pnpm, yarn, bun, cargo, pip/uv/poetry, go, bundler, composer
- **Limitations**: Private registry auth requires manual setup; no auto-handling of 2FA prompts
- **Monorepos**: Detected automatically, but user may need to specify target package for large workspaces
- **Boundary**: Use this skill when replacing one library with another or migrating API patterns. For version bumps (A v1 → A v2), use `vp-deps-upgrade` instead.
