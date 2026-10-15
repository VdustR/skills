# Unions And Exhaustiveness

Use a stable discriminant when behavior depends on a closed set of variants.
Keep variant-specific fields on their variant instead of making every field
optional.

Exhaustive handling should fail visibly when a new variant is added. Match the
repository's preferred assertion or control-flow pattern and ensure the fallback
does not silently accept unknown runtime data.

For open external values, validate and map them into a closed internal union
before relying on exhaustive logic.

For an exhaustive switch on a discriminated object union, check the remaining
object itself, not a property on an object already narrowed to `never`:

```ts
type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
    default:
      shape satisfies never;
      throw new Error("Unhandled shape");
  }
}
```

List intentional no-op variants explicitly. A finite lookup table can use
`satisfies Record<Variant, Value>` to enforce complete keys. Use a remaining-union
anchor only when adding a variant really requires revisiting that decision;
partial filters do not need artificial exhaustiveness.
