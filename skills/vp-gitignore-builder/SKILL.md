---
name: vp-gitignore-builder
description: >-
  Build and merge repository .gitignore files or global gitignore files using
  github/gitignore templates with smart target separation. Use when the user asks
  to "create gitignore", "build .gitignore", "add gitignore templates", "set up
  gitignore", "update gitignore", "create global gitignore", or requests
  "/gitignore". Also trigger when observing projects without .gitignore, seeing
  untracked files like node_modules/, .env, __pycache__/, or *.log in git status,
  or after git init in a new repo.
  Boundary: not for .dockerignore or other non-git ignore files.
---

# Gitignore Builder

Build and merge repository `.gitignore` files or global gitignore files using
templates from [github/gitignore](https://github.com/github/gitignore) with
smart target separation.

## Workflow

### Step 1: Determine Target Mode and Location

Choose the target mode before detecting templates. Do not mix repo and global
ignore rules by default.

| Target Mode | Default Location | Use When |
|-------------|------------------|----------|
| Repo `.gitignore` | Nearest git repo root | User asks for `.gitignore`, project ignores, or the request is ambiguous while inside a repo |
| Global gitignore | `git config --global core.excludesFile` value, or `~/.gitignore` if unset | User explicitly asks for global/personal/system/editor/OS ignores, or confirms global mode when outside a repo |

Rules:

- Inside a repo, default to repo mode unless the user explicitly asks for
  global ignore.
- Do not infer global mode from OS/editor detection alone.
- Do not add `Global/...` templates to a repo `.gitignore` unless the user
  explicitly asks to commit those machine/editor/OS patterns to the repo.
- Do not add project templates like `Node` or `Python` to a global gitignore
  unless the user explicitly asks for project-language patterns globally.
- If no `.git` directory is found and the user did not explicitly ask for
  global ignore, ask whether they want a repo-local file in the current
  directory or a global gitignore.

### Step 2: Detect Project Type

**For repo `.gitignore` (project detection):**

| Indicator File | Template |
|----------------|----------|
| `package.json` | Node.gitignore |
| `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile` | Python.gitignore |
| `Cargo.toml` | Rust.gitignore |
| `go.mod` | Go.gitignore |
| `composer.json` | Composer.gitignore |
| `Gemfile` | Ruby.gitignore |
| `pom.xml` | Maven.gitignore |
| `build.gradle`, `build.gradle.kts` | Gradle.gitignore |
| `*.swift`, `Package.swift` | Swift.gitignore |
| `*.csproj`, `*.sln` | VisualStudio.gitignore |
| `CMakeLists.txt` | CMake.gitignore |
| `Makefile` with C/C++ files | C.gitignore or C++.gitignore |

Do not recommend OS/editor global templates for repo mode just because
`.vscode/`, `.idea/`, `.DS_Store`, or similar files are present. Instead, say
those are usually global ignore candidates and offer a separate global
gitignore only if the user wants it.

**For global gitignore (environment-aware detection):**

| Detection Method | Template (from Global/) |
|------------------|-------------------------|
| `uname` = Darwin | macOS.gitignore |
| `uname` = Linux | Linux.gitignore |
| Windows environment | Windows.gitignore |
| `.vscode/` exists or `code` command available | VisualStudioCode.gitignore |
| `.idea/` exists | JetBrains.gitignore |
| `vim` or `nvim` available | Vim.gitignore |
| `emacs` available | Emacs.gitignore |

**Template boundary rules:**

| Target Mode | Allowed By Default | Rejected By Default |
|-------------|--------------------|---------------------|
| Repo `.gitignore` | Top-level project templates such as `Node`, `Python`, `Rust` | `Global/...` templates such as `Global/macOS`, `Global/VisualStudioCode` |
| Global gitignore | `Global/...` templates | Top-level project templates such as `Node`, `Python`, `Rust` |

### Step 3: Present Recommendations

Show detected templates and ask for confirmation:

```
Detected project root: /path/to/repo
Found indicators: package.json, .vscode/

Recommended repo templates:
- Node.gitignore

Not adding to repo by default:
- Global/VisualStudioCode.gitignore (global editor ignore)

Proceed with these templates? [Y/n/edit]
```

Allow the user to confirm (Y), cancel (n), or edit the list (add/remove
templates).

### Step 4: Fetch and Merge

Use the bundled `scripts/merge-gitignore.sh` from this skill directory. It
fetches templates from github/gitignore, detects EOL inconsistencies,
concatenates templates with source attribution, and prints the merged result
to stdout for the preview/confirmation workflow.

```bash
# Repo .gitignore
scripts/merge-gitignore.sh --target repo Node Python

# Global gitignore
scripts/merge-gitignore.sh --target global Global/macOS Global/VisualStudioCode

# Escape hatches, only when explicitly requested by the user:
scripts/merge-gitignore.sh --target repo --allow-global-in-repo Global/macOS
scripts/merge-gitignore.sh --target global --allow-project-in-global Node
```

**Exit codes:**

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Network error (failed to fetch) |
| 2 | EOL conflict detected (info in stderr) |
| 3 | Template rejected for the selected target |

### Step 5: Handle EOL Conflicts

If the script detects mixed line endings (exit code 2), ask the user to
choose before proceeding:

```
⚠️ EOL inconsistency detected:
  - Node.gitignore: LF
  - VisualStudio.gitignore: CRLF
  - Existing .gitignore: LF

Choose unified format:
1. LF (Unix/macOS) - recommended
2. CRLF (Windows)
3. Keep as-is (no conversion)
```

### Step 6: Show Diff Preview

If the target file already exists, show a unified diff between the existing
content and the merged content (structured as in "Output Structure" below),
then ask `Confirm write? [Y/n]`.

### Step 7: Write File

After user confirms, write the file and report success:

```
✅ Created /path/to/repo/.gitignore (150 lines, 3 templates merged)
```

## Output Structure

Merged files have three sections, in order. Later entries have higher
priority because in gitignore the last matching pattern wins.

1. **Templates section** — github/gitignore templates wrapped in START/END
   markers (easiest to replace on update)
2. **Local files section** — project-specific ignores
3. **Overrides section** — custom overrides with highest priority

When merging with an existing `.gitignore`, preserve user-added content:
clearly project-specific ignores go to the Local files section; everything
else (including negations) goes to the Overrides section so its last-wins
behavior is unchanged:

```gitignore
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║                    github/gitignore templates                         ║
# ║           https://github.com/github/gitignore                         ║
# ╠═══════════════════════════════════════════════════════════════════════╣
# ║ START - Do not edit this section manually                             ║
# ╚═══════════════════════════════════════════════════════════════════════╝

# --------------------------------------------
# Source: Node.gitignore
# --------------------------------------------
node_modules/
...

# ╔═══════════════════════════════════════════════════════════════════════╗
# ║ END - github/gitignore templates                                      ║
# ╚═══════════════════════════════════════════════════════════════════════╝

# ============================================
# Local files (project-specific ignores)
# ============================================

secret-folder/
local-config.json

# ============================================
# Overrides (highest priority - last wins)
# ============================================

# User custom rules (preserved from original)
my-custom-rule.txt
!important.log
```

The START/END markers make it easy to identify template content for updates
(replace between the markers), attribute each rule to its source, and avoid
accidental edits to generated content.

## Important Notes

### Always Recommend *.local Pattern

At the end of every gitignore generation, suggest:

```
💡 Tip: Consider adding these patterns for local configuration files:
   *.local
   *.local.*

These patterns prevent accidentally committing local overrides.
```

### Gitignore Syntax Reminders

When discussing or modifying gitignore:

- **Negation**: The exclamation mark prefix negates a pattern, re-including
  previously excluded files. Order is important: the negation must come after
  the exclusion. Example: `!important.log` re-includes `important.log`.
- **Comments**: Lines starting with `#` are comments.
- **Directory**: Trailing `/` matches only directories (e.g., `build/`).
- **Wildcards**: `*` matches anything except `/`, `**` matches everything
  including `/`.

## Reference Files

- **[examples.md](references/examples.md)** - Detailed workflow examples for
  various scenarios
