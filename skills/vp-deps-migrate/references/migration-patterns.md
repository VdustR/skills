# Migration Patterns

Classify usages before editing:

- pure value transformation;
- stateful or lifecycle-bound behavior;
- serialization or persisted data;
- framework integration;
- build-time or generated output;
- public API or consumer contract;
- tests, fixtures, examples, and documentation.

Mechanical replacement is safest for isolated pure transformations. Stateful,
framework, persistence, and public-contract usages need behavior-specific
design and tests.

Prefer an incremental adapter when simultaneous migration would make rollback,
verification, or ownership unclear. Remove the adapter only after all consumers
and old data paths are accounted for.
