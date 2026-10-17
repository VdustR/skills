# Concepts, Workflows, and Architecture

Use the relevant part of this reference; these are reasoning prompts, not
mandatory artifact templates. Preserve distinctions between an explanation of
existing behavior and a proposal to change it.

## Concepts

Identify the question the concept helps answer and the audience using it.
Define its distinguishing properties and boundary before assigning a name.
Separate identity, state, role, and relationship when conflating them would
change a decision. Keep vocabulary consistent across examples and views.

Try a clear member, a clear non-member, and an ambiguous case. Can two people
apply the definition consistently using the supplied evidence? If not, identify
the missing criterion or competing interpretations. Do not invent a universal
definition for a context-dependent term or present a metaphor as a mechanism.

For example, an accepted export request and a downloadable export are different
concepts. Calling both "complete" conceals the criterion that matters to someone
waiting for a file. This example illustrates a distinction, not a product contract.

## Workflows

Trace the case from an actual entry to an outcome, including return paths when
supported. For each material handoff identify the sender, recipient, affected
object, prerequisite, information transferred, evidence of acceptance, and next
owner. Distinguish sent, received, accepted, in progress, and completed where
they have different consequences. Record timing and ordering when they matter.

Exercise relevant missing inputs, rejected handoffs, absent owners, timeout,
duplicate work, cancellation, partial completion, and return after interruption.
Ask who detects a stalled case and what supported action can move it forward.
Do not add escalation, notifications, persistence, or rollback just to fill gaps;
show the decision and its impact when those capabilities are unknown.

For example, a support-to-engineering handoff needs an acceptance condition and
an owner while acceptance is pending. A message being sent alone does not prove
that engineering has accepted responsibility. A walkthrough can reveal this
missing rule without authorizing messages to real colleagues.

## Architecture

Start with the system boundary, external actors and dependencies, and the quality
requirements that influence the decision. Choose a consistent abstraction level:
a context view answers a different question from a component or runtime view.
Use only views that help the decision; C4 is an option, not a required notation.
Label relationships by what crosses the boundary and why, rather than leaving
unexplained arrows. Separate observed structure from proposed structure.

For a material operation, trace data and control through contracts, owners,
side effects, asynchronous steps, and the authoritative outcome. Identify who
owns durable state and what happens if the process stops between two effects.
Establish consistency, ordering, delivery, deduplication, and reconciliation
contracts when the scenario depends on them; verify rather than assume.

Turn quality goals into scenarios: under which trigger and conditions must the
system produce which response, and how would that response be assessed? Obtain
thresholds from requirements or measurement. "Fast" and "reliable" alone are not
testable targets. Compare options against relevant performance, availability,
security, operability, cost, and changeability needs without requiring all of
these for every design.

For example, a queue redelivers after a worker saves a file but before it records
completion. Trace the repeated side effect and the caller's view of status.
Do not promise exactly-once execution from a queue alone. A contract review or
failure-injection test may support a claim; a box-and-arrow diagram cannot.
A proposal to move production data still needs explicit authority and a migration
and recovery plan proportionate to its consequences.
