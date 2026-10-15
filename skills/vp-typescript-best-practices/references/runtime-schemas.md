# Runtime Schemas

Use the repository's validator at external boundaries: network responses,
parsed JSON, storage, and other untrusted inputs. Keep raw data `unknown` until
validated. Derive the static type from the schema instead of writing parallel
interfaces. Preserve parse failure behavior appropriate to the caller.

For Zod, verify the installed major version and repository import conventions.
Check dependency declarations under the target runtime's `lib` and `types` too;
a schema that uses only primitives can still import declarations needing globals
such as `URL`. Do not add unrelated runtime globals merely to mask that mismatch.
Use public helpers such as `z.infer`, `z.input`, and `z.output`; do not depend on
private schema internals. `z.infer` describes output, which can differ from input
when defaults, coercion, or transforms apply. Name the side a function consumes.
Reuse a schema's runtime enum values rather than duplicating a list.

Do not impose another repository's Zod wrapper, v3/v4 naming, or bundle policy.
Create dual schemas only for a real interoperability need; schema objects from
different majors are not interchangeable just because their parsed values are.
An assertion or a generic argument to JSON parsing does not perform validation.

Source: [Zod basics](https://zod.dev/basics).
