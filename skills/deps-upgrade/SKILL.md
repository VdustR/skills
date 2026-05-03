---
name: deps-upgrade
description: >-
  Upgrade dependencies with breaking change detection and migration planning.
  Use when asked to "upgrade dependencies", "update packages", "bump dependencies",
  "bump <package> to <version>", "update <package> to version <version>",
  "handle dependabot PR", "handle renovate PR", "check for breaking changes",
  "upgrade <package> to <version>", "check outdated dependencies", "scan for updates",
  or when reviewing dependency bot PRs (dependabot, renovate, GitHub Actions),
  or when addressing security alerts, CVE notices, or vulnerability patches.
  Also trigger when the user mentions outdated packages, version bumps, or
  package manager update commands.
  Boundary: for version bumps within the same library. Use deps-migrate when
  replacing one library with another.
---

# Dependency Upgrade

Upgrade dependencies with breaking change detection, test-first verification, and repo convention compliance.

## Quick Start

> Upgrade react to v19

> Handle the dependabot PR #42

> Check for outdated dependencies

> Auto-resolve the renovate PR https://github.com/owner/repo/pull/99

## Workflow

> **Non-linear execution**: Phases are numbered for reference, not strict order. If findings in any phase invalidate earlier assumptions, restart from the affected phase.

### Phase 1: Environment Analysis

- Detect package manager from lockfile (see [package-managers.md](references/package-managers.md))
- Detect monorepo structure (workspaces, pnpm-workspace.yaml)
- Detect CI, hooks, changeset config (see [repo-conventions.md](references/repo-conventions.md))

### Phase 2: Identify Upgrade Target

Three entry paths:
- **A) User specifies** package + version
- **B) Bot PR** → parse from PR title/body/diff (see [deps-bot-handling.md](references/deps-bot-handling.md))
- **C) Bulk scan** → run outdated command, present results

Determine update type:

| Type | Detection | Risk |
|------|-----------|------|
| Lockfile-only | New version within existing range | Low |
| Range update (minor) | Range change required, minor bump | Medium |
| Range update (major) | Range change required, major bump | High |

### Phase 3: Documentation & Breaking Changes Analysis

Consult all sources (use subagents for parallel lookup when possible, not a fallback chain):
1. **Context7** → `resolve-library-id` + `query-docs` for migration guides (see [context7-integration.md](references/context7-integration.md))
2. **Changelog/releases** → Parse CHANGELOG.md + `gh api repos/{owner}/{repo}/releases`
3. **Code changes** → Analyze source code diffs for hidden breaking changes

Combine into a breaking changes report: High/Medium/Low impact, affected files (grep for deprecated APIs), migration action for each change. **Conflict resolution**: If sources disagree, use the most conservative (highest risk) conclusion and flag the discrepancy in the report.

### Phase 3.5: Official Tools & Compat Layer Detection

Check for official/community migration tools **before** writing custom migrations:

| Source | What to look for | Example |
|--------|-----------------|---------|
| Migration guide | Codemod CLI commands | `npx react-codemod rename-unsafe-lifecycles` |
| npm registry | `*-codemod` packages | `@next/codemod`, `react-codemod` |
| Target docs | Compat layer | `es-toolkit/compat` (lodash compatible) |
| Framework CLI | Auto-migration scripts | `npx @angular/cli update` |

Decision flow:
- **Codemod exists** → run codemod first, handle remaining manually
- **Compat layer available** → ask user: gradual (compat) or full replacement?
- **Neither** → proceed to Phase 4 (manual migration)

### Phase 3.7: Related Package Detection

Detect packages that must be co-upgraded:

| Pattern | Detection | Example |
|---------|-----------|---------|
| `@types/` packages | Check devDeps for `@types/<pkg>` | react → @types/react |
| Scoped `@types/` | `@scope/pkg` → `@types/scope__pkg` | @babel/core → @types/babel__core |
| Peer dep ecosystem | Parse `peerDependencies` | react → react-dom |
| Peer dep types | For each peer dep found above, also check for `@types/<peer>` | react-dom → @types/react-dom |
| Framework integration | Known ecosystem groups | next requires compatible react |
| Workspace refs | `workspace:*` — skip (local) | — |

Present related packages to user and ask whether to include in upgrade plan.

### Phase 4: Test-First Verification

Validate the migration approach **before** batch execution.

**Quick feasibility check**: If migration is config-only (e.g., ESLint flat config) or requires extensive project context, skip /tmp and go directly to subagent review.

If /tmp verification is feasible:
1. **Scan all usage** — grep/glob for all imports, API calls, type references
2. **Write test diffs in /tmp** — create isolated test files:
   ```
   /tmp/deps-shift-verify-<package>-<timestamp>/
   ├── package.json   # Minimal deps (target package only)
   ├── tsconfig.json  # Copied from project, paths/aliases adjusted for /tmp
   ├── original/      # Copy of affected code snippets
   ├── migrated/      # Proposed migration applied
   └── test-runner.sh # Must run tsc --noEmit at minimum, must NOT be just exit 0
   ```
   **Environment setup**: Create a minimal `package.json`, install only the target package version fresh. Copy project's `tsconfig.json`; remove `paths`, `baseUrl`, and `references` fields that point to project-specific locations — /tmp resolves modules through its own `node_modules` only. Never mutate the project's actual `node_modules`.
3. **Run verification** — type check + unit tests on migrated snippets
4. **Pass** → proceed to Phase 5
5. **Fail** → iterate (max 3 attempts), then present failure analysis to user

**Fallback**: When tests can't be written → subagent 3-pass review loop:
- Pass 1 (Direct): correctness — syntax, imports, types
- Pass 2 (Best Practice): idiomatic usage, recommended patterns
- Pass 3 (Critical Think): edge cases, hidden behavioral changes
- Fix + loop until all passes clean

### Phase 5: Migration Plan & Confidence Index

Present structured plan with [confidence index](references/confidence-index.md):
- Steps to execute (informed by Phase 4 results)
- Estimated impact (files, breaking changes count)
- Confidence index with factor breakdown and boost options
- Repo convention actions (changeset, commit format)

**Always get user confirmation before executing.**

### Phase 6: Execute Migration

1. Update dependency versions via package manager (including related packages from Phase 3.7)
2. Install (update lockfile)
3. **Check for peer dependency conflicts** — if install warns, present options in priority order: (a) upgrade conflicting package — preferred, (b) abort — if no compatible version exists yet, (c) `--legacy-peer-deps` — last resort; warn user this bypasses peer validation and may cause runtime issues
4. Apply code migrations (using verified approach from Phase 4)
5. For bot PRs: checkout PR branch, apply migrations, push
6. Clean up /tmp verification files

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
- All pass → report success
- Failures → analyze if upgrade-related, attempt fix, present remaining to user
- Bot PR → push + check CI via `gh pr checks`

## Guidelines

### DO

- **Check for official codemods first** — search npm registry and migration guides before writing custom transforms
- **Offer compat layers when available** — ask user preference (gradual vs full), never assume
- **Test migration approach in /tmp first** — validate on representative samples before batch execution
- **Use Context7 + changelog in parallel** — combine multiple doc sources for complete picture
- **Analyze code changes for hidden breaks** — don't rely solely on changelogs; grep for deprecated API usage
- **Always confirm before execution** — present migration plan, get user approval
- **Follow repo conventions** — detect and comply with changesets, commit format, CI checks

### DON'T

- **Skip codemod detection** — always check for official tools first
- **Skip test-first verification** — never execute batch migration without validating approach
- **Auto-merge without checking** — even if CI passes, verify breaking changes are addressed
- **Assume changelog is complete** — hidden breaking changes exist; analyze code diffs too
- **Force upgrade when tests fail** — present failure analysis, let user decide
- **Assume compat layer preference** — always ask user (gradual vs clean break)

## Error Handling

| Error | Action |
|-------|--------|
| Package manager command fails | Check lockfile integrity, suggest `rm -rf node_modules && install` |
| Changelog/releases API 404 | Fall back to source code diff analysis |
| Codemod crashes partway | Report progress, show which files were transformed, suggest manual completion |
| Context7 MCP tool not found | Suggest installation, continue with changelog + releases + code analysis |
| Monorepo workspace resolution fails | Ask user to specify target package(s) |
| Tests still fail after 3 iterations | Present failure analysis, ask user how to proceed |
| /tmp write fails | Fall back to subagent review |

## Reference Files

- [package-managers.md](references/package-managers.md) — Detection matrix and commands
- [repo-conventions.md](references/repo-conventions.md) — Convention detection and compliance
- [confidence-index.md](references/confidence-index.md) — Confidence index specification
- [context7-integration.md](references/context7-integration.md) — Context7 MCP detection and usage
- [deps-bot-handling.md](references/deps-bot-handling.md) — Dependabot and Renovate PR handling

## Notes

- **Requirements**: `gh` CLI (for bot PRs, releases API), package manager CLI
- **Context7**: Optional but recommended; install through the current agent's MCP or tool setup flow.
- **Supported ecosystems**: npm, pnpm, yarn, bun, cargo, pip/uv/poetry, go, bundler, composer
- **Limitations**: Private registry auth requires manual setup; no auto-handling of 2FA prompts
- **Monorepos**: Detected automatically, but user may need to specify target package for large workspaces
- **Boundary**: When a major upgrade (e.g., React 18→19) requires API migration, this skill handles it. Use `deps-migrate` only when the primary intent is replacing one library with another.
