# Failure Diagnosis and Cancellation

Use this reference when a proposed fix changes cancellation handling or error
filtering. Establish the failure path before deciding where to handle it.

## Trace the behavior and compare remedies

Follow the operation from producer through callers and adapters to its owner,
completion state, cleanup, retry policy, and reporting boundary. Identify who
starts and stops it, which outcome callers expect, and where errors are wrapped,
transformed, consumed, or reported. Inspect the relevant lifecycle and timing;
an error observed during teardown need not have been caused by teardown.

Separate the observed symptom from supported causes, competing hypotheses, and
unknowns. Seek evidence that distinguishes the plausible explanations, using
`vp-minimal-repro` for uncertain external behavior. A confirmed problem can
remain causally unexplained; do not require a single root cause. In an urgent
incident, choose an authorized, bounded mitigation before diagnosis is complete
when needed. Preserve diagnostic evidence, define recovery and rollback signals,
and describe the result as mitigation until a repair is verified.

Compare remedies at the boundary that owns the behavior: correcting the producer
or lifecycle, handling an expected outcome at its caller, or filtering known
noise in shared reporting. Prefer the narrowest scope that meets the contract.
A global filter is viable only with evidence covering its actual scope,
classification, and affected reporting routes; a local reproduction alone does
not justify dropping every similarly named error across the application.

## Establish whether cancellation was expected

Before consuming a cancellation, establish all three:

1. **Operation:** Which invocation failed, and how is the error tied to that
   invocation and its signal or cancellation token?
2. **Source:** Which controller, deadline, parent operation, or adapter caused
   cancellation, and what evidence ties that source to this outcome?
3. **Intent:** Why is this outcome expected under the operation's contract, and
   what must its caller receive or observe instead of success or failure?

Use operation-specific context and event ordering, supported by the installed
adapter's behavior. `error.name === "AbortError"` alone proves neither ownership
nor intent. A signal observed as aborted after another failure does not establish
that cancellation caused that failure. Even matching the signal's reason needs
the operation and source evidence; do not adopt a universal name or identity
predicate without verifying the actual interface.

The [DOM abort contract](https://dom.spec.whatwg.org/#aborting-ongoing-activities)
allows custom reasons; the default is an `AbortError` DOMException.
[`AbortSignal.timeout`](https://dom.spec.whatwg.org/#dom-abortsignal-timeout)
uses a `TimeoutError` DOMException. A deadline expiring has distinct semantics
from an intentional navigation or user cancellation. Preserve the required
failure, retry, and reporting behavior for timeouts even if an adapter normalizes
both into one error shape. Check the relevant version's documentation and the
actual adapter path before relying on reason propagation or error shape.

When evidence is insufficient, preserve the existing failure path while
investigating rather than silently reclassifying the error. Expected cancellation
may be handled locally without an error alert, but must still produce the
contract's cancellation outcome and release its resources.

## Verify the outcome and preserved failures

Exercise applicable scenarios against the real changed boundary. These are
decision cases, not a substitute for running the application's regression checks.

| Scenario | Evidence and required outcome |
| --- | --- |
| Local expected abort | Tie the canceled invocation to its owning source and expected intent, including a custom reason when supported. Verify the caller's cancellation outcome and cleanup. |
| Unexpected abort elsewhere | Trigger another operation with a similar error shape; it must still propagate or report through its required route. |
| Timeout | Expire the actual deadline path; verify its failure, retry, and reporting contract instead of treating every abort as benign. |
| Late abort after unrelated failure | Fail the operation first, then abort its signal before handling completes. Preserve the original failure and its report. |
| Urgent mitigation, cause uncertain | Verify recovery and rollback signals, preserve evidence and observability, and keep diagnosis explicitly unresolved. |
| Shared or global filtering | Cover every affected class of operation and reporting route; reject the broad rule when only the local case is supported. |

For each changed path, check settlement and downstream completion, stale or stuck
state, resource and listener cleanup, retry eligibility, and observability. Inject
a nearby unexpected failure after applying the fix and verify that its required
report still arrives. Fewer alerts are useful only when expected noise is removed
and required failures remain visible. Retain evidence of both outcomes and state
which integration paths remain unverified.

Report manual decision walkthroughs, executed regression tests, and independent
agent trials separately. A simulated adapter proves the simulation's behavior;
it does not establish the application's real adapter or telemetry delivery.

## Method sources

- [Google SRE: Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
  supports hypothesis testing, system knowledge, evidence preservation, and
  urgent mitigation before complete diagnosis.
- [DOM Standard: Aborting ongoing activities](https://dom.spec.whatwg.org/#aborting-ongoing-activities)
  defines the platform cancellation primitives; application and adapter contracts
  still require separate verification.
