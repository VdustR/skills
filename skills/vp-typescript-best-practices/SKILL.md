---
name: vp-typescript-best-practices
description: >-
  Use when writing, reviewing, refactoring, or fixing TypeScript (.ts, .tsx,
  .mts, .cts), designing type-level APIs and data-sharing contracts, validating
  runtime data or type guards, adding type tests, or investigating slow type
  checking. Also use for tsconfig/project setup, multiple tsconfigs,
  environment-specific builds, conflicting ambient globals, library integrations,
  browser/Node isolation, project references, strictest, erasableSyntaxOnly,
  ts-reset, incremental caches, native compiler compatibility, and type-check
  coverage in single packages or TypeScript monorepos. Boundary: does not own
  non-TypeScript monorepo or general workspace setup.
---

# TypeScript Best Practices

Follow the repository's compiler settings, style, supported runtime, and public
API conventions before applying fallback preferences. Inspect the installed
compiler and library versions before relying on inference or schema APIs.

## Select the task

Read the references needed for the actual decision:

| Task | Start with |
| --- | --- |
| Values, fixtures, callbacks, or prop construction | [Consumer contracts](references/consumer-contracts.md) and the relevant type reference |
| Untrusted data, custom guards, or assertion functions | [Runtime validation](references/runtime-schemas.md) |
| Generic inference, API results, mutation, or shared data | [Public API contracts](references/public-api.md) |
| Slow type checking or costly type utilities | [Type performance](references/type-performance.md) |
| tsconfig, builds, ambient globals, project caches, or coverage | [Project setup](references/setup.md), then configuration/verification as needed |

For TypeScript implementation, errors, and review, use the code workflow below.
Apply the project strategy to TypeScript packages in a monorepo; monorepo layout
alone does not select this skill. A code-only change does not authorize setup
changes, tool replacement, or unrelated style refactoring.

## Code workflow

1. Identify the receiving API, runtime trust boundary, and intended valid states.
   Derive contracts from their owner; establish inference sources and any
   mutation/sharing guarantees before choosing type machinery.
2. Prefer inference locally; annotate meaningful contracts. Choose annotation,
   contextual typing, or `satisfies` before assertions. Anchor fresh literals
   where they are created, including fixtures and conditional spread branches.
3. Validate untrusted runtime values; assertions and `satisfies` do not validate
   data. Check guard semantics on both branches and derive schema input/output
   types from the chosen parsing contract.
4. Model valid states with discriminated unions and exhaustive handling. Use
   generics only for real relationships; preserve useful literal precision.
5. Verify with the repository's actual compiler, type-test runner, and runtime
   tests. Check accepted and rejected inputs. A passing command proves nothing
   about a file that the command never includes.

Avoid `any`, unchecked double assertions, wrapper object types, and duplicate
source-of-truth types. Localize a necessary escape hatch, explain why safer
alternatives fail, and verify the invariant that the compiler cannot prove.

## References

Read only the reference relevant to the task:

- [Project setup](references/setup.md): effective configuration, strictest,
  application-scoped ts-reset, and the setup workflow.
- [Project configuration](references/project-configuration.md): environment and
  integration boundaries, build variants, monorepo package projects, and caches.
- [Project verification](references/project-verification.md): full file/environment
  coverage, conflicting globals, build outputs, and cache correctness.
- [Code style](references/code-style.md): inference and local conventions.
- [Consumer contracts](references/consumer-contracts.md): `satisfies`, fresh
  literals, conditional spreads, mapped fixtures, and assertions.
- [Runtime validation](references/runtime-schemas.md): guards, assertion functions,
  parsing behavior, and schema input/output types.
- [Public API contracts](references/public-api.md): inference sources, literal
  results, mutation, and shared data.
- [Type performance](references/type-performance.md): diagnose compiler cost and
  compare designs without weakening consumer contracts.
- [Type patterns](references/type-patterns.md): relationships and valid states.
- [Exhaustive unions](references/union-exhaustive.md): closed variants and guards.
- [Type testing](references/type-testing.md): assignability and negative tests.
- [Branded types](references/branded-types.md): validated semantic distinctions.
- [Template literals](references/template-literals.md): finite string contracts.
