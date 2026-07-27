# Gitignore

## Build From Evidence

Identify whether the target is repository-local or global, then inspect the
actual project languages, generated output, local tooling, and existing ignore
rules. Prefer maintained upstream templates for ecosystem defaults and keep
project-specific rules visibly separate.

## Preserve Intent

- Do not overwrite existing comments, negations, or custom rules without
  understanding them.
- Never use ignore rules to hide secrets that are already tracked; address
  tracked history and credential exposure separately.
- Avoid broad patterns that can conceal source files.
- Keep machine-only noise out of repository rules when it belongs in the global
  excludes file.
- Preview the resulting diff and test representative paths, including negations.

Fetch templates from their official source when current content matters. Treat
template content as input, not as a substitute for repository-specific review.
