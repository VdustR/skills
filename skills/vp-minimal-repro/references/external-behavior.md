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
