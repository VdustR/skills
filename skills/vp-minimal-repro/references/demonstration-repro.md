# Demonstration Reproduction

Escalate to this level when someone without the surrounding context has to run
the reproduction and reach the same conclusion, or when it leaves this machine
at all. It is built on top of a verified working reproduction, never instead of
one.

## Show the mechanism and the fix, nothing else

This is the default, not a trimming pass at the end. Every file, dependency,
line, and rendered element has to earn its place by one of two tests: removing
it stops the failure, or removing it makes the failure unreadable. Everything
else goes.

What that rules out: business logic and domain vocabulary, product and feature
names, unrelated features that happened to be nearby, realistic-looking data,
styling or copy added for polish, and any framing that requires knowing the
original product. See `de-identification.md` for the identifier-level rules and
for the incidental channels that leak this material even after the visible names
are gone.

## Design the exhibit; do not recreate the incident

The working reproduction has to be faithful to the incident, because that is how
its identity is established. The demonstration is faithful to the mechanism
instead. Once the mechanism is verified, the original symptom stops being the
thing worth showing, and recreating it usually makes the demonstration worse: the
real symptom was subtle, embedded in real layout and real data, and visible only
to someone who knew what the screen was supposed to look like.

So build the clearest possible exhibit of the mechanism rather than a copy of
what was observed. Choose inputs and a presentation that make the difference
impossible to miss: exaggerate the magnitude, place the failing and control
cases side by side, and make the observable consequence something a reader can
name in one glance or read as printed output. A rule that shifts a real page by
two pixels can be shown as two plainly labeled boxes whose gap obviously differs
plus the measured numbers; an ordering problem that appears as a stuck screen
can be shown as a printed sequence.

The same reasoning argues against copying files out of the original repository.
An export carries configuration, plugins, and defaults that stay on the reader's
list of suspects, so write the case again from scratch with the smallest
dependency set that still fails.

Then confirm the redesigned exhibit still fails in both directions, for the same
reason. A redesign that fails for a different reason demonstrates a different
problem, and a redesign that quietly stops failing is not a smaller
reproduction.

## Include a control case

One failing case shows that something is broken. A pair that differs in exactly
one factor shows which factor. Choose the control so that the difference is the
single thing being claimed: two versions of the same dependency, two
configurations, two input shapes, two code paths that share everything else.

Report the pair as a pair. The control passing is half the evidence.

## Make it readable in one sitting

- The fewest files that still fail, each short enough to read without scrolling.
- Print the few relevant lines of the artifact, not the whole thing.
- State the expected result next to the observed one, in the output itself.
- One command to run it, with no manual setup step left implicit.

## Record the environment and the sources

Pin and write down what a reader needs to match: runtime and version,
dependency versions, and platform or operating system when it is relevant. An
unpinned reproduction becomes unreproducible on its own.

Carry the evidence ledger into the artifact: what was observed, what is
inference, and every source consulted with a link, including documentation,
changelogs, and existing issues. A demonstration that presents inference in the
same voice as observation invites the reader to discard both.
