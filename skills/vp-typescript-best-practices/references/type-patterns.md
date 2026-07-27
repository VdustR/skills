# Type Patterns

Use types to express relationships and valid states:

- discriminated unions for state-dependent fields;
- constrained generics when input and output types are related;
- mapped or indexed types when keys derive from one source of truth;
- conditional types only when consumers gain a clearer contract;
- explicit public return types when they stabilize an API boundary.

Prefer a small readable union over a clever general abstraction. Do not widen
types or add optional fields merely to accommodate one invalid state.

When a type transformation becomes hard to explain, add representative
type-level tests and consider whether a runtime abstraction would be clearer.
