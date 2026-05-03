# VdustR Skills

Reusable Agent Skills by [VdustR](https://github.com/VdustR).

## Installation

Preview available skills:

```bash
npx -y skills add VdustR/skills --list
```

Install all skills globally for Codex:

```bash
npx -y skills add VdustR/skills --skill '*' -g --agent codex
```

Install all skills globally for Claude Code:

```bash
npx -y skills add VdustR/skills --skill '*' -g --agent claude-code
```

Install selected skills:

```bash
npx -y skills add VdustR/skills --skill vp-cspell --skill vp-gitignore-builder -g --agent codex
npx -y skills add VdustR/skills --skill vp-cspell --skill vp-gitignore-builder -g --agent claude-code
```

Install to the current project instead of globally by omitting `-g`.

## Skills

### vp-checklist-runner

Parse and verify GitHub PR/issue checklists, auto-checking items that pass verification.

### vp-cspell

Handle cspell unknown word warnings with a prioritized decision tree and config bootstrapping.

### vp-deps-migrate

Replace one library with another or migrate deprecated API patterns.

### vp-deps-upgrade

Upgrade dependencies with breaking change detection and migration planning.

### vp-gitignore-builder

Build and merge `.gitignore` files using github/gitignore templates with smart project detection.

### vp-guided-focus

Use structured questions to align on requirements before planning or complex tasks.

### vp-macos-clean-uninstall

Cleanly uninstall macOS applications with research-backed residual file cleanup.

### vp-pr-comment-resolver

Handle GitHub PR review comments with verification, focused fixes, and thread replies.

### vp-pr-review-followup

Follow up on GitHub PR review conversations from the reviewer side.

### vp-prename

Generate concise session titles based on the whole conversation theme.

### vp-retro

Review recent agent work to discover workflow, instruction, and skill improvements.

### vp-skills

Manage agent skills using the `npx skills` CLI.

### vp-stacked-pr-rebase

Rebase stacked PRs after a parent PR is merged, preserving only your commits.

### vp-typescript-best-practices

Apply TypeScript guidelines for type design, naming, and maintainable patterns.

## Development

Skills live under `skills/vp-<skill-name>/` and each skill must include `SKILL.md` with valid `name` and `description` frontmatter.

Use `npx skills` for installation and management. Agent-specific plugin adapters, if needed, should live outside this repository or be generated from these canonical skill sources.

## License

[MIT](LICENSE)
