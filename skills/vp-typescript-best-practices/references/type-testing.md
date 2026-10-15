# Type Testing

Add type-level tests for exported generics, inference-sensitive helpers,
branded values, overloads, and regressions that ordinary runtime tests cannot
observe.

Cover accepted and rejected examples plus important inference results. Use the
repository's existing type-test framework and compiler configuration. Avoid
tests that merely restate an implementation type or depend on incidental error
wording.

Check both directions when mutual assignability is the intended contract; do not
call it exact type identity. Optional extra fields and `any` can make apparently
strong checks pass. Prefer declared typed values or the existing assertion
framework over introducing an `any` bridge.

```ts
declare const actual: { id: string };
declare const expected: { id: string };
actual satisfies typeof expected;
expected satisfies typeof actual;
// @ts-expect-error -- IDs must remain strings.
({ id: 1 } satisfies typeof expected);
```

`@ts-expect-error` needs a reason and a check that fails when the error disappears.
Ensure `.test-d.ts` files actually run under the configured compiler or type-test
runner. Declaration-only `.d.ts` files have different rules: executable assertions
belong in checked `.ts` type tests or the framework's supported format. Account
for `skipLibCheck`; a test hidden in a skipped declaration is no proof.
