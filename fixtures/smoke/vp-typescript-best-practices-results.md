# TypeScript Verification Results

## Scope and baseline

This record covers the TypeScript skill's code guidance and project-configuration
references. It does not describe a migration of a production repository.
The initial source had general typing and setup principles; the candidate adds
consumer-contract examples, schema boundaries, environment/build partitions,
strictest, application-scoped ts-reset, cache checks, and file/environment coverage.

## Reproducible compiler and runtime checks

Install the locked repository dependencies without lifecycle scripts, then run:

```bash
npm ci --ignore-scripts
node --test --test-concurrency=1 tests/typescript/*.test.mjs
npm run validate
```

The TypeScript suite runs 22 tests using TypeScript 6.0.3, strictest 2.0.8,
ts-reset 0.6.1, Zod 4.6.7, and Node declarations 22.20.5. These are verification
dependencies, not versions the skill imposes on a consumer repository.

| Area | Executed evidence |
| --- | --- |
| Published examples | Compile the actual Markdown TypeScript blocks for consumer contracts, exhaustive unions, and type tests; parse the actual project-config JSON examples and verify inherited paths/options |
| Literal and inference contracts | Outer map/spread checks accept extra properties; checks at fresh literal/callback locations reject them; JSX and selected union variants behave as documented; contextual `satisfies` inference and inferred filter predicates compile |
| Runtime validation and types | Zod accepts valid input, rejects invalid input, transforms output, and exposes enum values; input/output/inferred type tests and v3/v4 schema interoperability negatives compile |
| Exhaustiveness and branding | Adding a union variant fails compilation; emitted runtime fallback throws; assertions do not validate JSON; branded-ID constructors accept/reject runtime inputs |
| Strictest | Effective installed flags, exact optional properties, and nullable indexed reads checked against a strict-only control |
| Environment isolation | Browser, worker, Node and portable projects accept their own APIs and reject unavailable globals |
| Third-party globals | Synthetic hosts' incompatible `$` globals isolate; wrong-host members fail; import, triple-slash reference, and barrel leakage expose collisions with declaration checking enabled |
| Compiler graph | Composite dependencies build in order, unchanged build mode reuses state, a public-type edit invalidates downstream checks, and `tsc -p` on an empty solution is demonstrated false green |
| Diagnostic coverage | Handwritten declarations with/without `skipLibCheck`, JavaScript with/without `checkJs`, `@ts-nocheck`, hidden/tool/type-test files, uncovered source, and missing environment rows exercised |
| Incremental invalidation | Warm checks catch source, dependency-type and extended-config edits; emitted variants use distinct output and build-info paths |
| Reset scope | Dedicated application reset included, omitting it detected by a negative assertion, selected/DOM imports under Bundler and NodeNext work, and standalone library programs and packed consumers remain reset-free |
| Package contracts | `npm pack --ignore-scripts`; unpack into consumers that have only one host installed; ESM `.mts` and CJS `.cts` consumers resolve the corresponding exported declarations; Node import/require execute the packed entrypoints |

All assertions examine compiler diagnostics, emitted files, program inputs, or
runtime results. Test success does not imply universal compiler/framework support.
Markdown fixtures and parser validation are reported separately from these tests.

## Independent forward test

One independent agent received the candidate skill and a realistic task: build
a single library with two optional browser hosts defining incompatible `$`,
ESM/CJS outputs, complete checking, and reusable caches. The prompt did not
supply the intended architecture or findings. The agent generated and ran its
own temporary implementation without editing this repository.

The initial task passed with six emit projects and four declaration consumers.
It then executed supplemental extended-config/reset checks and npm-packed
consumer checks, which also passed. This is one independent setup trial with
supplemental checks, not a blinded trial for every reference or routing phrase.

Observed behavior included host isolation, ambient-leak diagnostics, strictest
negative cases, dependency/config invalidation, program-input coverage that
finds an orphan, packed exports without the unrelated host package, and Node
runtime smoke with simulated host globals. The agent also made two decision-only
walkthroughs: a code-only error fix should preserve setup; a Python-only monorepo
should not select this skill.

The agent's fixture used a legacy CommonJS/Node10 resolution pair with a TS6
compatibility exception. That was a trial-specific choice. The committed tests
instead exercise Node16/Node16 for CommonJS; the skill requires selecting settings
for the actual loader and compiler rather than prescribing that legacy pair.

## Limits and discoveries

- Synthetic host packages and Node-injected globals establish compile-time
  isolation and package loading; they do not prove real browser host behavior
  or simultaneous runtime coexistence of incompatible globals.
- The packed fixture checks local tarball exports and declarations, not a registry
  publication. Framework template checkers, remote task caches, and editor
  behavior remain outside this executable suite.
- A warm build demonstrates valid incremental reuse, not optimal performance.
  No production speedup or universal support claim follows from fixture timings.
- The first implementation of the emit test needed explicit `rootDir` for a
  stable TS6 output layout. The setup reference now calls out that decision.
- Zod 4.6.7 declarations reference `URL`; its typed fixture supplies Node types
  rather than treating the schema's primitive fields as proof of dependency
  portability. The schema reference explains checking dependency globals.
- Smoke routing scenarios include positive and negative requests, but this work
  does not measure every client's automatic skill selection.
