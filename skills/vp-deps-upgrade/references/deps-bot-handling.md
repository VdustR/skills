# Deps Bot PR Handling

## Bot Detection

| Bot | PR Title Pattern | Labels |
|-----|-----------------|--------|
| Dependabot | "Bump `<pkg>` from `<old>` to `<new>` in `<dir>`" | `dependencies` |
| Renovate | "Update dependency `<pkg>` to v`<ver>`" or "Update `<group>`" | `renovate` |
| GitHub Security | "Bump `<pkg>` from `<old>` to `<new>`" | `security` |

## Workflow: Handle Bot PR

1. **Parse PR**: `gh pr view <number> --json title,body,headRefName,labels`
2. **Extract**: package name, old version, new version from title/body
3. **Checkout**: `gh pr checkout <number>`
4. **Analyze**: what bot already changed (usually just version bump in lockfile/package.json)
5. **Run Phases 3-4**: breaking changes detection + test-first verification
6. **Apply**: additional code migrations the bot missed
7. **Push**: to same branch — bot PR auto-updates
8. **Verify**: `gh pr checks <number>` for CI status

## PR Parsing

### Dependabot

```bash
# Get PR details
gh pr view <number> --json title,body,headRefName

# Title format: "Bump <pkg> from <old> to <new> in <dir>"
# Extract with: parse title for package name and versions
# Branch format: dependabot/npm_and_yarn/<pkg>-<version>
```

### Renovate

```bash
# Title format varies:
# - "Update dependency <pkg> to v<ver>"
# - "Update <group-name>"
# - "Pin dependency <pkg> to <ver>"

# Body contains structured table with all dependencies
# Parse body for complete list when handling grouped PRs
```

## Grouped PRs (Renovate)

Renovate often groups multiple dependencies in one PR:

1. Parse PR body for the dependency table
2. Extract each dependency: name, old version, new version
3. Handle as batch upgrade — run breaking change analysis for each
4. **Cross-dependency conflict check** — run dry-run install (e.g., `npm install --dry-run`) to detect peer dep conflicts between the grouped dependencies before proceeding. If conflicts found, flag in Phase 5 plan and ask user
5. Apply code migrations for all dependencies
6. Push all changes to the same PR branch

## Security vs Feature Updates

| Type | Detection | Strategy |
|------|-----------|----------|
| Security (patch) | `security` label, or patch bump | Fast-track: minimal verification, prioritize quick merge |
| Feature (minor) | Minor version bump | Standard workflow with test-first |
| Feature (major) | Major version bump | Full workflow with comprehensive breaking change analysis |

**Security updates**: Still run Phase 4 (test-first) but use lighter verification. The priority is getting the fix merged quickly while ensuring nothing breaks.

## Auto-Mode

When user requests "auto-resolve" for a bot PR:

1. Follow full workflow (Phases 1-8)
2. If confidence index is 🟢 (80%+) and all tests pass → push automatically
3. If confidence index is 🟡 or 🔴 → present findings and ask for confirmation
4. Never auto-merge — always let CI run and user review

## Post-Push Verification

```bash
# Check CI status
gh pr checks <number>

# If CI fails, analyze:
gh pr checks <number> --json name,state,description

# View CI logs for specific check
gh run view <run-id> --log-failed
```
