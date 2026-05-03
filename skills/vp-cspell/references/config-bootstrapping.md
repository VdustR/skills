# Config Bootstrapping

Interactive flow for setting up cspell in a project that has no existing configuration. Do not hardcode config templates — use `cspell init` CLI and Context7 for up-to-date options.

## Flow

### 1. Detect Project Context (auto)

Scan for project files to infer stack:

| File | Stack |
|------|-------|
| `package.json` | Node.js |
| `pyproject.toml` / `setup.py` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `*.sln` / `*.csproj` | .NET |

### 2. Verify cspell Availability

| Context | Verification Command |
|---------|---------------------|
| Node project with `package.json` | `npx cspell --version` |
| Non-Node project | `cspell --version` |

If not available, ask user: install globally (`npm i -g cspell`) or use alternative approach?

### 3. Ask User Preferences (interactive)

Present these questions to the user:

- **Config format**: Suggest based on project (YAML for general, JSON/JSONC for Node)
- **Locale**: Default `en`, suggest `en-US`/`en-GB` if clues exist
- **Extra dictionaries**: Suggest based on detected stack — use Context7 to look up available dictionaries via `npx cspell dictionaries` or docs

### 4. Run `cspell init`

```bash
# Actual flags determined by user answers + Context7 lookup
npx cspell init --format=jsonc --locale=en
```

> Dictionaries can be specified via `--dictionary` flag during init OR added to config post-init. Verify available dictionary names with `npx cspell dictionaries` first.

### 5. Post-init Adjustments (ask user for each)

- **Add `ignorePaths`?** — Suggest common patterns based on detected stack (e.g., `node_modules`, `dist`, `*.lock`)
- **Add `project-words.txt` dictionary pattern?** — Per official getting-started recommendation
- **Add npm script?** — `"spell": "cspell ."` or similar
- **Enable additional dictionaries in config?** — Based on Step 3 answers
- **Add CI integration?** — Offer options based on project setup:
  - npm script in CI pipeline (`npm run spell`)
  - GitHub Actions workflow step
  - Pre-commit hook (`husky` or `.pre-commit-config.yaml`)

### 6. Verify

```bash
npx cspell --no-progress <src-dir>
```

Scope to source directory (not repo root) and report results.

> **Context7 usage**: Query `/streetsidesoftware/cspell` for config schema, available dictionaries, init options. Fallback: [cspell.org](https://cspell.org/configuration/) or `cspell init --help`.

## Error Handling

| Error | Action |
|-------|--------|
| `cspell` CLI not installed | Ask user: install globally, add as devDependency, or skip |
| `cspell init` fails | Notify user; offer to create config manually using `cspell init --help` or [cspell.org](https://cspell.org/configuration/) |
| Context7 unavailable | Fall back to [cspell.org](https://cspell.org/configuration/) or `cspell init --help` |
