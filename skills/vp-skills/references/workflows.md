# vp-skills Workflows

Use `npx -y skills@1.5.3` for every command unless the user explicitly asks for
latest behavior.

## Install

Default personal install:

```bash
npx -y skills@1.5.3 add <source> --skill <skill-name> -g --agent '*' -y
```

Useful variants:

```bash
# Preview source contents before installing.
npx -y skills@1.5.3 add <source> --list

# Install all skills from a source to all supported agents.
npx -y skills@1.5.3 add <source> -g --all

# Install to one agent only when requested.
npx -y skills@1.5.3 add <source> --skill <skill-name> -g --agent codex -y

# Install project-local skills.
npx -y skills@1.5.3 add <source> --skill <skill-name> --agent '*' -y

# Use copies instead of symlinks when symlinks are undesirable.
npx -y skills@1.5.3 add <source> --skill <skill-name> -g --agent '*' --copy -y
```

## Update

`update`, `upgrade`, and `check` are write-capable in `skills@1.5.3`; do not
present `check` as a dry-run.

```bash
# Update all global tracked skills.
npx -y skills@1.5.3 update -g

# Update selected global skills.
npx -y skills@1.5.3 update vp-skills impeccable -g

# Update project-local skills.
npx -y skills@1.5.3 update -p

# Non-interactive auto-scope: project if current directory has project skills,
# otherwise global.
npx -y skills@1.5.3 update -y
```

## Remove

Use explicit skill names. Avoid `--all` unless the user asks to remove
everything.

```bash
# Remove selected skills globally from every supported agent.
npx -y skills@1.5.3 remove <skill-name> <another-skill> -g --agent '*' -y

# Remove from one agent only when requested.
npx -y skills@1.5.3 remove <skill-name> -g --agent codex -y

# Interactive remove from global scope.
npx -y skills@1.5.3 remove -g
```

## Query

```bash
# Installed project skills.
npx -y skills@1.5.3 list

# Installed global skills.
npx -y skills@1.5.3 list -g

# Machine-readable inventory.
npx -y skills@1.5.3 list -g --json

# Filter by agent.
npx -y skills@1.5.3 list -g --agent codex

# Search skills.sh.
npx -y skills@1.5.3 find <query>

# Inspect a repository source.
npx -y skills@1.5.3 add <source> --list
```

## Agent Inventory Tables

Use the bundled helper when the user wants to see which agents have each skill.
It reads `skills list --json` and does not modify skill installs. For global
skills whose canonical path is `~/.agents/skills/<skill>`, the helper also
counts the universal agents that share that directory because `skills@1.5.3`
JSON only lists the symlinked agent directories.

```bash
# Compact table: skill, scope, agent count, shortened agent list.
scripts/skill-agent-table.mjs --filter '^vp-'

# Matrix for common agents.
scripts/skill-agent-table.mjs --filter '^vp-' --matrix codex claude-code gemini-cli github-copilot antigravity

# Count skills linked to each agent.
scripts/skill-agent-table.mjs --summary

# Project scope instead of global.
scripts/skill-agent-table.mjs --scope project
```

If the helper is unavailable, use `npx -y skills@1.5.3 list -g --json` and
format the `agents` array yourself. Do not rely on human `list --agent` output
as a strict filter; filter the JSON data instead.

## Repair Failed Updates

When `update <skill>` fails after an upstream repo moved the skill path:

1. Inspect the source from the lock or previous install output.
2. Confirm fresh discovery works.
3. Reinstall the specific skill from the source.
4. Re-run targeted update.

```bash
npx -y skills@1.5.3 add <owner/repo> --list
npx -y skills@1.5.3 add <owner/repo> --skill <skill-name> -g --agent '*' -y
npx -y skills@1.5.3 update <skill-name> -g
```

Do not manually edit lock files unless the user explicitly asks for lock-file
surgery.

## Project Restore

For repositories with a project `skills-lock.json`:

```bash
npx -y skills@1.5.3 experimental_install
```

For skills supplied by `node_modules`:

```bash
npx -y skills@1.5.3 experimental_sync -y --agent '*'
```
