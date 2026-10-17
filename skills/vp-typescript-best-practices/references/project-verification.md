# Verify Coverage, Isolation, and Cache Correctness

Use the repository's package runner and installed compiler. Keep temporary
negative fixtures outside production output and restore only your own edits.

## 1. Prove file and environment coverage independently

Inventory maintained files from version control plus new/untracked workspace
files, including dot directories. Classify every file: TypeScript-family source
(`.ts`, `.tsx`, `.mts`, `.cts`, including handwritten declaration variants),
JavaScript requiring `allowJs`/`checkJs`, framework files requiring their checker,
generated output, or non-code with its appropriate validator. Do not claim that
`tsc` checks JSON, styles, Vue/Svelte templates, or unchecked JavaScript.

For each leaf actually invoked by the root command, collect compiler-resolved
inputs with `tsc -p <leaf> --listFilesOnly`, `--explainFiles`, or the matching
TypeScript config/program API. Resolve paths consistently, then compare the
inventory with the union of checked inputs. A glob listing alone is not proof.
A root solution's file list is not the union of its references.

Fail on uncovered maintained source files. Document generated/vendor exclusions
with their owner and regeneration/check step; excluding a hard file is not a
fix. Review overlaps: imported shared source can legitimately appear in multiple
programs, but accidental overlap can leak globals and repeat work. A file being
listed does not mean all its diagnostics run: verify `checkJs`, `skipLibCheck`,
`@ts-nocheck`, and suppressed diagnostics for the promised scope.

The union proves only that a file was checked somewhere. Also compare against
an explicit file/entrypoint-to-environment matrix: shared source promised for
Node and browser must be checked under both contracts. Build-only exclusions
must not remove files from verification. Include each supported optional
integration and output/declaration variant; record intentionally unsupported
combinations rather than constructing every possible environment permutation.

Make these comparisons a repeatable repository check that fails when an orphan
file is added. Include root scripts, hidden configs, tests, stories, fixtures,
workers, and `.test-d.ts` type tests. Re-run it after every project split.

## 2. Exercise boundaries and diagnostics

- Place a temporary type error in each environment, including a test, story,
  root tool, worker, and type-test file when present. The root command must fail.
- In a browser-only project, using Node globals must fail; in a Node-only
  project, `document` must fail. In a worker project, `document` must fail while
  worker APIs remain available. Framework globals are allowed only where intended.
- For hosts with conflicting `$` declarations, confirm each isolated adapter
  and consumer fixture passes, host-specific members from the other integration
  fail, and importing the other host's global declarations exposes the conflict
  with declaration checking enabled. Do not hide it with `skipLibCheck`. UMD
  globals such as Lodash/Underscore `_` may silently resolve to one API; test
  host-specific members and runtime behavior rather than requiring a duplicate
  declaration diagnostic in every case.
- For the same source built in multiple formats/environments, run every supported
  variant, inspect runtime-compatible imports/outputs and declarations, and
  verify separate cache/output paths. A single successful build is insufficient.
- Check nullable indexed access and exact optional properties under the effective
  strictest options. Explain any intentionally overridden option.
- Verify handwritten declaration diagnostics through a project that does not skip
  them, and verify library consumers without application ts-reset imports.
- Where ts-reset is adopted, confirm its expected JSON result is `unknown` in
  every intended application project and absent from portable library checks.

Use negative type tests with meaningful assertions; a false-green command that
never included the fixture must not count as a successful isolation check.

For Vue/Svelte or another component format, inject an error into a typed
template and run its actual checker through the root command. A successful
`tsc` program inventory does not cover a template absent from the program.
Verify editor project selection through the editor or tsserver `projectInfo`
and semantic diagnostics: sibling browser and Node files must select the
intended leaf, rather than an inferred or overly broad project.

## 3. Exercise cache behavior

Run the root command cold, then unchanged with a warm cache. Record elapsed time,
compiler version, command, project count, and cache state; do not infer an
optimal setup from one timing sample. Confirm distinct build-info files and
non-conflicting build outputs exist. Inspect verbose reasons/extended diagnostics
to establish reuse; a faster second run or an existing build-info file alone is
insufficient. Report compiler reuse separately from task-runner cache hits.

Introduce a source error after warming: the root command must fail. Change a
shared dependency's public type and verify downstream diagnostics update. Change
a shared global declaration loaded outside a consumer's include glob, and verify
that consumer updates too. After each error-producing change, run twice without
clearing caches: both runs must fail with the expected diagnostic in the
consumer. Restore the valid input and require success, then unchanged reuse.
Include imported workspace source outside the consumer's include glob, not only
files owned directly by one project. Check missing project references when build
mode owns the graph. These cases are especially important before changing a
native/nightly pin or replacing a compiler check with linter diagnostics.
Change a leaf or extended compiler config and verify it is not skipped by a task cache.
Add an unowned source file and confirm the independent coverage gate fails even
when all existing projects are cached. Where declaration output is required,
verify a clean build and consistent restoration of outputs plus build info.

Report executable results separately from manual scenario walkthroughs and
untested framework/tool combinations. Do not claim speed improvements without
comparable measurements or complete coverage from successful exit status alone.

When remote caching is used, save outputs and build info on one runner and
restore them on a fresh runner. Verify artifact hashes and unchanged outputs.
Inspect any timestamp-based revalidation after dependency installation, then
require a subsequent unchanged build to reuse state. Edit a dependency contract
and require fresh downstream diagnostics. A
local directory copy does not verify the remote provider. Keep a verification
cache isolated from production caches, require an exact-key hit, and include
all generated-fixture inputs in its key.
