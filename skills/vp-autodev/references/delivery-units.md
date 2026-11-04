# Delivery Units

A delivery unit is one reviewable, mergeable change: usually one pull request.
The plan-delivery-units phase decides whether the change ships as one unit or
as an ordered sequence of units. Neither answer is the default. Decide from the
reasons below, record the decision and its reason before the first edit, and
keep that record in the delivery brief.

## Reasons to split

Split into several units when at least one of these holds:

- Each unit is independently deployable and delivers value on its own, so an
  earlier unit can ship and stay shipped while a later one is still under
  review.
- Review routing differs between parts. A part that must go to human review,
  such as a protected path or a schema change, should not carry parts that the
  repository would otherwise accept through a lighter route, and the lighter
  parts should not wait on the heavier review.
- The repository documents a size cap, a per-unit review cap, or a rule that a
  certain kind of change is always its own unit.

## Reasons not to split

Keep the change as one unit when at least one of these holds:

- The parts only make sense merged together within minutes of each other. A
  sequence whose units would each be broken or pointless on the base branch
  until the next one lands is one unit.
- Splitting would require inventing a compatibility layer, a flag, a stub, or
  a default solely so that each piece passes a size or review gate. That adds
  code and risk the gate was meant to reduce.
- A reviewer must judge the whole design at once, and splitting would hide the
  design from every single review.
- Each merge in this repository triggers a costly deploy, release, or batch
  step, so several small merges cost more and expose more than one.

When reasons on both sides apply, prefer the smaller number of units that keeps
every unit standing alone on the base branch, and state the trade-off in the
record.

## Invariants

These hold whatever the decision:

- Every unit stands alone on the base branch: it builds, passes the checks the
  repository runs, and leaves behavior coherent when it is the only unit
  merged so far.
- Files are never renamed, moved, split, or restructured to escape a review
  control, path rule, or size rule. A control that seems wrong is reported as
  a separate problem, not worked around.
- A sequence whose later units depend on earlier ones is delivered through
  `vp-stacked-pr`, with the dependency order recorded.
- The decision and its reason are recorded before the first edit. A later
  change to the decision is recorded with what changed and why.

## Record

One row per unit, kept in the delivery brief:

| Unit | Scope (paths or components) | Review route | Depends on | Reason for the boundary |
|------|-----------------------------|--------------|------------|-------------------------|

A single-unit decision is one row and the reason that no split applies.
