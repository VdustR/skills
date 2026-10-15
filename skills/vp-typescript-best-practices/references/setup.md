# TypeScript Project Setup

Use this workflow for a new TypeScript project, compiler configuration changes,
build targets, conflicting global declarations, or an audit of type-check
coverage/performance. It applies to a single package and to TypeScript packages
in a monorepo. Do not redesign a workspace or tighten configuration as an
incidental fix for an unrelated implementation error.

1. Inventory installed compiler/library versions, source and integration
   entrypoints, runtimes, ambient declarations, build/declaration consumers,
   scripts, and CI. Map each file/entrypoint to its supported environment and
   output contracts before choosing projects.
2. Read [project configuration](project-configuration.md) for the boundary
   matrix, conflicting globals, shared strictest base, build variants, root
   orchestration, and caches. TypeScript monorepos use package-level leaf
   projects; single packages split when environment or build contracts differ.
3. Use `@tsconfig/strictest` as the safety baseline. Inspect effective settings
   after inheritance and overrides; document compatibility exceptions.
   `strict: true` alone is not equivalent. Keep runtime globals out of the
   shared base and isolate cache/output paths for each active project/variant.
4. Address Matt Pocock's `@total-typescript/ts-reset` explicitly. Include a
   dedicated application-owned `reset.d.ts` in every intended project, or
   document the application compatibility limit. Keep resets out of published
   library declarations and library consumer checks. It changes global types,
   not runtime behavior, and does not replace validation.
5. Read [project verification](project-verification.md). Wire every project into
   the root command and CI; prove file coverage and every supported environment
   in the matrix, including tests, tools, hidden configs, and declarations.
   Exercise negative cases and cold/warm cache invalidation before reporting
   isolation or performance gains.

Report the project/environment matrix, effective strictness and exceptions,
ts-reset decision, verification commands, uncovered files or environments,
and measured timings with their limits. Do not claim optimal efficiency from
one warm run or complete coverage from a successful compiler exit status.
