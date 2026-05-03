<!-- Shared: vp-deps-upgrade (source of truth) / vp-deps-migrate (copy). Keep in sync. -->

# Package Manager Detection & Commands

## Detection Matrix

| Indicator File | Package Manager | Lockfile | Notes |
|---------------|----------------|----------|-------|
| `package-lock.json` | npm | `package-lock.json` | Default for Node.js |
| `pnpm-lock.yaml` | pnpm | `pnpm-lock.yaml` | Fast, strict |
| `yarn.lock` + `.yarnrc.yml` | yarn (berry) | `yarn.lock` | Yarn 2+ (PnP or node_modules) |
| `yarn.lock` (no `.yarnrc.yml`) | yarn (classic) | `yarn.lock` | Yarn 1.x |
| `bun.lockb` or `bun.lock` | bun | `bun.lockb` / `bun.lock` | Fast runtime + PM |
| `Cargo.lock` | cargo | `Cargo.lock` | Rust |
| `requirements.txt` | pip | — | Python (basic) |
| `uv.lock` | uv | `uv.lock` | Python (fast) |
| `poetry.lock` | poetry | `poetry.lock` | Python (managed) |
| `go.sum` | go | `go.sum` | Go modules |
| `Gemfile.lock` | bundler | `Gemfile.lock` | Ruby |
| `composer.lock` | composer | `composer.lock` | PHP |

**Priority**: If multiple indicators exist, prefer: bun > pnpm > yarn > npm (for JS ecosystem).

## Command Reference

| Manager | Outdated | Upgrade Single | Upgrade All | Install | Add Dev |
|---------|----------|---------------|-------------|---------|---------|
| npm | `npm outdated` | `npm install <pkg>@<ver>` | `npm update` | `npm install` | `npm install -D <pkg>` |
| pnpm | `pnpm outdated` | `pnpm update <pkg>@<ver>` | `pnpm update` | `pnpm install` | `pnpm add -D <pkg>` |
| yarn classic | `yarn outdated` | `yarn upgrade <pkg>@<ver>` | `yarn upgrade` | `yarn install` | `yarn add -D <pkg>` |
| yarn berry | `yarn outdated` | `yarn up <pkg>@<ver>` | `yarn up` | `yarn install` | `yarn add -D <pkg>` |
| bun | `bun outdated` | `bun update <pkg>@<ver>` | `bun update` | `bun install` | `bun add -D <pkg>` |
| cargo | `cargo outdated` (requires `cargo-outdated`) | Edit `Cargo.toml` + `cargo update` | `cargo update` | `cargo build` | — |
| pip | `pip list --outdated` | `pip install <pkg>==<ver>` | `pip install -U -r requirements.txt` | `pip install -r requirements.txt` | — |
| uv | `uv pip list --outdated` | `uv add <pkg>==<ver>` | `uv lock --upgrade` | `uv sync` | `uv add --dev <pkg>` |
| poetry | `poetry show -o` | `poetry add <pkg>@<ver>` | `poetry update` | `poetry install` | `poetry add -D <pkg>` |
| go | `go list -m -u all` | `go get <pkg>@<ver>` | `go get -u ./...` | `go mod download` | — |
| bundler | `bundle outdated` | `bundle update <gem>` | `bundle update` | `bundle install` | — |
| composer | `composer outdated` | `composer require <pkg>:<ver>` | `composer update` | `composer install` | `composer require --dev <pkg>` |

## Monorepo Detection

| Indicator | Type | Notes |
|-----------|------|-------|
| `pnpm-workspace.yaml` | pnpm workspace | Run at workspace root, filter with `--filter` |
| `package.json` "workspaces" | npm/yarn workspace | `yarn workspace <pkg> add <dep>` |
| `Cargo.toml` `[workspace]` | cargo workspace | `cargo update -p <crate>` |
| `lerna.json` | lerna | Usually wraps npm/yarn workspaces |
| `nx.json` | Nx | May use any underlying PM |
| `turbo.json` | Turborepo | Usually wraps npm/pnpm/yarn workspaces |

**Handling**: Run commands at workspace root. If user specifies a package, filter by package name. For large workspaces, ask user to specify target package(s).

## Edge Cases

- **Private registries**: Check `.npmrc`, `.yarnrc.yml` for registry config; may need auth tokens
- **Workspace protocol**: `workspace:*` / `workspace:^` are local refs — skip during upgrade, they resolve automatically
- **Peer dependency conflicts**: `npm install` may fail; offer `--legacy-peer-deps` or suggest co-upgrading the conflicting package
- **Lockfile-only updates**: When new version is within existing `package.json` range, only lockfile changes — no breaking changes expected
- **Overrides/resolutions**: Check `package.json` "overrides" (npm) / "resolutions" (yarn) for forced versions that may conflict
