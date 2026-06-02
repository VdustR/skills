# vp-skills Troubleshooting

## `check` Updated Skills

In `skills@1.5.3`, the `check` command routes to the same implementation as
`update` and `upgrade`. It can install updates. Do not call it a dry-run.

Safer alternatives for read-only inspection:

```bash
npx -y skills@1.5.3 list -g --json
npx -y skills@1.5.3 add <source> --list
npx -y skills@1.5.3 find <query>
```

## `Failed to update <skill>`

Common cause: the lock records an old `skillPath`, but the upstream repo moved
or renamed the skill directory.

Repair by rediscovery and reinstall:

```bash
npx -y skills@1.5.3 add <owner/repo> --list
npx -y skills@1.5.3 add <owner/repo> --skill <skill-name> -g --agent '*' -y
npx -y skills@1.5.3 update <skill-name> -g
```

Example failure class observed with `impeccable`: the old lock pointed at
`skill/SKILL.md`, while the repo's generated skill lived at
`.agents/skills/impeccable/SKILL.md`. Fresh `add <repo> --list` could still
discover the skill, and reinstalling refreshed the lock.

## Stale Or Missing Lock Metadata

Global installs are tracked in the CLI's global lock. Project installs are
tracked in `skills-lock.json`. Automatic updates can only work when the lock has
enough source path and hash metadata.

If a skill cannot be checked automatically, use the CLI's suggested `add`
command, but adapt it to the normal defaults:

```bash
npx -y skills@1.5.3 add <source> --skill <skill-name> -g --agent '*' -y
```

## Clone Timeout

For large or slow repositories:

```bash
SKILLS_CLONE_TIMEOUT_MS=600000 npx -y skills@1.5.3 add <source> --list
```

For private repos, verify credentials before retrying:

```bash
gh auth status
ssh-add -l
```

## No Skills Found

Check whether the source has valid `SKILL.md` files with `name` and
`description` frontmatter. If the repo has a root `SKILL.md` but also nested
skills, use:

```bash
npx -y skills@1.5.3 add <source> --list --full-depth
```

If the source uses internal skills:

```bash
INSTALL_INTERNAL_SKILLS=1 npx -y skills@1.5.3 add <source> --list
```

## Symlink Or Copy Behavior

The CLI prefers symlinks when installing to multiple agent directories, with a
canonical skill copy as the source of truth. Use `--copy` only when independent
copies are desired or symlinks are not supported.

## Destructive Removal

`remove --all` means all skills for all agents in the selected scope. Do not use
it as a shortcut for "remove all selected skills"; pass explicit skill names.

Normal pattern:

```bash
npx -y skills@1.5.3 remove <skill-a> <skill-b> -g --agent '*' -y
```

## Latest CLI Drift

Use pinned `skills@1.5.3` for blocking work in this repository. Use latest only
for monitoring compatibility:

```bash
npm run validate:latest
```
