# Working Reproduction

Target: one command that exits non-zero on the failure, fast enough to run
repeatedly without thinking about it.

Prefer a check a machine can make. When the only honest observation is visual —
paint, layout, animation, rendered output — assert the closest machine-readable
proxy instead: computed values, measured geometry, serialized state, or a
comparison against a recorded baseline. Keep the human look as the last step
rather than the whole check, and write down what the viewer is expected to see
so the observation can be repeated by someone else.

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
where a project demonstrates how its stages are driven programmatically, and the
tests shipped with the installed version describe that version, which a
third-party note or an older answer does not. Its API reference comes second.

## Name the pipeline you observed

The same source can flow through more than one pipeline and produce different
artifacts: a development path and a production build, one dependency version and
another, one runtime or configuration and another. A failure can exist in
exactly one of them. Record which pipeline produced the artifact you asserted,
because a reader will otherwise assume the wrong one.

## Reduce the input

Remove input until the failure stops, then restore the last piece removed. What
remains is the candidate mechanism. Keep the reproduction at that size rather
than at the size that was convenient to reach.

At this point the reproduction is usable on its own: it fails on demand, and
that is already evidence, whether or not a fix is known yet.

## Confirm both directions once a fix exists

A reliable failure shows that something is wrong. It does not show what. As soon
as there is a candidate fix or an identified cause to remove, run all three:

1. It fails with the cause present.
2. It passes once the cause is removed.
3. It fails again when that removal is reverted.

Only the third step separates a mechanism from a coincidence, and it also rules
out a reproduction that passes because it never reached the code under test.
Until all three have been observed, describe the cause as a candidate.

## Keep it disposable

A working reproduction belongs wherever the work is happening, with whatever
names and paths are already there. There is no reason to move it out of the
repository or rename anything at this level. When it turns out to be worth
keeping as a regression test, that is a normal test-suite decision, not part of
this workflow.
