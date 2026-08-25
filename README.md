# VdustR Skills

Reusable Agent Skills by [VdustR](https://github.com/VdustR).

## Installation

Preview available skills:

```bash
npx -y skills@1.5.3 add VdustR/skills --list
```

Install all skills globally for all supported agents:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent '*' -y
```

Install all skills globally for Codex:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent codex
```

Install all skills globally for Claude Code:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent claude-code
```

Install all skills globally for Antigravity:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill '*' -g --agent antigravity
```

Install selected skills:

```bash
npx -y skills@1.5.3 add VdustR/skills --skill vp-cspell --skill vp-git -g --agent codex
npx -y skills@1.5.3 add VdustR/skills --skill vp-cspell --skill vp-git -g --agent claude-code
```

Install to the current project instead of globally by omitting `-g`.

When upgrading from a release that provided the superseded Git skills, remove
them explicitly before installing `vp-git`:

```bash
npx -y skills@1.5.3 remove vp-git-cleanup vp-gitignore-builder vp-stacked-pr-rebase -g -y
```

When upgrading from `vp-chrome-profiles`, remove it explicitly before installing
`vp-agent-browser-session`:

```bash
npx -y skills@1.5.3 remove vp-chrome-profiles -g -y
```

Stacked-change guidance moved out of `vp-git` into `vp-stacked-pr`. Install both
if you work with stacks.

## Skills

### vp-agent-browser-session

Manage persistent agent-browser sessions with dedicated Chrome profiles.

### vp-autodev

Take an owned-repository issue or development task through validation,
implementation, PR feedback loops, merge readiness, and release follow-up.

### vp-checklist-runner

Parse and verify GitHub PR/issue checklists, auto-checking items that pass verification.

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

Handle commits, repository setup, gitignore files, cleanup, and PR lifecycle decisions.

### vp-github

GitHub platform behavior: attaching media and files to issues and PRs, markdown rendering rules, and which credential reaches which endpoint.

### vp-guided-focus

Use structured questions to align on requirements before planning or complex tasks.

### vp-issue-investigator

Validate a suspected software problem, find related work, and prepare or file an
evidence-backed issue.

### vp-long-running-processes

Find reusable dev servers and watchers by project path, and stop or restart processes safely.

### vp-macos-clean-uninstall

Cleanly uninstall macOS applications with research-backed residual file cleanup.

### vp-minimal-repro

Reduce an observed failure to a reproduction that fails on demand, and rebuild it standalone when it has to be shared.

### vp-pr-briefing

Research a pull request and present a structured, progressive-disclosure briefing.

### vp-pr-comment-resolver

Handle GitHub PR review comments with verification, focused fixes, and thread replies.

### vp-pr-review-followup

Follow up on GitHub PR review conversations from the reviewer side.

### vp-prename

Generate concise session titles based on the whole conversation theme.

### vp-recording

Produce a demo video: a scripted browser walkthrough, a frame-accurate render of generated motion, or a macOS window capture.

### vp-retro

Review recent agent work to discover workflow, instruction, and skill improvements.

### vp-session-wrapup

Summarize a session before archiving it and clear leftover files, processes, and state.

### vp-skills

Manage agent skills using the `npx skills` CLI.

### vp-stacked-pr

Build, submit, merge, and repair stacks of dependent pull requests, merge requests, or branches. Native automation on GitHub, manual Git rebase on any other host.

### vp-tldr

Write a concise, reader-first summary for an artifact, message, or update while preserving uncertainty and required action.

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
prove with static validation, such as PR comment resolution policy, branch and
stash deletion evidence, stacked branch history-rewrite safety, screen-capture
scoping on a shared machine, GitHub attachment visibility, and session cleanup
authorization limits.

## License

[MIT](LICENSE)
