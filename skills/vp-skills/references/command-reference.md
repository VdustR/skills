# npx skills Command Reference

Baseline: `skills@1.5.3`. Latest compatibility is useful for monitoring, but
repository validation treats 1.5.3 as the blocking parser.

## Commands

| Command | Aliases | Purpose |
| --- | --- | --- |
| `add <source>` | `a`, `install`, `i` | Install skills from a source |
| `remove [skills...]` | `rm`, `r` | Remove installed skills |
| `list` | `ls` | List installed skills |
| `find [query]` | `search`, `f`, `s` | Search skills.sh |
| `update [skills...]` | `upgrade`; `check` routes here | Update tracked skills |
| `init [name]` | none | Create a `SKILL.md` template |
| `experimental_install` | none | Restore project skills from `skills-lock.json` |
| `experimental_sync` | none | Sync skills from `node_modules` |

## Add Options

| Option | Meaning |
| --- | --- |
| `-g`, `--global` | Install to user-level global skill directories |
| `-a`, `--agent <agents...>` | Target agents; use `'*'` for all supported agents |
| `-s`, `--skill <skills...>` | Target skills; use `'*'` for all skills |
| `-l`, `--list` | List available skills without installing |
| `-y`, `--yes` | Skip confirmation prompts |
| `--copy` | Copy files instead of symlinking |
| `--all` | Shorthand for `--skill '*' --agent '*' -y` |
| `--full-depth` | Search all subdirectories even when a root `SKILL.md` exists |

`--agent` and `--skill` accept multiple values after one flag until the next
flag. Repeating the flag also works.

## Update Options

| Option | Meaning |
| --- | --- |
| `-g`, `--global` | Update global tracked skills only |
| `-p`, `--project` | Update project tracked skills only |
| `-y`, `--yes` | Skip scope prompt; project if project skills exist, else global |
| `[skills...]` | Update specific installed skill names |

If skill names are provided without `-g` or `-p`, the CLI checks both scopes.

## Remove Options

| Option | Meaning |
| --- | --- |
| `-g`, `--global` | Remove from global scope |
| `-a`, `--agent <agents...>` | Remove from specific agents; use `'*'` for all |
| `-s`, `--skill <skills...>` | Remove specific skills; use `'*'` for all |
| `-y`, `--yes` | Skip confirmation prompts |
| `--all` | Shorthand for `--skill '*' --agent '*' -y` |

Prefer positional skill names for normal removal:

```bash
npx -y skills@1.5.3 remove vp-skills -g --agent '*' -y
```

## List Options

| Option | Meaning |
| --- | --- |
| `-g`, `--global` | List global skills; default is project |
| `-a`, `--agent <agents...>` | Filter by agent |
| `--json` | Machine-readable JSON without ANSI codes |

For strict reporting by agent, prefer `list --json` plus JSON filtering. The
human list command may include other existing agent directories while resolving
shared canonical paths.

## Experimental Sync Options

| Option | Meaning |
| --- | --- |
| `-a`, `--agent <agents...>` | Target agents; use `'*'` for all |
| `-y`, `--yes` | Skip prompts |
| `-f`, `--force` | Reinstall all discovered `node_modules` skills |

`--force` is parsed by the CLI but not shown in top-level help.

## Source Formats

```bash
# GitHub shorthand.
npx -y skills@1.5.3 add owner/repo --list

# Full GitHub URL.
npx -y skills@1.5.3 add https://github.com/owner/repo --list

# Direct path in a GitHub repo.
npx -y skills@1.5.3 add https://github.com/owner/repo/tree/main/skills/name --list

# GitLab URL.
npx -y skills@1.5.3 add https://gitlab.com/group/repo --list

# Any git URL.
npx -y skills@1.5.3 add git@github.com:owner/repo.git --list

# Local path.
npx -y skills@1.5.3 add ./skills --list

# Ref and skill filter fragments.
npx -y skills@1.5.3 add owner/repo#main --list
npx -y skills@1.5.3 add owner/repo#main@vp-skills -g --agent '*' -y
npx -y skills@1.5.3 add owner/repo@vp-skills -g --agent '*' -y
```

## Common Agent Names

Use `--agent '*'` for the default all-agent behavior. Common explicit targets:

| Agent | Flag value |
| --- | --- |
| Codex | `codex` |
| Claude Code | `claude-code` |
| Cursor | `cursor` |
| OpenCode | `opencode` |
| Gemini CLI | `gemini-cli` |
| Universal `.agents/skills` | `universal` |

Run an invalid-agent command only if you need the CLI to print the current full
agent list. The list changes as the CLI adds support for more agents.

## Environment Variables

| Variable | Use |
| --- | --- |
| `SKILLS_CLONE_TIMEOUT_MS` | Increase clone timeout for large or slow repos |
| `INSTALL_INTERNAL_SKILLS=1` | Show and install skills with `metadata.internal: true` |
| `DISABLE_TELEMETRY=1` | Disable anonymous telemetry |
| `DO_NOT_TRACK=1` | Alternative telemetry opt-out |
| `SKILLS_API_URL` | Override the skills.sh search API base |

For private repos, make sure normal git auth works first. For GitHub, `gh auth
status` is usually the fastest check; for SSH, check loaded keys with
`ssh-add -l`.
