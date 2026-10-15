# Public API Contracts

Start with a representative call: which inputs define legal values, what the
caller should infer, and who may change the data. Choose type machinery after
those decisions; a compiling call alone does not establish the intended API.

## Give each type parameter a source of truth

Use a generic for a relationship the caller needs. Decide which arguments define
its candidate types and which must conform to that choice. Use `NoInfer` on a
dependent argument when it must not expand the authoritative input's inferred
set. For example, a selected value must come from the available choices:

```ts
export function pick<const C extends string>(
  choices: readonly C[],
  selected: NoInfer<C>,
): C {
  if (!choices.includes(selected)) throw new Error("Unknown choice");
  return selected;
}
```

`pick(["red", "green"], "blue")` must fail; a valid call retains the inferred
`"red" | "green"` result. `NoInfer` controls inference, not runtime membership.
Explicit type arguments or inputs already widened to `string[]` cannot recover
a finite literal set; the runtime check serves a different boundary.

Preserve literal or tuple precision only when consumers use it. Choose `const`
type parameters for that inference contract rather than requiring assertions at
every call. Model empty collections and omitted defaults explicitly: require a
nonempty input, return a possible absence, or use the API's established failure
contract. Do not promise a value by asserting away an unchecked lookup.

## Define mutation and sharing separately

| Question | API decision |
| --- | --- |
| Does the operation modify its input? | Accept readonly input when it only reads; expose mutation when it is part of the operation |
| Can the caller change the returned collection? | Choose a mutable result or a readonly public view |
| Can later input edits change a stored result? | Choose shared storage or make the required defensive copy |
| Must nested values also be independent? | Copy or encapsulate the relevant nested data; a shallow array copy is insufficient |

This snapshot accepts mutable or readonly input, copies the array, and exposes
a readonly result. Its elements still share their original references:

```ts
export function snapshot<T>(values: readonly T[]): readonly T[] {
  return [...values];
}
```

`readonly` and `as const` restrict typed access; they do not freeze objects at
runtime or establish ownership. `Object.freeze` is also shallow. Choose copying,
freezing, or encapsulation from the actual sharing contract rather than applying
a blanket immutability rule. Validate runtime behavior at the relevant depth.

## Verify the consumer contract

Use the repository's existing type-test tools to check valid calls, rejected
combinations, and inferred results. Include ordinary literal calls without
explicit generics or assertions. Check readonly inputs and empty/default cases
when supported, and avoid weakening overloads or literal results just to make
an implementation compile.

For sharing guarantees, execute the API with frozen input and with input later
modified by its caller. Check nested edits when independent nested data is
promised. Explicit public return types can stabilize a boundary, but should
preserve the input/output relationships consumers rely on and avoid leaking
private implementation types.

Sources: [TypeScript NoInfer](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type)
and [readonly properties and arrays](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties).
