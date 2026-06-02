---
name: vp-skills
description: >-
  Manage agent skills with the npx skills CLI. Use when the user asks to
  install, add, update, upgrade, remove, list, find, search, inspect, repair,
  or reinstall skills; mentions npx skills, skills.sh, agent-skills, vercel
  skills, or skill installation; or needs to choose agents, scopes, or skill
  sources. Boundary: not for authoring or editing skill content.
---

# Agent Skills Management

Use the pinned known-good CLI version unless the user explicitly asks to check
latest behavior:

```bash
npx -y skills@1.5.3 <command>
```

## Defaults

- Prefer global installs for personal tooling: `-g`.
- Install to all supported agents by default: `--agent '*'`.
- Use `--all` only when installing all skills from a source to all agents.
- Quote `'*'` so the shell does not expand it.
- Use `-y` only after the target source, skills, scope, and agents are known.
- Treat `update`, `upgrade`, and `check` as write-capable. In `skills@1.5.3`,
  `check` runs the same update flow and can install updates.

## Decision Flow

1. Identify operation: install, update, remove, list, find, or repair.
2. Identify scope: global by default; project-local only when requested or when
   restoring project skills from `skills-lock.json`.
3. Identify agents: all supported agents by default; narrow only when requested.
4. Preview when useful: `add <source> --list`, `list --json`, or `find <query>`.
5. Execute with pinned CLI and explicit flags.
6. Verify with `list -g --json` or a targeted follow-up command.

## Common Commands

```bash
# Preview skills in a source.
npx -y skills@1.5.3 add VdustR/skills --list

# Install one skill globally to all supported agents.
npx -y skills@1.5.3 add VdustR/skills --skill vp-skills -g --agent '*' -y

# Install every skill from a source globally to every supported agent.
npx -y skills@1.5.3 add VdustR/skills -g --all

# List global installs in machine-readable form.
npx -y skills@1.5.3 list -g --json

# Show installed skills with their linked agents as a table.
scripts/skill-agent-table.mjs --filter '^vp-'

# Search skills.sh by keyword.
npx -y skills@1.5.3 find typescript

# Update global installed skills.
npx -y skills@1.5.3 update -g

# Update one known global skill.
npx -y skills@1.5.3 update vp-skills -g

# Remove selected skills globally from all supported agents.
npx -y skills@1.5.3 remove agent-browser portless -g --agent '*' -y
```

## Repair Pattern

If `update <skill>` fails because the lock points to a stale upstream path, do
not edit lock files by hand. Rediscover and reinstall the skill from its source:

```bash
npx -y skills@1.5.3 add <owner/repo> --list
npx -y skills@1.5.3 add <owner/repo> --skill <skill-name> -g --agent '*' -y
npx -y skills@1.5.3 update <skill-name> -g
```

Use the exact source and skill name from the installed lock or from successful
fresh discovery.

## References

- See `references/workflows.md` for install, update, remove, query, and repair
  workflows.
- See `references/command-reference.md` for command surface, options, source
  formats, agents, and environment variables.
- See `references/troubleshooting.md` for stale locks, failed updates, clone
  timeouts, internal skills, and safety notes.
