# Reply Shapes

Write for the original reviewer and future readers. State the decision, evidence,
and current result without narrating the entire workflow.

## Fixed

> Fixed in `<commit>`. `<behavioral change>`. Verified with `<evidence>`.

## Already Addressed Or Obsolete

> This is addressed in the current head by `<evidence>`. No additional change
> was needed.

## No Fix

> I kept the current behavior because `<reason grounded in code, contract, or
> repository convention>`. `<supporting evidence>`.

## Needs Clarification

> There are two valid interpretations: `<A>` and `<B>`. I have not changed or
> resolved this thread pending `<decision>`.

For PR discussion comments, mention the author and quote only the minimum excerpt
needed to identify the concern. Avoid duplicating a later answer. Never claim a
test, check, reply, or resolution that was not verified after the write.
