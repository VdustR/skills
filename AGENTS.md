# VdustR Skills - Maintainer Instructions

## Scope

This repository is the canonical source for reusable Agent Skills.

Do not add plugin marketplace files, plugin manifests, or agent-specific adapters here unless the user explicitly decides to keep them in this repository.

## Structure

```
skills/
└── vp-<skill-name>/
    ├── SKILL.md
    ├── agents/
    ├── references/
    └── scripts/
```

`agents/`, `references/`, and `scripts/` are optional in the skill format, but this repository keeps `agents/openai.yaml` for each public skill. Keep each skill self-contained and avoid symlinks to external repositories.

## Skill Rules

- Use kebab-case skill directory names with the `vp-` prefix.
- `SKILL.md` frontmatter must include `name` and `description`.
- The `name` field must match the skill directory name.
- Keep `SKILL.md` concise; move detailed material into directly linked `references/` files.
- Keep `agents/openai.yaml` in sync with `SKILL.md`; `default_prompt` must mention the skill as `$vp-<skill-name>`.
- Put deterministic helper code in the skill's own `scripts/` directory.
- Do not hardcode machine-specific absolute paths.
- Do not include secrets or credential material.
- Keep public skill docs in American English.

## Installation Guidance

Default to the pinned `npx skills@1.5.3` CLI for installation and management:

```bash
npx -y skills@1.5.3 add VdustR/skills --list
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent codex
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent claude-code
```

Do not recommend plugin marketplace installation from this repository by default.

## Verification

Before treating a change as done:

- Validate every `SKILL.md` has parseable frontmatter with `name` and `description`.
- Validate each skill has synced `agents/openai.yaml`.
- Run `npm run validate` from the repository root after `npm ci`.
- Use `npm run validate:offline` for offline repository-owned checks.
- Use `npm run validate:smoke-fixtures` to verify high-risk workflow fixtures exist and cover regression points.
- Use `npm run validate:parser` for locked `skills@1.5.3` parser compatibility.
- Use `npm run validate:latest` only as a non-blocking latest-CLI compatibility check.
- Search for stale plugin or platform-specific wording when extracting skills from another source.
