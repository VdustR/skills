---
name: vp-typescript-best-practices
description: >-
  Guide TypeScript implementation, review, refactoring, error fixes, runtime
  validation, and type-level API design in .ts, .tsx, and .test-d.ts files.
---

# TypeScript Best Practices

Follow the repository's compiler settings, style, supported runtime, and public
API conventions before applying fallback preferences.

## Principles

- Prefer inference for local implementation and explicit types at meaningful
  contracts.
- Validate untrusted runtime data; a type assertion does not make data safe.
- Model valid states and exhaustive branches instead of widening types to
  suppress errors.
- Preserve literal precision with the narrowest appropriate mechanism.
- Use generics only when they express a real relationship.
- Avoid `any`, unchecked double assertions, wrapper object types, and duplicate
  source-of-truth types.
- Add type-level tests for reusable or subtle type contracts.

Read only the relevant reference for the problem:

- `references/setup.md`
- `references/code-style.md`
- `references/type-patterns.md`
- `references/union-exhaustive.md`
- `references/type-testing.md`
- `references/branded-types.md`
- `references/template-literals.md`

Verify with the repository's actual TypeScript and test configuration.
