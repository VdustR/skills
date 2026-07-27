# Template Literal Types

Use template literal types for finite, composable string contracts already
present in the domain, such as namespaced keys or event names.

Avoid modeling unbounded grammar or runtime validation with a complex template
type. Validate external strings at runtime, and prefer generated unions when the
allowed values come from data or schemas.
