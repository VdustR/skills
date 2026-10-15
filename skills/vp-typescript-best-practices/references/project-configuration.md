# Compiler Projects and Environment Boundaries

## Decide boundaries by contracts

Multiple tsconfigs are useful within a single package as well as a monorepo.
A compiler project owns a set of inputs, ambient declarations, compiler options,
and outputs. Package layout alone does not determine these contracts.

Before editing, build a matrix of source/entrypoint, runtime, ambient packages,
module resolution, output/declaration format, verification command, and cache.
Use the smallest set of projects that preserves every supported contract:

| Difference | Strategy |
| --- | --- |
| Browser, Node, worker, test, or tool globals differ | Separate checking projects with explicit `lib` and `types` |
| Optional integrations declare incompatible globals such as `$` | Separate adapter/consumer projects; load only the selected host's declarations |
| The same source targets different module systems, runtime versions, or declarations | Build/check variants extending a common safety base, each with compatible module resolution and distinct outputs/cache |
| Only output location or emit mode differs | Extend the relevant environment config; do not duplicate unrelated runtime partitions |
| A TypeScript monorepo has multiple packages | Give each TypeScript package its own leaf project(s), split further by the contracts above, and orchestrate them from the root |
| A single environment and output contract suffice | Keep one project; multiple config files are not a goal by themselves |

Do not create a Cartesian product of every setting. Separate only combinations
that consumers actually use. Build configs may exclude tests while verification
configs still check them. Do not inherit `noEmit` into a declaration build by
accident; inspect effective options and emitted files for every output variant.
Set `rootDir` explicitly when package output paths depend on source layout;
inspect the installed compiler's inferred output paths before publishing.
Changing `target` or `lib` does not polyfill runtime APIs.

## Conflicting third-party globals

If integration A and integration B both declare `$` with different types, check
them in separate programs. Keep portable core files free of host globals and
check core independently; each adapter and its consumer fixture loads only its
own host declarations. For example:

```text
tsconfig.base.json          shared strictness; no host globals
tsconfig.core.json          portable core
integrations/a/tsconfig.json  core usage + host A globals
integrations/b/tsconfig.json  core usage + host B globals
tsconfig.build.json         selected emit contract, if needed
```

Choose explicit `types` entries for package-provided ambient declarations. Use
`files`/`include` for owned declarations; use `typeRoots` only when custom ambient
package discovery is required, since it replaces the default discovery roots.
Prefer module-scoped host APIs or injected dependencies when compatible with
the library's real runtime contract. Do not rename a third-party global type or
merge incompatible declarations merely to silence a collision.

`types: []` and `exclude` are not sandboxes: imports, triple-slash references,
and transitive global augmentations can still load declarations. Inspect program
inputs and resolution when unwanted globals appear. A barrel that re-exports all
optional integrations may pull both hosts into a consumer; keep optional public
entrypoints and their declaration dependencies separate. Verify packed consumer
fixtures for each supported integration without installing unrelated host types.

Separate compiler programs isolate compile-time environments, not runtime global
objects. If both integrations run together and both require incompatible `$`
globals, splitting tsconfig cannot solve that runtime conflict. Model the real
coexistence contract or state the unsupported combination; do not claim support
from two independent successful builds.

## Apply the strategy in a TypeScript monorepo

Use a shared safety base with leaf projects for each TypeScript package, then
split each leaf further when its environments, host integrations, or build
contracts differ. A root solution or task graph must invoke all supported leaves
and variants, including repository-root tooling. Keep package dependencies,
references, exports, and output ordering aligned; a root catch-all config is not
a substitute for these boundaries. Non-TypeScript packages keep their own
language tooling. Reuse the same coverage and cache verification used for a
single package; monorepo layout does not create a different type system.

## Choose a graph that matches the build

| Design | Choose when | Required checks |
| --- | --- | --- |
| Composite project references | Packages consume generated declarations and benefit from dependency-aware build ordering | `composite`, declaration/output contracts, references, clean and incremental `tsc -b` |
| Independent no-emit projects | A bundler owns emit and projects check source directly | Explicit root task enumerating every leaf, dependency ordering where needed, unique incremental state |

A root solution config may use `files: []` and `references`, but `tsc -p` on that
empty root does not check its references. Use build mode for a supported graph,
or an explicit task that executes all no-emit projects. Do not assume every
`noEmit` leaf can be used as a declaration dependency: validate the installed
compiler's build-mode constraints and dependency outputs. `references` are not
inherited through `extends` and do not replace package exports or dependencies.

Do not assume TypeScript `paths` rewrites runtime imports. Align package exports,
workspace dependencies, runtime resolution, bundler, tests, and declarations.
Avoid importing another package's private source merely to bypass its contract.

## Shared strictness, separate environments

Illustrative base for a bundler-owned setup; select `target`, module resolution,
and JSX options for the actual runtime and compiler:

```json
{
  "extends": "@tsconfig/strictest/tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "incremental": true,
    "noEmit": true,
    "types": []
  }
}
```

Pin compatible dependency versions through the repository lockfile. Inspect the
installed strictest base and `tsc -p <leaf> --showConfig`; do not maintain a stale
copy of its flags or equate `strict: true` with strictest. Later bases and leaf
settings can override it. `skipLibCheck` may be inherited: record it and verify
handwritten declarations and published declaration consumers separately rather
than claiming all declarations were checked. Prefer `skipLibCheck: false` where
compatible, especially for a declaration validation project.

Keep include patterns and cache paths in the leaf; relative paths in an extended
config resolve relative to that config. Array properties such as `lib` and
`types`, and top-level `include`/`exclude`/`files`, are replaced rather than merged.

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "tsBuildInfoFile": "../../.cache/tsc/web-app.tsbuildinfo"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "reset.d.ts"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.tsx", "src/workers"]
}
```

The excluded tests, stories, and workers require their own checking projects.
Use a worker leaf with `lib: ["ES2022", "WebWorker"]` and explicit `types`;
use a Node leaf with `lib: ["ES2022"]`, `types: ["node"]`, and module settings
suited to the actual Node loader, such as a compatible NodeNext pair. Isolate
browser tests from Node tests as needed. Test and Storybook globals belong only
to the projects that need them. Shared portable packages should not acquire DOM
or Node globals by inheriting an application base.

`types: []` limits automatic ambient package inclusion; it does not prohibit
imports. `exclude` also does not prevent an imported file from entering a
program. Trace the actual program and enforce runtime package boundaries with
exports or lint rules where compiler configuration alone is insufficient.

## Matt Pocock's ts-reset

For an application that adopts `@total-typescript/ts-reset`, create a dedicated
`reset.d.ts` containing only:

```ts
import "@total-typescript/ts-reset";
```

Include it explicitly in each intended application checking project; extending
a config does not automatically include its declaration files. Choose supported
subpath imports for selected rules; opt into `/dom` only in DOM environments.
Check installed exports and compatible module resolution. Validate JSON as
`unknown` after the reset rather than asserting a payload type.

The reset modifies globals across a program. Keep it out of a shared ambient
base, library source exports, and emitted public declarations. A library must
also type-check without the app's reset; test a packed consumer without it.

## Caches and efficiency

Give each package/environment/build variant a unique writable `tsBuildInfoFile`
in ignored cache storage. Never let concurrent projects write the same state or
output directory. Preserve incremental state locally; run cold checks in isolated cache storage rather
than deleting unrelated caches. Composite outputs and build info must remain
consistent when restored.

For task or CI caches, include compiler/tool versions, lockfiles, effective
configs and their extended bases, source inputs, relevant environment values,
and dependency contracts. Cache type-check tasks separately from bundler output;
a bundler cache hit is not a type-check result. Do not cache a coverage inventory
without accounting for file additions and deletions. Verify invalidation before
trusting reuse. Measure cold/warm checks and an edited dependency; reduce redundant
programs only while preserving environment boundaries and complete coverage.

## Sources

- [Ambient type inclusion](https://www.typescriptlang.org/tsconfig/types.html)
- [Custom type discovery](https://www.typescriptlang.org/tsconfig/typeRoots.html)
- [Library declaration structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)
- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript performance guidance](https://github.com/microsoft/TypeScript/wiki/Performance)
- [TSConfig reference](https://www.typescriptlang.org/tsconfig/)
- [Community-maintained strictest base](https://github.com/tsconfig/bases/blob/main/bases/strictest.json)
- [Matt Pocock's ts-reset documentation](https://www.totaltypescript.com/ts-reset)
