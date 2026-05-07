---
name: vp-skills
description: >-
  Manage agent skills using the npx skills CLI. Use when the user asks to
  "install a skill", "add a skill", "remove a skill", "list skills",
  "update skills", "find skills", "search for skills", or mentions "npx skills",
  skill management, or agent skill installation. Also trigger when the user
  mentions skills.sh, agent-skills, vercel skills, or wants to discover
  available skills for their environment.
  Boundary: not for creating new skills (use skill-creator) or managing
  agent-specific plugin systems or marketplace commands.
---

# Agent Skills Management

Manage agent skills using the `npx skills` CLI from vercel-labs/agent-skills.
Use the pinned known-good CLI version `skills@1.5.3` unless the user explicitly
asks to verify or use the latest CLI behavior.

## Commands Overview

| Command | Purpose |
|---------|---------|
| `npx -y skills@1.5.3 add <repo>` | Install skills from repository |
| `npx -y skills@1.5.3 remove [names]` | Remove installed skills |
| `npx -y skills@1.5.3 list` | List installed skills |
| `npx -y skills@1.5.3 find [query]` | Search for skills interactively |
| `npx -y skills@1.5.3 update` | Update all skills to latest |
| `npx -y skills@1.5.3 check` | Check for available updates |
| `npx -y skills@1.5.3 init [name]` | Initialize a new skill |

> **Note:** The `npx -y` flag is for npx itself (auto-install the `skills` package). The `-y` flag on `skills add`/`remove` commands skips confirmation prompts — omit it in interactive contexts to let the user confirm before changes.

## Installation

### Install Globally (Recommended for Personal Use)

Install skills globally for the selected agent:

```bash
npx -y skills@1.5.3 add vercel-labs/agent-skills -g --agent <agent-name>
```

### Install to Project

Install skills to the current project for the selected agent:

```bash
npx -y skills@1.5.3 add vercel-labs/agent-skills --agent <agent-name>
```

### Install Specific Skills Only

Select specific skills from a repository:

```bash
npx -y skills@1.5.3 add vercel-labs/agent-skills --skill web-design-guidelines -g
```

### List Available Skills Before Installing

Preview skills in a repository without installing:

```bash
npx -y skills@1.5.3 add vercel-labs/agent-skills --list
```

## Removal

### Remove by Name

```bash
npx -y skills@1.5.3 remove web-design-guidelines -g
```

### Interactive Removal

```bash
npx -y skills@1.5.3 remove -g
```

## Listing and Discovery

### List Installed Skills

```bash
npx -y skills@1.5.3 list -g      # Global skills
npx -y skills@1.5.3 list         # Project skills
```

### Search for Skills

```bash
npx -y skills@1.5.3 find typescript    # Search by keyword
npx -y skills@1.5.3 find               # Interactive search
```

## Updates

### Check for Updates

```bash
npx -y skills@1.5.3 check
```

### Update All Skills

```bash
npx -y skills@1.5.3 update
```

## Common Skill Sources

| Repository | Skills Available |
|------------|------------------|
| `vercel-labs/agent-skills` | vercel-react-best-practices, web-design-guidelines, react-native-guidelines, composition-patterns, vercel-deploy-claimable |
| `vercel-labs/agent-browser` | agent-browser (browser automation) |

## CLI Options Reference

### Add Options

| Option | Description |
|--------|-------------|
| `-g, --global` | Install globally for the selected agent |
| `-s, --skill <names>` | Install specific skills only |
| `-a, --agent <agents>` | Target specific agents (claude-code, cursor, etc.) |
| `-l, --list` | List available skills without installing |
| `-y, --yes` | Skip confirmation prompts |
| `--all` | Install all skills to all agents |

### Remove Options

| Option | Description |
|--------|-------------|
| `-g, --global` | Remove from global scope |
| `-s, --skill <names>` | Specify skills to remove |
| `-a, --agent <agents>` | Remove from specific agents |
| `-y, --yes` | Skip confirmation prompts |
| `--all` | Remove all skills from all agents |

### List Options

| Option | Description |
|--------|-------------|
| `-g, --global` | List global skills |
| `-a, --agent <agents>` | Filter by agent |

## Notes

- Skills are stored as SKILL.md files with YAML frontmatter
- Global skills (`-g`) are available across all projects
- Project skills are isolated to the current project
- Run `npx -y skills@1.5.3 --help` for complete documentation
- Discover more skills at https://skills.sh/
