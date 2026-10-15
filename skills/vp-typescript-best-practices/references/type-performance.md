# Type-Checking Performance

Optimize a measured bottleneck while preserving the API that consumers use.
A shorter type definition or fewer annotations does not establish lower cost.
Start with the installed compiler, existing check command, and representative
consumers before choosing a replacement type.

## Locate the cost

Record compiler/tool versions, command, input model size and depth, included
projects, and cache state. Use the same supported source and consumer tests for
both implementations. Include accepted calls, rejected inputs, and inferred
results that must remain precise.

Collect extended diagnostics for the relevant checking project. For example,
replace this illustrative project name with the actual leaf:

```bash
tsc -p tsconfig.check.json --extendedDiagnostics
```

| Observation | Investigate |
| --- | --- |
| Unexpected file or declaration volume | Program inputs, ambient dependencies, and resolution before rewriting type utilities |
| Checking dominates with expensive type instantiation | The relevant generic, union, intersection, or recursive transformation |
| Repeated work across projects or runs | Project graph, overlaps, and cache state using the project-configuration reference |

Counts and aggregate timings are clues, not proof that a particular alias is
the cause. When necessary, capture a trace in owned, ignored output storage:

```bash
tsc -p tsconfig.check.json --generateTrace .cache/type-trace
```

Ensure the traced run actually checks the workload; an unchanged incremental
build may reuse prior state. Keep profiling separate from comparative timing,
since trace collection adds work. For solution graphs, identify the responsible
leaf and preserve dependency/build ordering while measuring it.

## Compare one design change at a time

Measure the current implementation and a focused alternative under equivalent
commands, compiler settings, inputs, and cache conditions. For cold measurements,
use separate owned cache/output locations; for warm measurements, establish the
same warm state. Repeat and alternate run order. Avoid competing heavy work
when comparing elapsed time, and retain raw diagnostics rather than only a
percentage. Do not delete unrelated caches or make global toolchain changes.

Investigate alternatives that address the measured operation: reuse a named
intermediate type, reduce unnecessary repeated distribution, or simplify a
recursive contract consumers do not actually need. These are hypotheses, not
universal preferences; an accumulator or a larger abstraction can cost more.

Run the same consumer tests before accepting an alternative. Widening a finite
path union to `string`, losing an input/output relationship, or accepting formerly
invalid values is an API change, not an equivalent optimization. If that tradeoff
is necessary, state it and obtain the task's required decision rather than
silently weakening the contract.

## Report the decision and its limits

Compare checking/total time, instantiations, and memory as relevant to the
bottleneck. Fewer instantiations alone do not establish faster builds or editor
responses. Distinguish measured results from estimates and note uncontrolled
host load or small samples. Keep the existing implementation when no useful
improvement is demonstrated; synthetic fixtures do not prove production speedup.

Use [project configuration](project-configuration.md) for project partitioning
and caches, and [type testing](type-testing.md) for consumer assertions. This
reference concerns the cost of a type design, not permission to replace tooling
or expand a code-only change into a setup migration.

Source: [TypeScript performance guidance](https://github.com/microsoft/TypeScript/wiki/Performance).
