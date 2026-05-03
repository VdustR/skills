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

Install selected skills:

```bash
npx -y skills add VdustR/skills --skill cspell --skill gitignore-builder -g --agent codex
```

Install to the current project instead of globally by omitting `-g`.

## Skills

### checklist-runner

Parse and verify GitHub PR/issue checklists, auto-checking items that pass verification.

### cspell

Handle cspell unknown word warnings with a prioritized decision tree and config bootstrapping.

### deps-migrate

Replace one library with another or migrate deprecated API patterns.

### deps-upgrade

Upgrade dependencies with breaking change detection and migration planning.

### gitignore-builder

Build and merge `.gitignore` files using github/gitignore templates with smart project detection.

### guided-focus

Use structured questions to align on requirements before planning or complex tasks.

### macos-clean-uninstall

Cleanly uninstall macOS applications with research-backed residual file cleanup.

### pr-comment-resolver

Handle GitHub PR review comments with verification, focused fixes, and thread replies.

### prename

Generate concise session titles based on the whole conversation theme.

### retro

Review recent agent work to discover workflow, instruction, and skill improvements.

### skills

Manage agent skills using the `npx skills` CLI.

### stacked-pr-rebase

Rebase stacked PRs after a parent PR is merged, preserving only your commits.

### typescript-best-practices

Apply TypeScript guidelines for type design, naming, and maintainable patterns.

## Development

Skills live under `skills/<skill-name>/` and each skill must include `SKILL.md` with valid `name` and `description` frontmatter.

Use `npx skills` for installation and management. Agent-specific plugin adapters, if needed, should live outside this repository or be generated from these canonical skill sources.

## License

[MIT](LICENSE)
