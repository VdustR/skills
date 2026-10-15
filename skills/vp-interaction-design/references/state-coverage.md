# State and Transition Coverage

Use this reference to find gaps in an in-scope flow. These are prompts for
discovery, not mandatory features or requirements to test every combination.

## Map the interaction

For a substantial flow, record each distinct case using the smallest useful
format. A table can connect:

| Intent and starting state | User-visible information | Action and prerequisites | Immediate feedback | Final outcome or uncertainty | Recovery or next step |
| --- | --- | --- | --- | --- | --- |
| Export results; valid selection | Selection scope and export constraints | Start export | Request acknowledged | Running, ready, failed, or unknown | Download if ready; reconcile unknown outcome before retry |

The export row is illustrative, not a claim that notifications, background
processing, cancellation, or resumable downloads exist. Verify those contracts
before promising them.

For each transition, consider the trigger, preconditions, affected object,
side effect, timing, feedback, and resulting state. Trace backward from every
terminal state: can a user tell whether their goal was met and leave or continue?

## Discover relevant cases

| Dimension | Cases to consider when applicable |
| --- | --- |
| Entry and intent | First use, repeat use, direct link, notification link, returning mid-task, inspection without commitment |
| Data | No data yet, no matching results, incomplete data, unavailable object, stale data, long content, large collections |
| Execution | Idle, validation, sending, accepted, queued, running, partial completion, success, failure, uncertain outcome |
| Access | Signed out, expired session, read-only, missing permission, revoked permission, different ownership or role |
| Interruption | Cancel, dismiss, leave, Back, reload, offline, timeout, app suspension, interrupted gesture, resume |
| Concurrent change | Duplicate activation, late response, reordered responses, another tab or user editing, object deleted during use |
| Environment | Supported viewport and device classes, keyboard and touch, assistive technology, text scaling, reduced motion, locale |

Separate states that have different next actions. An empty account may need a
creation path; a search with no matches may need filter correction. A known
failure can allow retry; a timeout after submission may require checking the
result first. A disabled control is not an explanation of why it is disabled.

Do not assume every platform supports every recovery mechanism. Establish
what cancellation actually stops, whether drafts persist, whether retries are
idempotent, and when success becomes authoritative. If a missing contract blocks
the design, present the concrete decision with its consequences and recommendation.

Reconciliation also needs evidence: an account-wide job listing may not identify
which job belongs to a timed-out submission, and an empty or stale listing does
not establish failure. Preserve uncertainty when correlation or freshness is
unknown. Do not silently attach an unrelated result or automatically resubmit.

## Information and action checks

- Before commitment: can the user identify the target, scope, prerequisites,
  cost, privacy impact, and reversible or irreversible consequences as relevant?
- During execution: is the feedback tied to the correct object and operation?
  Can the user tell whether to wait, continue elsewhere, or intervene? Give
  duration estimates only when supported.
- After execution: does feedback distinguish a local change from persisted or
  externally completed work? Does partial success identify what still needs work?
- On failure: explain the known problem, retained progress, and an available
  next step. Keep diagnostic details in an appropriate support or developer
  surface unless the intended user needs them.
- On exit or return: does dismissal imply cancellation? What happens to focus,
  selection, filters, scroll, and unsaved work? Preserve what serves the task
  without introducing unrequested persistence or exposing sensitive state.

For example, replace an internal note such as "The request uses an async job"
with the actual user-relevant state, such as "Export in progress." Offer an
email notification only if the product supports it and the destination and
privacy implications are clear. In an API debugging tool, a job identifier may
itself be useful information; evaluate the audience rather than banning jargon.

## Select verification evidence

Enumerate known cases before selecting tests. Group cases only when the same
behavior and information apply. Check each distinct transition rule and
high-consequence outcome, then choose representative environment combinations.
Track unknown contracts and untested combinations separately from passing cases.

For an implemented form, a useful exercise might submit invalid data, correct
it, submit once, interrupt the response, return, and establish whether the
server accepted the request. Include accessible error association and focus
behavior. Use test accounts and controlled responses rather than inducing
failures against customer data.

A manual walkthrough evaluates the proposed decisions. An executed interaction
test establishes behavior under its actual conditions. Neither proves that all
users understand the design; usability research is separate evidence.
