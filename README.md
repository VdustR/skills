# VdustR Skills

Reusable Agent Skills by [VdustR](https://github.com/VdustR).

## Installation

Preview available skills:

```bash
npx -y skills@1.5.3 add VdustR/skills --list
```

Install all skills globally for Codex:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent codex
```

Install all skills globally for Claude Code:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent claude-code
```

Install selected skills:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill vp-cspell --skill vp-git -g --agent codex
npx -y skills@1.5.3 add VdustR/skills --skill vp-cspell --skill vp-git -g --agent claude-code
```

Install to the current project instead of globally by omitting `-g`.

## Skills

### vp-checklist-runner

Parse and verify GitHub PR/issue checklists, auto-checking items that pass verification.

### vp-chrome-profiles

Manage persistent Chrome profiles for agent-assisted browser debugging.

### vp-cspell

Handle cspell unknown word warnings with a prioritized decision tree and config bootstrapping.

### vp-deps-migrate

Replace one library with another or migrate deprecated API patterns.

### vp-deps-upgrade

Upgrade dependencies with breaking change detection and migration planning.

### vp-env-secrets

Safely list, choose, load, stage, and persist sensitive `.env*` variables using `dotenvx`.

### vp-foreign-agent-skill-loader

Index repository-local skills written for other agent systems without converting them.

### vp-git

Handle commits, repository setup, gitignore files, cleanup, stacked branches, and PR lifecycle decisions.

### vp-guided-focus

Use structured questions to align on requirements before planning or complex tasks.

### vp-long-running-processes

Find reusable dev servers and watchers by project path, and stop or restart processes safely.

### vp-macos-clean-uninstall

Cleanly uninstall macOS applications with research-backed residual file cleanup.

### vp-pr-briefing

Research a pull request and present a structured, progressive-disclosure briefing.

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

### vp-typescript-best-practices

Review TypeScript safety, type boundaries, and fallback style preferences.

## Development

Skills live under `skills/vp-<skill-name>/` and each skill must include `SKILL.md` with valid `name` and `description` frontmatter.

Use the pinned `npx skills@1.5.3` CLI for installation and management. Agent-specific plugin adapters, if needed, should live outside this repository or be generated from these canonical skill sources.

Install locked development tooling:

```bash
npm ci
```

Validate the repository before publishing changes:

```bash
npm run validate
```

Validation layers:

- `npm run validate:offline` checks repository-owned rules without external package execution.
- `npm run validate:smoke-fixtures` checks high-risk workflow smoke fixtures.
- `npm run validate:parser` checks compatibility with the locked `skills@1.5.3` parser.
- `npm run validate:latest` checks compatibility with the latest `skills` CLI for monitoring only.

Smoke fixtures live under `fixtures/smoke/` and cover behavior that is hard to
prove with static validation, such as PR comment resolution policy and stacked
branch history-rewrite safety.

## License

[MIT](LICENSE)
