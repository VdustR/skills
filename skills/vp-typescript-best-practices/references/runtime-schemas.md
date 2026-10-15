# Runtime Validation and Narrowing

Treat a runtime boundary as a contract: which values enter, what validation or
normalization does to them, and how failure reaches the caller. Use the
repository's validator for network responses, parsed JSON, storage, and other
untrusted inputs. Keep raw data `unknown` until that contract is established.

## Separate type recognition from value selection

A predicate `value is T` promises that a successful check establishes `T` and
that a failed check excludes it from the original union. The compiler checks the
signature's compatibility, not whether the implementation proves that promise.
Assertion functions make the same kind of promise when they return normally;
the implementation must throw or otherwise stop when the claim is false.

Recognizing numbers and selecting small numbers are different operations:

```ts
export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isSmallNumber(value: unknown): boolean {
  return isNumber(value) && Number.isFinite(value) && Math.abs(value) < 10;
}
```

For `string | number`, a predicate that claims `value is number` but rejects
large numbers would wrongly narrow the false branch to `string`. Use a boolean
selection when only some values of a type qualify. If the domain needs a distinct
validated type, define that contract explicitly, such as a validated brand.

Test accepted, rejected, and boundary values through the operation that uses the
guard. Check both branches, including the rejected remainder of a partition.
Cover throwing and successful paths for assertion functions. Where relevant,
include empty values, numeric boundaries, `NaN`, and infinities; do not let a
type-only test stand in for executing the predicate.

## Choose parsing behavior from the caller's needs

| Decision | Establish before choosing schema APIs |
| --- | --- |
| Unknown object keys | Reject, remove, or retain them according to the external contract |
| Conversion | Decide whether strings, empty values, or null may become another value |
| Missing values | Distinguish omission, explicit null, and supplied defaults |
| Normalization | Specify the returned value and the order of validation/transforms |
| Failure | Preserve the caller's error/result contract; do not continue with unchecked data |

For example, this Zod 4 schema rejects unknown fields, trims a required ID, and
accepts an optional numeric age without coercing numeric strings:

```ts
import { z } from "zod";

export const User = z.strictObject({
  id: z.string().trim().min(1),
  age: z.number().int().nonnegative().optional(),
});
```

Those choices are an example contract, not defaults for every application.
Verify parsed output as well as acceptance: validation followed by trimming can
behave differently from trimming followed by validation. For coercion, exercise
the original primitive inputs, not only already-converted values. Verify the
installed version's default behavior rather than inferring it from a type name.

## Keep schema types and dependencies aligned

Derive types from the schema instead of writing parallel interfaces. For Zod,
use public helpers such as `z.infer`, `z.input`, and `z.output`; `z.infer` describes
output, which can differ from input after defaults, coercion, or transforms.
Name the side a function consumes. Reuse a schema's runtime enum values rather
than duplicating a list.

Inspect the installed major version and repository imports. Dependency
declarations must also work under the target runtime's `lib` and `types`: even
a primitive-only schema can import declarations needing globals such as `URL`.
Do not add unrelated globals merely to mask that mismatch.

Preserve the repository's validator, wrappers, and bundle policy. Dual schemas
need a real interoperability contract: schema objects from different Zod majors
are not interchangeable just because their parsed values are. An assertion or
a generic argument to JSON parsing does not validate data.

Sources: [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html),
[Zod basics](https://zod.dev/basics), and [Zod schema APIs](https://zod.dev/api).
