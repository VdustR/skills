# Gitignore Builder Examples

## Example 1: New Node.js Project

```
User: /gitignore

Agent: Detected project root: /Users/dev/my-app
        Found: package.json

        Recommended repo templates:
        ✓ Node.gitignore

        Proceed with these templates? [Y/n/edit]

User: Y

Agent: Fetching Node.gitignore from github/gitignore...

        📄 Will write to: /Users/dev/my-app/.gitignore

        Preview (150 lines):
        # ╔═══════════════════════════════════════════════════════════════════════╗
        # ║ START - github/gitignore templates                                    ║
        # ╚═══════════════════════════════════════════════════════════════════════╝

        # --------------------------------------------
        # Source: Node.gitignore
        # --------------------------------------------

        # Logs
        logs
        *.log
        npm-debug.log*
        ...

        # ╔═══════════════════════════════════════════════════════════════════════╗
        # ║ END - github/gitignore templates                                      ║
        # ╚═══════════════════════════════════════════════════════════════════════╝

        # ============================================
        # Local files (project-specific ignores)
        # ============================================

        # Add project-specific files to ignore here

        # ============================================
        # Overrides (highest priority - last wins)
        # ============================================

        # Local configuration files
        *.local
        *.local.*

        Confirm write? [Y/n]

User: Y

Agent: ✅ Created /Users/dev/my-app/.gitignore
```

## Example 2: Global Gitignore Request Inside a Repo

```
User: Create a global gitignore for me

Agent: ⚠️ You're currently inside a git repository (/Users/dev/my-app).
        Global gitignore is separate from the repo .gitignore.

        Options:
        1. Create/update ~/.gitignore (recommended)
        2. Switch to repo .gitignore instead

        Which do you prefer?

User: 1

Agent: Detecting environment...
        - OS: macOS (Darwin)
        - Editors: VS Code, Vim

        Recommended templates:
        ✓ Global/macOS.gitignore
        ✓ Global/VisualStudioCode.gitignore
        ✓ Global/Vim.gitignore

        Proceed? [Y/n/edit]
```

## Example 3: Repo Gitignore Does Not Include Global Templates

```
User: /gitignore

Agent: Detected project root: /Users/dev/my-app
        Found: package.json, .vscode/

        Recommended repo templates:
        ✓ Node.gitignore

        Not adding to repo by default:
        - Global/VisualStudioCode.gitignore (editor preference; use global gitignore)

        Proceed with repo templates? [Y/n/edit]
```

## Example 4: Merging with Existing Gitignore

```
User: Add Python ignores to my gitignore

Agent: Found existing .gitignore at /Users/dev/my-app/.gitignore (15 lines)

        Fetching Python.gitignore...

        📄 Merge preview:

        --- Existing (15 lines)
        +++ Merged (180 lines)

        @@ -1,15 +1,180 @@
        +# ╔═══════════════════════════════════════════════════════════════════════╗
        +# ║ START - github/gitignore templates                                    ║
        +# ╚═══════════════════════════════════════════════════════════════════════╝
        +
        +# --------------------------------------------
        +# Source: Python.gitignore
        +# --------------------------------------------
        +
        +# Byte-compiled / optimized / DLL files
        +__pycache__/
        +*.py[cod]
        +...
        +
        +# ╔═══════════════════════════════════════════════════════════════════════╗
        +# ║ END - github/gitignore templates                                      ║
        +# ╚═══════════════════════════════════════════════════════════════════════╝
        +
        +# ============================================
        +# Local files (project-specific ignores)
        +# ============================================
        +
         .env
         secrets/
        +
        +# ============================================
        +# Overrides (highest priority - last wins)
        +# ============================================
        +
        +# User custom rules (preserved from original)

        Confirm merge? [Y/n]
```

## Example 5: Auto-trigger on Suspicious Files

```
User: git status

Agent: [observes output showing node_modules/ and .env in untracked files]

        ⚠️ Noticed potentially sensitive/generated files in git status:
        - node_modules/ (should typically be ignored)
        - .env (may contain secrets)

        Would you like me to create or update .gitignore to exclude these?
```
