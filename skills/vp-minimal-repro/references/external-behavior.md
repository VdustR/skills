# Verify External Behavior Once, Within Its Conditions

Use this when the unknown is what a library, service, runtime, OS, or device
actually does. The result may be normal behavior rather than a defect.

## Isolate the question

Name one operation or trigger, its relevant preconditions, and the observable
result needed for the next decision. Choose the smallest check that preserves
those conditions and reaches the real dependency: a direct API call, a tiny
native harness, or a focused device procedure. Keep sequencing, permissions,
process state, or hardware when they could affect the answer. Smallest means
the smallest faithful boundary, not necessarily a unit test.

Read the installed version's tests and primary documentation for an entry point
and expected behavior. Documentation establishes a documented contract; a run
establishes an observation for that environment. A local stub, emitted event,
or replay can test the application's response, but cannot independently verify
the external behavior it represents.

If the first result is ambiguous or timing-dependent, add the smallest control,
trace, or repeated sample that distinguishes the competing explanations. Record
variation rather than promoting one successful run into a universal rule. Do
not manipulate a live service or device beyond the task's authorization just to
obtain a control case.

## Stop or escalate from the result

Stop exploration once the scoped question is answered well enough to choose
an implementation. Carry the evidence and its limits into design and acceptance;
do not turn a small probe into a production implementation or broad benchmark.
An inconclusive result is not a pass or a disproof: identify the missing control,
trace, sample, or environment before another attempt. If the next check needs
unavailable hardware, human perception, additional authority, or material cost,
prepare the procedure and report that dependency rather than expanding the run.

## Keep evidence that can be reused

Prefer the repository's existing testing notes, investigation document, or
evidence directory. Retain the runnable check when useful; otherwise retain an
exact procedure and stable evidence references. Keep a short record of:

- The question, trigger, preconditions, and expected versus observed result.
- The command or procedure and its assertion, trace, output, or human observation.
- Observation date with time zone, relevant source revision, dependency/runtime
  versions, OS/device, configuration, permissions, and process state.
- What is established, what remains inference or unverified, and which later
  tests may rely on this observation.
- Conditions that require a new check: relevant version, configuration, hardware,
  permission, sequence, or adapter changes; evidence of drift; or a contradiction.

Include only conditions relevant to interpreting the result. Link primary
sources beside documented claims, keep sensitive data out of retained artifacts,
and follow de-identification requirements before sharing. A retained observation
is a scoped premise, not a permanent guarantee from the provider.

## Reuse the premise and test the remaining interaction

Before replaying a user journey, read the record and compare its conditions with
the current task. Cite matching evidence rather than re-establishing the same
external fact. Test application decisions using a fixture or fake grounded in
that evidence, preserving relevant event ordering and timing.

Group paths only when code and conditions show that they share the behavior
being asserted. Different labels or entry points alone do not justify a full
cross-product of tests; shared code alone does not prove equivalent external
conditions. Verify distinct boundaries separately and keep a representative
integration check for the actual wiring or user-visible result when needed.

For example, an OS focus event and the application's response to that event are
separate claims. Emitting the event can test the response; it cannot prove that
a real lock/unlock or lid cycle produces it. Likewise, an audio API listing or
selecting a Bluetooth route does not prove audible output through the headset.
Retain a focused physical or human check for that remaining claim instead of
repeating unrelated login, navigation, or call-state combinations.

Recheck only the affected premise when its conditions change or contrary
evidence appears. For independently changing services, record a freshness rule
appropriate to their change cadence and the decision's risk. Do not create a
monitor or schedule without authorization. Required repository checks and
acceptance gates still apply.

## Supporting approaches

- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
  describes narrow integration tests and avoiding duplicate assertions at higher
  layers while retaining integration coverage.
- [Contract Test](https://martinfowler.com/bliki/ContractTest.html) explains
  checking test doubles against real external-service behavior as it changes.

## Terminology and scope

Use **validate a technical premise** to describe the purpose of this workflow;
it is plain language for checking a decision-relevant assumption, not a claim
that every probe is a standardized testing technique.

- A [minimal, reproducible example](https://stackoverflow.com/help/minimal-reproducible-example)
  preserves enough code and context for another person to reproduce a problem.
  Use it for a known failure; do not invent a failure for a feasibility question.
- A **technical spike** is focused research to resolve a technical unknown;
  [Agile Alliance's XP guidance](https://agilealliance.org/glossary/xp/)
  uses spikes for technical considerations that prevent estimation. This skill
  takes the small experiment that informs a decision, not a whole planning process.
- **Assumption validation** describes deciding what must be learned before
  committing further effort. [IDEO.org's prototype guidance](https://www.designkit.org/methods/determine-what-to-prototype.html)
  starts from learning needs and testable components. Here the assumption is
  specifically about technical behavior, not general product desirability.
- **Hypothesis testing** is useful as a reasoning pattern: state competing
  explanations and choose a discriminating observation. A single API or device
  probe is not automatically a statistical hypothesis test;
  [NIST's definition](https://www.itl.nist.gov/div898/handbook/prc/section1/prc13.htm)
  concerns quantitative evidence and a null hypothesis.
- **Problem isolation** describes narrowing a failure to its relevant stage or
  dependency. The [MRE reduction guidance](https://stackoverflow.com/help/minimal-reproducible-example)
  supports this technique; without a failure, isolate the question instead.

Here **interface** means the actual library call, service endpoint, runtime
operation, or device interaction being observed. State the experiment's scope
and the limits of its conclusions explicitly. This is different from
[boundary value analysis](https://glossary.istqb.org/en_US/search?term=boundary%20value%20analysis),
which selects test conditions at boundary values.
