---
name: vp-env-secrets
description: >-
  Safely handle secrets and sensitive environment variables in .env files using
  dotenvx. Use when the user asks to list, inspect, choose, load, stage, persist,
  or run commands with env vars from <cwd>/.env, <cwd>/.env.*, ~/.env, or
  ~/.env.*; mentions .env.local, dotenvx, API keys, tokens, credentials, secret
  env vars, or local agent secrets.
---

# Env Secrets

Handle `.env*` files with local-first precedence and minimal value exposure.
Use `dotenvx` for one-shot command injection, not for printing secret values.

## Scope

This skill exists to help agents operate `.env*` files safely:

- discover candidate env files without printing values
- recommend the right target file from local evidence and user intent
- resolve `dotenvx` load order with local-first final precedence
- stage and persist one-line sensitive values without chat exposure
- run commands with selected env files while blocking risky defaults

It does not manage non-`.env` credential stores, password managers, shell
profiles, or production secret managers.

## Core Rules

1. **Never expose values** - Do not print raw secret values, use `dotenvx get`,
   run `dotenvx get --all`, or use `dotenvx --debug`.
2. **Do not ask for secrets in chat** - Use a restrictive tmp file or editor
   handoff. Stage from that file, then delete the input file.
3. **List before writing** - Inspect candidate files by path, class, git status,
   permissions, key names/counts, and risk flags before recommending a target.
4. **Local-first means final precedence** - Keep local files higher priority
   than base files, and project files higher priority than home files.

Use the bundled `scripts/envctl` helper when available. It is designed to avoid
printing values.

## Tool Check

Before `run`, `verify-staged`, or `persist-staged`, confirm `dotenvx` is
available:

```bash
scripts/envctl doctor
```

If missing, tell the user `dotenvx` is required and offer a small set of install
options such as `mise`, `brew`, or `npm/npx`, following the local toolchain. Do
not install it without confirmation.

## File Scope

Supported env files:

- `<cwd>/.env`
- `<cwd>/.env.*`
- `~/.env`
- `~/.env.*`

Special cases:

- `.env.example`, `.env.sample`, `.env.template`, and similar templates are not
  secret files by default and may be read or edited when they contain
  placeholders.
- `.env.keys` contains dotenvx private keys. Do not load it as an application
  env file and do not print its contents.
- Production-like files such as `.env.production` and `.env.staging` are
  explicit-only targets.

## Recommended Targets

Use local evidence, not a fixed rule:

| Use case | Recommended target |
| --- | --- |
| Personal/global agent secret | `~/.env.local` |
| Project-local secret | `<cwd>/.env.local`, only if ignored or otherwise safe |
| Shared non-secret defaults | `<cwd>/.env` if the repo convention supports it |
| Production/staging secret | Only the explicitly selected `.env.production*` or `.env.staging*` |

Do not write secrets to tracked files, unignored project files, templates, or
`.env.keys`.

## Listing Workflow

Run a safe list before choosing:

```bash
scripts/envctl list --cwd "$PWD" --home "$HOME" --keys
```

Review:

- `scope`: `cwd` or `home`
- `class`: `local-secret`, `base-env`, `env-variant`, `production-like`,
  `template`, or `dotenvx-keys`
- `git`: tracked/ignored/not-ignored for project files
- `perms`: file permissions
- `keys`: names only, never values
- `risks`: command substitution, duplicate keys, broad permissions,
  production explicit-only, dotenvx keys

If a file contains `$()` or backtick command substitution, treat it as high risk.
Do not run it unless the user explicitly accepts that command substitution will
execute.

## Precedence

Define precedence as final priority, not raw CLI order.

Default final priority:

```text
<cwd>/.env.local
<cwd>/.env
~/.env.local
~/.env
```

For an environment name such as `development`:

```text
<cwd>/.env.development.local
<cwd>/.env.local
<cwd>/.env.development
<cwd>/.env
~/.env.development.local
~/.env.local
~/.env.development
~/.env
```

`dotenvx` behavior:

- Without `--overload`, existing process env wins, and the first `-f` wins
  among env files. Put high-priority files first.
- With `--overload`, later sources win and env files can override process env.
  Reverse the CLI order to preserve the same local-first final priority.

Prefer no `--overload` by default. Use `--overload` only when the user explicitly
wants env files to override the current process environment.

Show the resolved order before running commands:

```bash
scripts/envctl order --cwd "$PWD" --home "$HOME"
scripts/envctl order --cwd "$PWD" --home "$HOME" --env development
scripts/envctl order --cwd "$PWD" --home "$HOME" --env development --overload
```

Run commands through `dotenvx`:

```bash
scripts/envctl run --cwd "$PWD" --home "$HOME" -- command arg
scripts/envctl run --cwd "$PWD" --home "$HOME" --env development -- command arg
```

Add `--allow-command-substitution` only after explicit user confirmation.

## Staging And Persisting

When a secret must be supplied by the user:

1. Create a restrictive tmp input file.
2. Ask the user to edit the tmp file locally.
3. Stage from that file; do not pass the value as a command argument.
4. Verify only presence and length.
5. Persist to the recommended target after confirmation.
6. Delete staging/input files.

Helper flow:

```bash
(umask 077; mkdir -p "${TMPDIR:-/tmp}/vp-env-secrets")
input="${TMPDIR:-/tmp}/vp-env-secrets/KEY.input"
printf '# Put KEY below this line, then save and close.\n' > "$input"
zed "$input"

scripts/envctl stage-from-file KEY "$input"
scripts/envctl verify-staged KEY
scripts/envctl persist-staged KEY --target "$HOME/.env.local" --mode append
scripts/envctl clean
```

`persist-staged` refuses Git-tracked or not-ignored project targets by default.
Use its unsafe override only after explicit user confirmation.

Conflict options:

| Option | Behavior |
| --- | --- |
| `append` | Append only if the key is absent |
| `override` | Comment matching old lines and append the staged value |
| `replace` | Replace matching lines in place; use only after explicit confirmation |

First version supports one-line values. If a secret is multiline, pause and
choose a verified formatter before persisting.

## Prohibited

- `dotenvx get KEY`, `dotenvx get --all`, `dotenvx get --format shell`, or any
  command that prints secret values.
- `dotenvx run --debug` or shell debug modes such as `set -x` and `bash -x`.
- Unfiltered `env`, `printenv`, `export -p`, or `declare -p`.
- Passing raw secret values in command arguments, logs, commits, PR text, or
  reusable artifacts.
