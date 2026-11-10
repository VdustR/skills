---
name: vp-env-secrets
description: >-
  Deprecated: use fnox instead. Use only when a request names vp-env-secrets
  or envctl, or asks to load secrets from a dotenv file such as ~/.env.local,
  to redirect the work to fnox. This skill no longer ships the envctl helper.
---

# Env Secrets (Deprecated)

This skill is retired. Its `envctl` helper loaded secrets from dotenv files with
dotenvx. Secrets now live in [fnox](https://fnox.jdx.dev), backed by the OS
keychain. Use the official
[`fnox` skill](https://github.com/jdx/fnox/tree/main/skills/fnox) instead.

Do not recreate `envctl`. Do not create or load a dotenv file for personal
secrets.

## envctl to fnox

| Old (`envctl`) | Now (fnox) |
| --- | --- |
| `envctl list --keys` | `fnox list` (names, never values) |
| `envctl doctor` | `fnox doctor`, or `fnox check` to confirm every secret resolves |
| `envctl run -- <cmd>` | `fnox exec --redact -- <cmd>` |
| Remap a name inside the child | `fnox exec --redact -- sh -c 'TOOL_TOKEN="$MY_TOKEN" exec <cmd>'` |
| Check that one key exists | `fnox --if-missing error get KEY >/dev/null` (stdout discarded) |
| `envctl stage-from-file` / `persist-staged` | The person runs `fnox set --global KEY -p keychain` (hidden prompt) |

Rules that carry over:

- Never print a value, a prefix, or a slice of one. Verify by length or by
  exit status inside the child.
- Never put a value in a command line, a log, a commit, or chat.
- Never run `fnox get` (without discarding stdout), `fnox export`, `fnox env`, or
  `fnox list --values` from an agent shell.
- `fnox exec` redacts output only with `--redact`, `redact_exec = true`, or
  `FNOX_EXEC_REDACT=1`, and only on piped streams.

A repository whose own tooling reads a project `.env*` file (for example
through dotenvx) keeps using that tooling; this skill never managed project
dotenv precedence for them.

## Uninstalling

```bash
npx -y skills@1.5.3 remove -g -s vp-env-secrets -y
```

## Related skills

- [`fnox`](https://github.com/jdx/fnox/tree/main/skills/fnox) for storing,
  listing, and injecting secrets.
