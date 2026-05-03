# VdustR Skills - Maintainer Instructions

## Scope

This repository is the canonical source for reusable Agent Skills.

Do not add plugin marketplace files, plugin manifests, or agent-specific adapters here unless the user explicitly decides to keep them in this repository.

## Structure

```
skills/
└── vp-<skill-name>/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

`references/` and `scripts/` are optional. Keep each skill self-contained and avoid symlinks to external repositories.

## Skill Rules

- Use kebab-case skill directory names with the `vp-` prefix.
- `SKILL.md` frontmatter must include `name` and `description`.
- The `name` field must match the skill directory name.
- Keep `SKILL.md` concise; move detailed material into directly linked `references/` files.
- Put deterministic helper code in the skill's own `scripts/` directory.
- Do not hardcode machine-specific absolute paths.
- Do not include secrets or credential material.
- Keep public skill docs in American English.

## Installation Guidance

Default to `npx skills` for installation and management:

```bash
npx -y skills add VdustR/skills --list
npx -y skills add VdustR/skills --skill '*' -g --agent codex
npx -y skills add VdustR/skills --skill '*' -g --agent claude-code
```

Do not recommend plugin marketplace installation from this repository by default.

## Verification

Before treating a change as done:

- Validate every `SKILL.md` has parseable frontmatter with `name` and `description`.
- Run `npx -y skills add . --list` from the repository root when feasible.
- Search for stale plugin or platform-specific wording when extracting skills from another source.
