# Consumer Contracts and Literal Checks

Choose the mechanism for the contract:

| Need | Mechanism |
| --- | --- |
| A value exists only to feed an API | Its public parameter or prop type |
| Check a literal while retaining useful inference | `satisfies Target` |
| Preserve a readonly tuple or exact lookup values | `as const`, optionally with `satisfies` |
| Validate external data | Runtime validation, then inferred output |
| Bridge a demonstrated compiler limitation | A localized assertion with evidence |

`satisfies` checks assignability and supplies contextual typing; it is not an
exact-object type, a cast, or a runtime validator. Do not promise that inference
is completely unchanged. Index signatures deliberately accept extra keys.

## Check values at their construction site

```ts
type Option = { label: string; value: string };
const direct = { label: "One", value: "1" } satisfies Option;

const mapped = ["1"].map((value): Option => ({ label: value, value }));
```

An annotation on the array receiving `.map()` can check element assignability
without rejecting extra fields created in the callback. Annotate the callback
return or apply `satisfies` to each returned literal when checking those keys.
Apply the same rule to `Array.from`, test factories, and story fixtures. Derive
fixture contracts from the actual consumer instead of maintaining a second type.

```ts
type Props = { disabled: boolean; onClick?: () => void };
const action = true;
const props = {
  disabled: !action,
  ...(action
    ? ({ onClick: () => {} } satisfies Partial<Props>)
    : ({} satisfies Partial<Props>)),
} satisfies Props;
```

The outer check verifies the assembled required fields. Branch checks reject
unexpected fields introduced inside a spread. Check both branches when they
represent the same consumer contract, including an empty branch that may gain
fields later. When changing a branch, verify its construction check still rejects
an unknown field; an empty object alone does not establish that check.

JSX spreads have the same freshness boundary. For union props, choose the
intended variant, such as `Partial<Extract<PropsUnion, { kind: "link" }>>`.
Use `Partial` only for a fragment whose required fields are supplied elsewhere;
a branch responsible for a required property needs a contract that requires it.
Existing objects still receive structural assignability checks, not exact keys.

## Keep fixture contracts tied to their consumer

Derive an option element from the receiving function's public parameter, or use
a framework's prop helper for a component. Choose the applicable overload or
variant rather than treating a broad union as the intended contract. Keep the
check where the factory or callback creates the value; an output array annotation
does not restore freshness inside its callbacks.

Use typed full defaults in factories, then apply typed overrides. Avoid
`as Entity`, `as unknown as Entity`, and non-null assertions to hide missing
fields. Guard a nullable lookup once and use its narrowed binding; prefer
value-driven loops or `.entries()` over unchecked indexed access.

Use `flatMap` when dropping and transforming values belong to the same decision;
do not assume it is faster without measurements. Keep independent named filters
when clearer. TypeScript 5.5 can infer some filter predicates, so do not claim
that every `.filter()` loses narrowing; check the installed compiler.

`{}` means any non-nullish value, including primitives. Choose `unknown`,
`object`, a specific shape, or no generic constraint according to intent.

Source: [TypeScript 4.9 satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
and [TypeScript 5.5 inferred predicates](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
