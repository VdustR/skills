---
name: vp-test-design
description: >-
  Decide whether a change needs a test, write it first when a cheap test
  path exists, and judge every new or existing test by the behavior it protects.
  Use when writing, changing, keeping, or deleting tests during ordinary
  feature or fix work, or when choosing between a test, a mock, and a real
  run. Boundary: vp-minimal-repro owns reproducing a failure and validating an
  uncertain technical premise; the repository's test tooling owns the runner
  and conventions. This skill is not a mandate to test-drive every change.
---

# Test Design

A test earns its place by catching a behavior break that a user of the code
would notice. Match the check to the changed behavior and the cost of running
it. Follow the repository's test runner, layout, and naming before applying
the fallbacks here.

## Decide whether a new test earns its place

Do not add a test to raise a coverage number, to mirror the existence of a
function, or to satisfy a workflow step. Add one when a cheap test path
reaches the changed behavior: an existing unit, component, integration, or
regression suite that already exercises that code path.

Prefer no new test over a bad one. When a focused test would need broad
harness setup, brittle mocks, production-only state, timing-dependent waits, or
large unrelated fixture churn, use the closest executable check instead, such
as a targeted script, a real command, browser automation, a snapshot
comparison, or a log assertion, and say which one you used.

## Write the failing test first when the test path is cheap

For a bug or a behavior change with a cheap test path:

1. State the intended behavior, the current behavior, and the smallest
   observable difference.
2. Write the smallest test that encodes the intended behavior, not the current
   implementation.
3. Run it before changing production code. It must fail for the intended
   reason; a pass or an unrelated failure means the test or the reproduction is
   wrong, so fix that first.
4. Make the smallest production change that satisfies the behavior while
   preserving nearby contracts.
5. Rerun the test and the nearby suite.

When the failure is still unexplained, or the unknown is what a dependency
actually does, hand the diagnosis to `vp-minimal-repro`. Its fail, pass, and
revert-to-fail sequence establishes the cause before this skill locks it in.

## Judge every test by two imagined edits

Apply this to a test you are writing and to an existing test the change touches.

- **Break the behavior.** Make the code return a wrong value, skip an effect,
  or perform it twice. If the test still passes, it proves nothing. Usual
  causes: an assertion looser than the contract, an expected value computed by
  the code under test, a restated constant the code never reads, or an
  assertion on data the test built itself.
- **Change the internals.** Keep every observable result and restructure the
  code underneath. If the test now fails, it is pinned to the implementation.
  It will need a rewrite on every refactor, and that failure signals no bug.

Keep a test that fails the first edit and survives the second. Rewrite or
delete the rest. A test that fails when the internals change but still passes
when the behavior breaks is a change detector, not a test.

The contract decides what counts as behavior, not the shape of the assertion.
Return values, errors callers branch on, state callers can read back, and
effects on other systems are behavior; a call to an internal helper, the order
of private steps, and an error message no caller reads are implementation.
Derive the expected value from the requirement, not from a run of the code.
Read [judging tests](references/judging-tests.md) for worked cases.

## Mock at a boundary the evidence has established

Mocking trades fidelity for cost. Take the trade when the boundary is explicit,
such as a request and response contract, and when driving the real dependency
on every run costs more than the confidence it adds. Give the mock its shape
from evidence: a recorded exchange, the owning schema, or a premise verified
through `vp-minimal-repro`. Do not mock to avoid learning what the dependency
does, and do not mock what the suite can run locally at acceptable cost.

Keep one check through the real wiring for the user-visible result, and
recheck the premise when the dependency's version, configuration, or
conditions change. A local proxy that records real upstream traffic and
overrides selected routes is one way to keep an HTTP or WebSocket mock tied to
real behavior.

## Delete what the change makes dead

When a change removes or replaces behavior, delete the tests that only
protected the old internals, and delete production code that no remaining
test or caller reaches. Do not weaken an assertion to keep a test alive unless
the expected behavior has changed and the reason is recorded.

## Script the proof when it must be rerun

When the evidence has to convince a reviewer or be rerun after a later change,
write the check as a script or a committed test rather than a one-time manual
run. Make the check deterministic so a rerun gives the same result.

## Report

Name the failing-before test or check and the failure it produced, then the
passing-after run and any nearby validation. When failing-before evidence could
not be demonstrated, say why and name the closest check used instead. Report
manual walkthroughs, executed tests, and independent agent trials separately.

## Related skills

- [`vp-minimal-repro`](https://github.com/VdustR/skills/tree/main/skills/vp-minimal-repro)
  when the failure is unexplained or an external behavior must be verified
  before a test can rely on it.
- [`vp-autodev`](https://github.com/VdustR/skills/tree/main/skills/vp-autodev)
  when the tested change proceeds through authorized delivery.
- [`vp-typescript-best-practices`](https://github.com/VdustR/skills/tree/main/skills/vp-typescript-best-practices)
  when the check is a type-level test or a runtime guard.
