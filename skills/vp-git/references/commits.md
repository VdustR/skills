# Commits

## Scope

Commit only when explicitly authorized. Before writing a message, inspect
repository instructions, templates, configured validation, and recent accepted
history. Use Conventional Commits only as a fallback.

## Decisions

- Group changes by one coherent reason, not by file count or reviewer comment.
- Keep unrelated user work out of the commit.
- Explain why when the diff alone does not capture intent, risk, or migration
  order.
- Prefer a concise title; use a body for verification, material risk, or
  non-obvious tradeoffs.
- Validate with repository tooling when available. Do not install tools or bypass
  hooks merely to make a commit pass.

Review the staged diff immediately before committing and verify the resulting
commit immediately afterward.
