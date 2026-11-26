# Bun-first JavaScript and TypeScript

Prefer Bun for new JS/TS projects when no explicit choice or fixed host contract
overrides it. This covers installation, scripts, builds, development servers,
production serving, tests, and checks. Preserve supported existing stacks for
focused work; this default does not authorize migration.

## One repository, one toolchain

A monorepo has one root package-manager choice, one authoritative lockfile, and
one runtime policy for owned JS/TS tooling across packages, local development,
CI, and deployment. Default to Bun workspaces and pinned Bun versions. Do not
keep pnpm installation alongside Bun installation, alternate lockfiles, or a
routine Node fallback for individual packages, scripts, tests, or servers.

Specialized compilers, framework checkers, and native binaries can belong to a
Bun toolchain; verify that their JS entry points and child processes run under
Bun without a hidden Node requirement. A library's promised Node consumer tests
are a compatibility boundary, not a second development toolchain. A fixed Node
production host is different: if that required host cannot change, choose the
whole Node.js + pnpm stack rather than a hybrid.

## Decide before falling back

1. Identify the necessary behavior and immutable contracts. Reproduce the
   limitation with exact dependency/runtime versions and a relevant negative
   control. A package's name, Node-oriented documentation, or monorepo size is
   not evidence that Bun cannot support it.
2. Compare supported configuration, a compatible release, declarative dependency
   metadata, and established alternative libraries or adapters. Verify the
   smallest reasonable solution against the original behavior, including error
   handling, clean installation, and frozen reinstallation when relevant.
3. Retain Bun when a solution preserves required semantics at reasonable
   maintenance cost. Examples to investigate include `packageExtensions` for
   missing dependencies, explicit DOM preload/compiler plugins for tests, and
   a framework checker or declaration emitter executed by Bun. Lockfile migration
   alone does not prove a fresh install reproduces imperative pnpm hooks.
4. If a necessary constraint still has no reasonable verified solution, switch
   the entire repository to Node.js + pnpm. Record the failing case, attempted
   alternatives, remaining impact, and why the solution cost is unreasonable.
   Examples can include an immutable Node host, required V8-specific semantics,
   or an indispensable SDK whose needed behavior fails under Bun. Recheck the
   exact versions; these are investigation categories, not permanent exclusions.

A solution is unreasonable when it weakens required correctness or security,
depends on repeated manual node_modules edits, or requires disproportionate
architectural changes or ongoing maintenance merely to retain Bun. A small,
tested, supported configuration change is not such a reason. Experimental
releases remain eligible under the main selection rules, but their label alone
does not establish a solution. If decisive evidence is unavailable, mark the
choice provisional rather than claiming that either stack passed.

## Tests, type checks, and builds

Default new tests to `bun test`. Verify required mocking, timers, snapshots,
coverage thresholds, environment setup, isolation, and worker behavior. Do not
assume Vitest/Jest APIs or environment comments are interchangeable with Bun's
runner. Prefer explicit supported setup and native APIs where they preserve the
required behavior; do not discard useful tests to obtain a pass.

Default ordinary TS checking to native `bun check`; use `bun check --no-script`
when verifying that native checking rather than a package script ran. Preserve
`@tsconfig/strictest`, application-owned `@total-typescript/ts-reset`, actual
input coverage, and compatible compiler versions. Bun's checker currently uses
TypeScript 7 and never emits files. It does not replace Vue/Svelte template
checking or declaration emission. Add framework-aware checks and an emitter
under Bun where needed. Verify an invalid template/type, downstream errors after
an upstream declaration change, and packed consumers without application resets.
An empty or skipped input set must not count as passing verification.

Prefer fitting Vite+ integration under the TypeScript guidance, while checking
each required build/test/check/serve command and its workers under Bun. Bun
installation support does not prove every Vite+ command executes under Bun.
Compare a supported standalone pipeline before abandoning the Bun toolchain.

## Adoption evidence

Record pins, target OS/architecture/libc, command lines, and actual runtime
identity at meaningful entry points and child workers. `process.versions.bun`
identifies Bun; `process.versions.node` alone does not identify Node. Inspect
shebang dispatch and use a supported explicit Bun invocation where needed;
do not globally alias Node to Bun. A controlled environment without Node helps
detect accidental fallback but does not prove all production behavior.

Match checks to the project: fresh/frozen workspace installs and peer bindings;
required native modules and Node APIs; framework compilation and browser
interaction; packed exports, declarations, and assets; production routes,
observability, graceful shutdown, and restart. Test relevant failure paths and
repeat decisive checks. A local Linux container is not evidence for WSL mounts,
file watching, a real cloud host, or long-term production reliability. Report
observed behavior separately from remaining platform and workload assumptions.

## Sources

Reviewed November 26, 2026. Recheck exact versions before adoption:

- [Bun workspaces](https://bun.sh/docs/pm/workspaces) and
  [package extensions](https://bun.sh/docs/pm/package-extensions).
- [Bun type checking](https://bun.sh/docs/runtime/check),
  [test runner](https://bun.sh/docs/test), and
  [Node.js compatibility](https://bun.sh/docs/runtime/nodejs-compat).
- [Vue TypeScript checking](https://vuejs.org/guide/typescript/overview) and
  [Svelte TypeScript support](https://svelte.dev/docs/svelte/typescript).
