# vp-stack-selection Smoke Fixture

## Prompt

Use `$vp-stack-selection` to evaluate the cases below independently. Recommend
choices and necessary verification without installing dependencies, changing
repositories, or making external writes. Exclude developer familiarity and
training cost. Treat each Expected Behavior row as a separate decision scenario.

## Expected Behavior

### Scope and ecosystem fit

| Case | Expected decision |
| --- | --- |
| New repo, full-system refactor, rewrite/port, or explicit stack comparison; contrast a button fix, local rename, and isolated upgrade | Apply stack selection to the former. Keep focused changes in their existing workflows. |
| Supported Python system with an essential scientific dependency; user considers a Rust rewrite | Compare retaining Python and bounded integration before replacement. Preserve required behavior and plan migration/rollback. |
| Font CLI needs maintained fontTools subsetting and variable-font features; browser-only editor has unchecked operation coverage | Treat Python/fontTools as a strong CLI candidate without requiring TS/Rust to be impossible. Investigate the browser case separately. |
| Unlisted specialist operation, or decisive version support unavailable offline | Research domain tools; use a focused capability check or state a provisional choice. Do not choose from language reputation alone. |
| Managed .NET SDK must run in-process; supplied evidence rules out C ABI, JS bindings, and process bridges | Recommend a supported .NET ecosystem, such as C#, despite TS/Rust preferences. Confirm supported runtime and target versions. |
| Generic webhook receiver versus BFF with reusable JS logic versus no-GC service | Compare actual service clients and deployment; TS reuse is evidence, no-GC is a constraint. Do not assign Go from the backend label or invent a performance ranking. |
| Go libraries cover a worker/CLI; developers know only TS | Evaluate Go on domain support, runtime, diagnostics, and distribution. Ignore experience/training and verify native dependencies. |
| Required in-process SDK demonstrably needs GC, but a fixed contract forbids GC | Surface the verified conflict and ask which boundary may change. Do not silently choose TS, Rust, or a multi-process architecture. |
| Native CLI without an installed JS runtime versus API automation on an accepted Node.js host | Compare Rust/Go and relevant domain tools for the CLI; consider TS SDK support for the automation. |

### Web, styling, and optional capabilities

| Case | Expected decision |
| --- | --- |
| Content site with docs and one widget | Prefer Astro/Starlight where suitable; scope the widget rather than installing an application stack. |
| Application explicitly requires Vue; contrast an unconstrained app whose general product-UI preference mentions Base UI | Evaluate the specified Vue stack first. For the unconstrained app, consider Svelte; identify Base UI as React-only, and clarify if that dependency is mandatory. |
| Vue/Svelte CSR and SSR apps need scoped styles, themes, and dynamic values | Use native CSS facilities when sufficient. Do not assign Emotion/StyleX from rendering mode. |
| MUI SSR versus Base UI CSR-only versus Base UI SSR/SSG/RSC | Keep MUI's supported kit styling. Headless Base UI leaves the engine open: default to Emotion for CSR-only and StyleX for other React rendering, subject to compatibility and requirements. |
| Suitable existing CSR StyleX setup, required extraction, or supported CSS Modules setup | Preserve the fitting solution. Dynamic values do not exclude StyleX; React does not require a CSS-in-JS engine. |
| Required kit's styling cannot support the required rendering setup | Both kit and non-kit diagram paths must reach compatibility checks. Surface fixed-choice conflicts instead of silently changing the engine or kit. |
| Custom React UI needs remote data, shared client state, and isolated reusable components | Compare relevant TanStack packages, nanostores, and Storybook only for those needs. Plan Compiler/Doctor checks during adoption; do not install all tools to answer a design request. |

### Packaging and toolchain ownership

| Case | Expected decision |
| --- | --- |
| Standard TS library needs exports and declarations; contrast an embedded custom bundler API | Prefer tsdown for ordinary packaging. Evaluate direct Rolldown for the engine/API need without requiring arbitrary failed attempts at tsdown. Plan packed-consumer checks. |
| Existing CJS consumer contract during a rewrite | Preserve it or propose an explicit breaking release and migration. ESM preference alone does not remove the contract. |
| Vite+ fits; user prefers mise and Husky/lint-staged; contrast a compatible lower-cost standalone setup | Compare technical cost and preserve explicit/suitable choices. Avoid competing version managers, hook dispatchers, and staged schedulers. |
| Go-only repo has no JS checks | Do not recommend Husky/lint-staged merely from the toolchain diagram. Its hook preference is TS-scoped. |
| Single published TS library, published library monorepo, and private app-only workspace | Consider Changesets for either package-release case; use pnpm workspaces for workspace management. Omit unneeded release tooling for private apps. |
| Generated CHANGELOG.md and authored changeset entries | Exclude generated changelogs from formatting/linting, including explicit staged inputs; keep authored entries checked unless repository policy differs. |

### Release-channel decisions

| Case | Expected decision |
| --- | --- |
| An alpha, beta, RC, preview, or nightly candidate provides a needed capability and representative compatibility checks pass | Keep it eligible; compare technical benefit, known gaps, maintenance, and rollback against stable alternatives. Record the channel and exact tested version instead of excluding it by label. |
| A stable release and a newer preview meet the same requirements, but the preview breaks a required framework checker | Select the compatible candidate or identify a verified bridge; do not adopt the preview solely because it is newer. |
| Native TypeScript caches pass regression checks, but the existing linter needs a JavaScript compiler API | Evaluate separate checker/API compiler roles with explicit entrypoints and pins. Neither reject the native checker by release label nor silently replace the API dependency. |
| An integrated linter reports compiler diagnostics and the separate compiler has a working warm cache | Compare complete diagnostic/project coverage and measured cached costs before removing the compiler command; lint success is insufficient evidence. |

### Native and shared applications

| Case | Expected decision |
| --- | --- |
| Android lifecycle/background APIs; essential JVM service libraries | Evaluate Kotlin/Compose or Kotlin/JVM on capability evidence. Preserve Gradle Wrapper and SDK version ownership. |
| Apple extensions/native UI; separate app shares logic but keeps platform UIs | Evaluate Swift/SwiftUI/native interop and Kotlin Multiplatform or another shared core as appropriate. Sharing logic does not require sharing UI. |
| Shared Android/iOS UI with a few native APIs; one Flutter plugin fails requirements | Compare Flutter, React Native, Compose Multiplatform, and native approaches. Native APIs do not automatically exclude Flutter; a failed plugin does not restrict fallback to native only. |
| Proposed Flutter, Rust, Kotlin, or Swift stack before implementation | Keep release/device/consumer tests as adoption checks. Compilation on one target does not prove another; do not run full implementation acceptance for a design-only request. |

## Regression Coverage

- Explicit choices and contracts before defaults; technical evidence before
  TypeScript/Rust preference; no team-experience weighting.
- Domain-library maturity, unlisted ecosystems, uncertain evidence, and rewrite scope.
- Agreement between diagrams and prose, including fallback and conflict paths.
- Framework-native styling, kit priority, and overridable React preferences.
- Package versus workspace tooling and TS-only hooks.
- Selection evidence versus later adoption checks and authorization.

Static fixture checks verify structure, not decisions. Report manual walkthroughs,
syntax/parser checks, and independent agent trials separately.

## Independent trial: 2026-10-15

Three fresh-context agents each answered three requests using the skill and
relevant references. They did not receive expected answers or read this fixture.
The parent agent assessed the responses against the stated requirements.

| Scenario | Observed recommendation | Result |
| --- | --- | --- |
| Font operations covered by fontTools; Python distribution accepted | Python/fontTools over reimplementing semantics in TS/Rust | Pass |
| Required worker/CLI operations covered by maintained Go client | Go, without claiming a performance advantage | Pass |
| Required in-process managed .NET SDK; bridges prohibited | C#/.NET, with runtime/platform support still to confirm | Pass |
| Vue explicitly required; supported kit styles and scoped CSS | Keep Vue and native/kit styling; Nuxt offered as an application-framework candidate | Pass |
| MUI fixed; supplied Emotion SSR fixture passes | Keep MUI/Emotion despite the independent StyleX preference | Pass |
| Existing CSR StyleX meets extraction and dynamic-value requirements | Keep StyleX; do not add a styling migration | Pass |
| Single public ESM TS library with declarations and versioned releases | tsdown and Changesets without a monorepo requirement | Pass |
| Embedded bundler needs proven lower-level APIs | Direct Rolldown for that feature; release packaging remains a separate choice | Pass |
| Go-only repository with supported existing CI | Keep Go tooling; omit unrelated JS tools | Pass |

No instruction fix was needed. Capability probes were supplied test facts;
agents did not rerun them or perform application builds, installs, or mutations.
This trial checks decision behavior, not live integration compatibility.

## Package integration trial: 2026-10-15

Executable checks used isolated, ignored local fixtures, exact dependency versions,
and production builds. A separate consumer installed only the packed library;
browser checks used a dedicated Chrome session through a local HTTPS route.
Repository dependencies were unchanged.

| Combination | Checks performed | Result |
| --- | --- | --- |
| MUI + Emotion + React SSR | Request-scoped cache and critical CSS in server HTML; two equivalent requests; matching computed theme color; hydrated counter changed from 0 to 1 | Pass; no captured console, runtime, or recoverable hydration errors |
| Base UI + StyleX + React CSR | Production CSS extraction with layers; computed color; dynamic width changed from 96px to 144px; styled dialog portal; close button and Escape | Pass; no captured console or runtime errors |
| tsdown ESM library | Root and two public subpath imports from tarball; private source import rejected; declarations resolved in a clean NodeNext consumer; invalid input and return assignments rejected | Pass |

Versions: Node.js 26.12.0; pnpm 11.25.0; TypeScript 7.0.2; React/React DOM
19.3.1; MUI 9.5.0; Emotion React/cache/server 11.14.0/11.14.0/11.11.0;
Emotion styled 11.14.1; Base UI 1.9.0; StyleX and its unplugin 0.19.1;
unplugin 2.3.11; Vite 8.3.4; React Vite plugin 6.1.2; tsdown 0.23.1;
resolved Rolldown 1.2.14.

Fixture corrections: add Vite client types for CSS imports, give the library its
own tsconfig inputs/declaration settings, and check MUI's CSS variable rather than
assuming a literal background declaration. These were fixture errors, not
demonstrated package defects. StyleX used the documented plugin order and CSS entry.

Limit: tsdown reported its TypeScript 7 API integration as experimental despite
successful emission and consumer checks. This trial does not establish support for
all compiler options. It also does not cover streaming/RSC, StyleX SSR, Storybook,
React Compiler/Doctor, Vite+, alternate runtimes, native platforms, or performance.
These results apply to the tested versions and paths, not every stack in this skill.

## Manual release-channel walkthrough: 2026-10-17 (Asia/Taipei)

Walked the four release-channel scenarios through the updated decision rules and
TypeScript/toolchain references. Each prerelease label remains eligible, a
required checker incompatibility still blocks that candidate, separate API and
checker roles remain possible, and compiler removal requires coverage evidence.
This was a manual walkthrough by the editing agent, not an independent agent
trial or a new package-integration benchmark.
