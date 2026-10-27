# Type Patterns

Use types to express relationships and valid states:

- discriminated unions for state-dependent fields;
- constrained generics when input and output types are related;
- mapped or indexed types when keys derive from one source of truth;
- conditional types only when consumers gain a clearer contract;
- explicit public return types when they stabilize an API boundary.

Prefer a small readable union over a clever general abstraction. Do not widen
types or add optional fields merely to accommodate one invalid state.

Build a type from parts that are all valid instead of repeating runtime checks
on a loose type: `[T, ...T[]]` for a non-empty list, `[T, T][]` for an even
number of elements, and a start plus a duration instead of two endpoints,
which removes the end-before-start state; a negative duration still needs a
validated or branded type. Once the fact is in the type, a caller no longer
repeats the check.

Strengthen only where it pays. Keep `T[]` while every operation on it stays
total, meaning it handles an empty array; `reduce` with an initial value does.
Strengthen the input, or weaken the result to `T | undefined`, where the loose
type forces `!`, a cast, or a throw that "should never happen". Where a plain
`T[]` arrives, narrow once with a guard whose semantics follow
[runtime validation](runtime-schemas.md).

For inference sources and mutation/sharing decisions, use
[public API contracts](public-api.md).

When a type transformation becomes hard to explain, add representative
type-level tests and consider whether a runtime abstraction would be clearer.
