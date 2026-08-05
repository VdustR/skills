# Working Reproduction

Target: one command that exits non-zero while the cause is present and zero once
it is removed, fast enough to run repeatedly without thinking about it. If a
step needs a human to look at something, it is not a reproduction yet.

## Observe the artifact, not the symptom

A symptom is what a person notices at the end of a pipeline. The artifact is
what the failing stage actually produced: a transformed source string, a
serialized response, a query, a generated file, a log record, a returned value.
Assert the artifact.

Ask which stage of which pipeline produces it, and whether that stage can be
invoked directly instead of through everything in front of it. Calling a handler
without the server, a transform without the browser, or a formatter without the
job runner removes most of the variables at once.

To find the direct entry point, read the tool's own test suite first: tests are
where a project demonstrates how its stages are driven programmatically, and
they stay accurate across versions in a way that third-party notes do not. Its
API reference comes second.

## Name the pipeline you observed

The same source can flow through more than one pipeline and produce different
artifacts: a development path and a production build, one dependency version and
another, one runtime or configuration and another. A failure can exist in
exactly one of them. Record which pipeline produced the artifact you asserted,
because a reader will otherwise assume the wrong one.

## Reduce, then confirm the direction

Remove input until the failure stops, then restore the last piece removed. What
remains is the candidate mechanism. Keep the reproduction at that size rather
than at the size that was convenient to reach.

Then run it in both directions:

1. It fails with the cause present.
2. It passes once the cause is removed.
3. It fails again when that removal is reverted.

Only the third step separates a mechanism from a coincidence, and it also rules
out a reproduction that passes because it never reached the code under test.

## Keep it disposable

A working reproduction belongs wherever the work is happening, with whatever
names and paths are already there. There is no reason to move it out of the
repository or rename anything at this level. When it turns out to be worth
keeping as a regression test, that is a normal test-suite decision, not part of
this workflow.
