# TypeScript Best Practices Smoke Fixture

## Prompt

Use `$vp-typescript-best-practices` to review a typed UI fixture built with
`.map()`, a conditional JSX prop spread, an external JSON response, and a switch
on a discriminated object union. The fixture has a misspelled optional prop, the
response uses a transforming Zod schema, and the switch will gain a new variant.
The repository already has a type-test framework. Do not change its setup.

## Expected Behavior

1. Derive fixture and handler types from their consumer. Put excess-property
   checks on callback returns and each property-bearing spread literal; do not
   rely on an outer array annotation or outer spread `satisfies` for exact keys.
2. Keep untrusted JSON unknown until validation and name the schema's input or
   output side correctly. Honor the installed validator version and imports.
3. Check the remaining union object against `never`, retain a runtime failure,
   and exercise the newly added variant. Do not access a property on an object
   already narrowed to `never`.
4. Reuse the existing type-test framework and verify accepted and rejected
   inputs, plus actual inclusion in the compiler or runner. Treat mutual
   assignability separately from exact type identity.

## Regression Coverage

- `satisfies` is neither runtime validation nor an exact-object type.
- `.map()` output annotations can accept excess callback properties.
- Union props may need a selected-variant contract rather than broad `Partial`.
- TypeScript 5.5 can infer some filter predicates; `flatMap` is not always faster.
- No foreign wrapper imports, global style bans, or new test framework required.
- Do not hide missing factory defaults with assertions or use `any` as proof.

## Project Setup Scenarios

Use `$vp-typescript-best-practices` for each TypeScript setup scenario below.
Keep the existing package manager and build tools unless replacing them is part
of the request.

| Request | Expected routing and outcome |
| --- | --- |
| A single library supports two optional hosts that each declare a different `$` | Load setup, project configuration, and verification references. Isolate host projects and public entrypoints; check portable core without host globals. Verify both supported consumers and reject leaked host declarations. Do not claim runtime coexistence from separate compiler passes. |
| One package builds the same source for two runtime/module targets | Use a shared strictest base and compatible per-target configs. Check each promised target and emitted declarations; use distinct outputs and caches. No monorepo prerequisite. |
| Split a TypeScript monorepo containing browser, worker, Node tools, tests, and stories | Use package-level leaf projects and further environment partitions. Include root scripts and hidden configs. Check complete file/environment coverage and cache invalidation. |
| The root has `files: []` and CI only runs `tsc -p tsconfig.json` | Detect the false-green command; select compatible build-mode references or an explicit task that invokes every checking project. |
| A handwritten declaration or `.test-d.ts` is listed but diagnostics are skipped | Verify actual checking, including `skipLibCheck`, rather than treating file listing as proof. |
| Add ts-reset to application checking without changing library consumers | Include the reset in each intended application project and keep exported declarations and standalone library checks reset-free. |
| A new untracked worker file is not included by any leaf | Independent coverage gate fails even when existing projects have warm-cache hits. |
| Shared source is checked for Node but also promises browser support | Coverage by the union of files is insufficient; require the browser matrix row too. |

Additional executable scenarios cover browser/Node config examples and actual
runtimes; erasable syntax versus native Node stripping; jQuery/Zepto `$` and
Lodash/Underscore `_`; Vue/Svelte typed templates; tsserver project selection;
and a GitHub Actions cache round trip across independent runners.

## Description Routing Walkthrough

Evaluate the frontmatter description and agent metadata before loading the body.
The following are manual routing cases, not a claim of measured client routing:

- Should select this skill: "Fix a TypeScript narrowing error"; "Review this
  .mts library entrypoint"; "Split my tsconfig"; "Build one library for two
  environments"; "These TypeScript integrations both declare `$`"; "Audit our
  TypeScript monorepo's type-check cache and missing file coverage"; "Set up
  strictest and Matt Pocock's ts-reset".
- Should not select it solely for these requests: "Set up a Python monorepo";
  "Choose a generic workspace task runner"; "Two shell scripts use `$`".
- A general monorepo request with unknown languages requires inspecting the
  stack before choosing this skill; the word monorepo alone is insufficient.

Additional regressions: `types: []`, `typeRoots`, and `exclude` do not block
imported global augmentations; compatible compiler programs do not prove
compatible runtime globals; build-only exclusions must not hide verification
inputs; identical source can legitimately require checks in multiple projects.

## Executable Verification

Run `node --test --test-concurrency=1 tests/typescript/*.test.mjs` after installing
the locked repository dependencies. The suite executes compiler diagnostics,
package builds, packed consumers and runtime checks instead of only checking
fixture wording. See [verification results](vp-typescript-best-practices-results.md)
for the independent trial, tested versions, and remaining limits.

## Code-contract scenarios

- A conditional spread has an empty branch that later gains fields: keep its
  intended consumer contract check and exercise an inserted unknown field.
- A predicate accepts only some numbers: review both branches of narrowing and
  execute boundary values; select a boolean filter when it does not prove a type.
- A parser changes incoming values: choose key, coercion, default, transform and
  failure behavior from the caller; inspect actual parsed output.
- A default or selected value widens a generic's legal set: identify the input
  that owns that set and preserve inference at ordinary consumer calls.
- A readonly result shares nested values: distinguish typed access, array
  storage, and nested ownership before choosing copying or freezing.
- A type utility is slow: measure representative compiler work and compare the
  same consumer contract; retain the original when improvement is not established.

These are manual decision scenarios. Executable regression evidence is recorded
in the linked verification results; static fixture validation is not proof that
an agent will make the intended decision.
