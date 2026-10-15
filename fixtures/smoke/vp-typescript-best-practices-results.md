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
PLAYWRIGHT_BROWSERS_PATH=.cache/playwright npx playwright install chromium
npm run validate:browser
```

The TypeScript suite runs 47 tests using TypeScript 6.0.3, strictest 2.0.8,
ts-reset 0.6.1, Zod 4.6.7, and Node declarations 22.20.5. These are verification
dependencies, not versions the skill imposes on a consumer repository. Local
execution uses Node 26.12.0; CI uses the Node 22 line.

| Area | Executed evidence |
| --- | --- |
| Published examples | Compile the actual Markdown TypeScript blocks for consumer contracts, exhaustive unions, and type tests; parse the actual project-config JSON examples and verify inherited paths/options |
| Literal and inference contracts | Outer map/spread checks accept extra properties; checks at fresh literal/callback locations reject them; JSX and selected union variants behave as documented; contextual `satisfies` inference and inferred filter predicates compile |
| Runtime validation and types | Zod accepts valid input, rejects invalid input, transforms output, and exposes enum values; input/output/inferred type tests and v3/v4 schema interoperability negatives compile |
| Exhaustiveness and branding | Adding a union variant fails compilation; emitted runtime fallback throws; assertions do not validate JSON; branded-ID constructors accept/reject runtime inputs |
| Strictest | Effective installed flags, exact optional properties, and nullable indexed reads checked against a strict-only control |
| Environment isolation | Browser, worker, Node and portable projects accept their own APIs and reject unavailable globals |
| Third-party globals | Synthetic hosts' incompatible `$` globals isolate; wrong-host members fail; import, triple-slash reference, and barrel leakage expose collisions with declaration checking enabled |
| Runtime resolution | Emitted imports retain `paths` aliases and fail without a runtime resolver; a higher `lib` with a lower `target` does not supply a missing runtime API |
| Compiler graph | Composite dependencies build in order, unchanged build mode reuses state, a public-type edit invalidates downstream checks, and `tsc -p` on an empty solution is demonstrated false green |
| Diagnostic coverage | Handwritten declarations with/without `skipLibCheck`, JavaScript with/without `checkJs`, `@ts-nocheck`, hidden/tool/type-test files, uncovered source, and missing environment rows exercised |
| Incremental invalidation | Warm checks catch source, dependency-type and extended-config edits; emitted variants use distinct output and build-info paths |
| Reset scope | Dedicated application reset included, omitting it detected by a negative assertion, selected/DOM imports under Bundler and NodeNext work, and standalone library programs and packed consumers remain reset-free |
| Package contracts | `npm pack --ignore-scripts`; unpack into consumers that have only one host installed; ESM `.mts` and CJS `.cts` consumers resolve the corresponding exported declarations; Node import/require execute the packed entrypoints |

All assertions examine compiler diagnostics, emitted files, program inputs, or
runtime results. Test success does not imply universal compiler/framework support.
Markdown fixtures and parser validation are reported separately from these tests.

## Browser, editor, framework, and remote-cache checks

The follow-up suite uses real jQuery 3.7.1 / Zepto 1.2.0 and Lodash 4.18.1 /
Underscore 1.13.8, with their locked DefinitelyTyped packages. Each host's
ambient declarations pass separately. Mixing jQuery and Zepto produces
TS2451 on `$`. Mixing Lodash and Underscore can compile a Lodash-specific API
without a duplicate diagnostic while rejecting an Underscore-specific API.
Distinct module imports accept both APIs. This demonstrates why a duplicate
error alone is an insufficient boundary check.

The separate `validate:browser` test builds the actual published browser/Node
JSON examples, executes Node output, and runs browser output in headless Chromium
through Playwright 1.61.1. It loads real vendor scripts, observes overwritten
`$` / `_`, applies the documented `noConflict()` calls, and checks both libraries'
DOM/object operations through aliases. CI installs its matching Chromium binary;
ordinary repository validation does not silently skip a browser assertion.

Two framework tests use Vue 3.5.44 / vue-tsc 3.3.13 and Svelte 5.57.2 /
svelte-check 4.7.6. Valid typed templates pass. After changing `number.toFixed`
to `number.toUpperCase`, vanilla `tsc` succeeds while the complete npm command
fails and names the component. The inventory confirms that plain TypeScript's
program never included those component files.

The editor test runs the installed TypeScript tsserver protocol, opens sibling
browser and Node files, checks `projectInfo` against their nearest configs, and
checks semantic diagnostics for `process` / `document` leakage. This exercises
the editor's language-service engine; it is not a VS Code UI test.

Three additional tests execute the actual Markdown configs and native Node
stripping: runtime enums, const enums, value-bearing namespaces and parameter
properties fail TS1294; type-only namespaces pass. Native Node executes erasable
code and even type-invalid code, but rejects runtime enum/namespace syntax.
Compiler validation remains necessary.

The CI `cache-seed` job builds a two-project composite fixture and saves outputs,
build info, sources and their hash manifest through GitHub Actions cache. On a
fresh runner, `cache-restore` requires an exact-key hit, verifies hashes and
lockfile and emitted contracts, requires a subsequent unchanged build to reuse
both projects, then changes a
shared public type and requires downstream TS2322. The cache key includes OS,
run/attempt, lockfile and the generator script containing all fixture inputs.
A fresh runner's npm install can make the extended strictest config newer than
restored outputs; the compiler may revalidate and update unchanged timestamps
on the first build. The test allows that work, verifies identical emitted
contracts, then requires the next build to skip both projects. This is a provider
round-trip test, not a production task-cache configuration.
The same seed/restore assertions also execute locally. A local sample measured
597 ms cold and 119 ms warm for two projects; one sample is not a benchmark or
a production speedup claim.

## Code-contract guidance verification

Four focused changes cover construction checks, runtime validation, public API
contracts, and type-design cost. Ten additional tests directly execute the
published examples or their documented verification commands:

| Area | Executed evidence and self-review outcome |
| --- | --- |
| Construction | Both conditional branches reject inserted unknown fields, including the empty branch; removing its local contract reproduces the missed diagnostic. Active/inactive button behavior remains unchanged. Existing map, JSX, structural-typing, and union-variant regressions still apply. |
| Runtime contracts | A subset predicate compiles but fails in the false branch at runtime. Published guards exercise numeric boundaries and rejected values. Assertion-function failure paths execute. Published Zod output, strictness, coercion controls, key-retention policies, and transformation order are checked. Schema policy is selected per caller, rather than prescribed globally. |
| Public APIs | The published `pick` retains its literal union, rejects a dependent value outside the choices, and checks runtime membership. Removing `NoInfer` makes a negative consumer assertion unused. The published snapshot accepts frozen inputs, isolates array storage, and demonstrably shares nested references; it does not promise deep immutability. |
| Type performance | Execute the published diagnostic and trace commands on an 80-property consumer; verify actual checking and trace artifacts. Widening the path API invalidates the same negative consumer tests. No elapsed-time threshold or speedup claim is inferred from this test. |

Each topic received a source/diff and example review before the next topic. Final
integration reviews the entrypoint, metadata, existing references, and regression
suite together. This is author self-review with executable checks, not an
independent agent trial or a guarantee of improved behavior for every request.

Manual routing walkthroughs select consumer contracts for fixture/spread work,
runtime validation for a custom guard or parsing policy, public API contracts
for generic inference or sharing, and type performance for slow checking. They
retain project setup for environment/config work and avoid configuration or
dependency changes for a code-only request. Existing instruction coverage is
preserved; the earlier trimming candidate was not adopted.

## Independent project-setup forward test

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

A subsequent independent technical review found that the shared JSON base
example omitted `lib`, allowing TypeScript's default DOM declarations into a
core leaf that only extended the example. The separate test harness had an
ES-only base and therefore did not expose the example defect. The example now
sets `lib: ["ES2022"]`; a regression directly loads the Markdown JSON and
verifies that a portable leaf rejects `document` while an explicit browser leaf
accepts it. This review found one defect before correction, not an all-clear
initial review.

## Independent description routing trial

A second agent saw only the repository skill names/descriptions at that trial and 12
requests, without skill bodies, prior conclusions, or expected answers. Its first
classification matched the expected primary route for all 12:

| Request | Primary route observed |
| --- | --- |
| A: `.mts` helper preserving literal-key types and type tests | TypeScript |
| B: one library with two host `$` declarations | TypeScript |
| C: one library's ESM/CJS builds and declarations | TypeScript |
| D: worker incorrectly sees `document` | TypeScript |
| E: warm cache hides unchecked `.tsx` files | TypeScript |
| F: strictest/reset setup with library consumers preserved | TypeScript |
| G: Python-only monorepo layout | None |
| H: zsh `$` escaping | None |
| I: Zod major-version upgrade | Dependency upgrade |
| J: author-side GitHub review comment resolution | PR comment resolver; TypeScript secondary |
| K: one narrowing fix with settings/dependencies unchanged | TypeScript; configuration changes out of scope |
| L: plain JavaScript runtime global coexistence | None |

The [raw requests and classifications](vp-typescript-routing-results.json) are
retained for re-evaluation. This is a one-run catalog-choice trial, not a measurement of every client's
actual automatic invocation. The setup trial and routing trial are distinct.

## Limits and discoveries

- Runtime evidence covers the named libraries in Chromium, framework evidence
  covers Vue/Svelte template checks, editor evidence covers tsserver, and cache
  evidence covers GitHub Actions. It does not establish all browsers, frameworks,
  editor clients, cache providers, or a registry publication.
- A warm build demonstrates valid incremental reuse, not optimal performance.
  No production speedup or universal support claim follows from fixture timings.
- The first implementation of the emit test needed explicit `rootDir` for a
  stable TS6 output layout. The setup reference now calls out that decision.
- Zod 4.6.7 declarations reference `URL`; its typed fixture supplies Node types
  rather than treating the schema's primitive fields as proof of dependency
  portability. The schema reference explains checking dependency globals.
- Smoke routing scenarios include positive and negative requests, but this work
  does not measure every client's automatic skill selection.

Skill Creator's frontmatter validator also passed in an isolated PyYAML 6.0.3
environment; no global Python package installation was required.
