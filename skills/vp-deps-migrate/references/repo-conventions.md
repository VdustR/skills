<!-- Shared: vp-deps-upgrade (source of truth) / vp-deps-migrate (copy). Keep in sync. -->

# Repo Convention Detection & Compliance

## Changeset Detection

**Detect**: `.changeset/config.json` exists

**Action**: Create `.changeset/<descriptive-name>.md` with bump type

**Format**:
```markdown
---
"<package-name>": patch|minor|major
---

<Description of the change>
```

**Bump type mapping** (for dependency changes):
| Change | Bump |
|--------|------|
| Lockfile-only update | patch |
| Minor dependency upgrade | patch |
| Major dependency upgrade (no breaking user-facing changes) | patch |
| Major upgrade with user-facing breaking changes | minor or major (ask user) |
| Library replacement | minor or major (ask user) |

## Conventional Commits Detection

**Detect**: `commitlint.config.*`, `.commitlintrc.*`, `commitlint` in package.json, or `@commitlint/` in devDependencies

**Parse**: Extract allowed types and scopes from config

**Dependency change format**:
| Change | Commit Format |
|--------|--------------|
| Patch/lockfile update | `fix(deps): upgrade <pkg> to <ver>` |
| Minor version upgrade | `feat(deps): upgrade <pkg> to <ver>` |
| Major version upgrade | `feat(deps)!: upgrade <pkg> to <ver>` |
| Library replacement | `refactor(deps): replace <old> with <new>` |
| API pattern migration | `refactor: migrate <pattern> to <new-pattern>` |

**Fallback**: If no commitlint config detected, use conventional commit format as a sensible default but don't enforce it.

## CI Detection

| Config File | CI System | Local Equivalent |
|-------------|-----------|-----------------|
| `.github/workflows/*.yml` | GitHub Actions | Parse `run:` steps for test/lint/build commands |
| `.gitlab-ci.yml` | GitLab CI | Parse `script:` in stages |
| `.circleci/config.yml` | CircleCI | Parse `steps:` with `run:` |
| `Jenkinsfile` | Jenkins | Parse `sh` commands |
| `.travis.yml` | Travis CI | Parse `script:` |
| `bitbucket-pipelines.yml` | Bitbucket | Parse `script:` in steps |

**Strategy**: Extract test/lint/typecheck/build commands from CI config and run them locally before committing.

## Pre-commit Hooks

| Config File | Hook Manager | Verify Command |
|-------------|-------------|----------------|
| `.husky/` | Husky | Runs automatically on commit |
| `.lefthook.yml` | Lefthook | `lefthook run pre-commit` |
| `.pre-commit-config.yaml` | pre-commit | `pre-commit run --all-files` |
| `.lintstagedrc*` | lint-staged | Usually paired with Husky |

**Note**: Don't bypass hooks with `--no-verify`. If hooks fail, fix the issue.

## Custom Scripts (package.json)

Check `package.json` "scripts" for these (in priority order):

| Priority | Script Name Patterns | Purpose |
|----------|---------------------|---------|
| 1 | `typecheck`, `type-check`, `tsc` | Type checking |
| 2 | `lint`, `eslint`, `biome check` | Linting |
| 3 | `test`, `vitest`, `jest` | Test suite |
| 4 | `build`, `compile` | Build verification |

**Run all detected scripts** after migration to verify nothing is broken.

## Compliance Workflow

1. **Detect** all conventions present in the repo
2. **Apply** each detected convention after migration
3. **Verify** all checks pass
4. **Report** any failures to user before committing
