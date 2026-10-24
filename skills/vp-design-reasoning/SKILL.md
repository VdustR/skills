---
name: vp-design-reasoning
description: >-
  Turn unclear problems into bounded models and testable design decisions.
  Use to define or explain concepts, design or review workflows and system
  architecture, plan or improve user interactions, or review a recurring
  mistake to choose a preventive model or enforcement boundary. Connect intent,
  responsibilities, relationships, states, consequences, and evidence.
  Boundary: use domain workflows for implementation and validation; not a
  replacement for agent tool routing, technology selection, visual craft,
  or routine implementation with no design decision.
---

# Design Reasoning

Build the smallest model that helps someone understand, decide, or act. Connect
purpose, structure, behavior, and evidence instead of choosing a diagram or
solution before establishing the problem. Understanding an existing system is a
valid outcome; do not redesign it unless the request calls for change.

## Frame the problem

Identify the audience or actors, their question or goal, observable success,
and the task boundary. Inspect the available implementation, examples,
requirements, and research. Separate verified facts and fixed contracts from
assumptions, proposals, and constraints open to change. Ask about unknowns only
when they materially change the next decision; continue independent work.

Scale the method to the task. A terminology correction may need one definition
and counterexample; a cross-team process may need handoffs and exception paths.
Do not require a workshop, diagram, document, implementation, or every domain
reference for each request. Preserve the requested deliverable and scope.

## Select the model and depth

Choose the representation by the question it must answer. Combine views only
when their relationship matters, and keep names and boundaries consistent.

- **Concepts:** define meaning, distinguishing properties, relationships,
  examples, counterexamples, and limits. Read
  [concepts, workflows, and architecture](references/models-and-scenarios.md)
  when ambiguity or competing interpretations affects a decision.
- **Workflows:** identify actors, ownership, inputs, handoffs, prerequisites,
  states, completion, interruptions, and recovery. Use the same reference when
  responsibility, timing, or exceptions span multiple steps or actors.
- **Architecture:** identify responsibilities, boundaries, contracts,
  dependencies, data ownership, runtime behavior, and relevant quality goals.
  Use the same reference for architectural options and scenario evaluation.
  Route stack selection to
  [vp-stack-selection](https://github.com/VdustR/skills/tree/main/skills/vp-stack-selection)
  when choosing technologies is part of the request; verify version-specific
  contracts through primary sources and domain tooling.
- **User interactions:** read
  [user interaction design](references/user-interactions.md) for intent,
  information needs, controls, feedback, accessibility, and recovery. For
  frontend design, resolve and read
  [Impeccable](https://github.com/pbakaus/impeccable) for visual direction and
  craft. Share discovery and verification rather than duplicate interviews.
  Use [state and transition coverage](references/state-coverage.md) for material
  flow gaps and [content resilience](references/content-resilience.md) when
  variable content or available space can hide information or actions.

Do not force a concept into a state machine or treat a component diagram as
proof of runtime behavior. Agent tool selection belongs to interaction-routing
workflows; standalone branding and artwork belong to visual workflows.

## Prevent errors at the owning boundary

When designing or reviewing a system, or addressing a recurring mistake,
state the invariant first: what must remain true, for which inputs and
transitions, and who owns every path that can violate it? Distinguish a
representation's guarantee from assumptions about ingestion, mutation,
external data, and concurrent writers.

1. Prefer a data model, API, type, or ownership boundary that makes invalid
   states unavailable through supported operations. Valid-state types belong
   here, before considering formatters or checks.
2. For violations that remain possible, prefer a safe formatter or autofix when
   the correction is unambiguous and preserves the required semantics.
3. Otherwise reject violations automatically at the relevant boundary through
   lint, type checks, runtime validation, or storage constraints.
4. Use reminders and manual review for contextual judgment or residual gaps;
   name what automation cannot establish.

Compare mechanisms against the same correctness requirement. This is a
preference for reducing error opportunities, not an absolute ranking of tools:
account for semantics, compatibility, adoption, and maintenance cost. Combine
layers when they protect different boundaries. Do not build an elaborate type
framework for a formatting rule or redesign a sound system for a one-off edit.

Read [invariants and prevention](references/invariants-and-prevention.md) when
choosing among these mechanisms, especially for keyed collections, dynamic
input, valid-state types, or ambiguous repairs. Hand TypeScript implementation
and compiler verification to
[vp-typescript-best-practices](https://github.com/VdustR/skills/tree/main/skills/vp-typescript-best-practices);
this skill owns the invariant, boundary, and design trade-off.

## Exercise scenarios and compare options

Trace a concrete case through the model: what starts it, what must already be
true, who or what is responsible, what changes, and what outcome establishes
success? Choose relevant alternate, boundary, failure, interruption, and change
cases. Include counterexamples for definitions and operational failures for
architectures. Mark unsupported or unknown cases without inventing capabilities.

Look for contradictions, missing responsibility, ambiguous transitions,
circular dependencies, and promises the available contracts cannot keep.
Separate a symptom from a demonstrated cause. When redesign is requested,
compare viable approaches against the goal and constraints, including keeping
the current design when viable. Explain the trade-offs and recommend an option;
do not invent numerical scores or requirements to justify a preference.

Resolve decisions that block correctness before implementation. A missing retry,
cancellation, consistency, or ownership guarantee remains an explicit unknown,
not a feature supplied by the model. A design request grants no authority to
change contracts, access sensitive data, publish, deploy, or execute live
operations. Prepare a concrete proposal and defer actions needing authority.

## Verify at the appropriate level

Choose evidence by the claim. A definition needs consistent application to
examples and counterexamples; a workflow needs representative handoff and
exception walkthroughs; architecture needs relevant contract checks,
experiments, or operational tests; UI changes need exercised interactions.
A diagram, checklist, or passing syntax check does not prove those outcomes.

Use controlled fixtures or owned test data for consequential operations. Label
manual decision walkthroughs, executable tests, independent agent trials, and
user research separately. Preserve uncertainty: a proposed recovery is not a
verified guarantee, a simulation is not production evidence, and an untested
quality target remains unverified. Do not manufacture performance thresholds
or claim exhaustive coverage across unknown conditions.

Return the requested explanation, model, review, or design decision with the
premises, trade-offs, evidence limits, and next action needed to use it. For a
review, connect each finding to the affected goal or scenario, consequence,
and smallest supported correction. Reopen only affected checks when the model
changes or new evidence appears; name persistent blockers instead of expanding
scope indefinitely.

Read [research and design boundaries](references/design-sources.md) when
extending the method or assessing a conflicting recommendation. Sources inform
this synthesis; they do not impose a universal notation or mandatory workshop.

## Related skills

- [`impeccable`](https://github.com/pbakaus/impeccable) for frontend visual
  direction and craft alongside user interaction reasoning.
- [`vp-stack-selection`](https://github.com/VdustR/skills/tree/main/skills/vp-stack-selection)
  when architecture decisions require choosing a technology stack.
- [`vp-css-best-practices`](https://github.com/VdustR/skills/tree/main/skills/vp-css-best-practices)
  when web CSS implements content, sizing, disclosure, and scroll decisions.
- [`vp-typescript-best-practices`](https://github.com/VdustR/skills/tree/main/skills/vp-typescript-best-practices)
  when valid-state modeling needs TypeScript implementation or compiler checks.
- [`vp-autodev`](https://github.com/VdustR/skills/tree/main/skills/vp-autodev)
  when the design proceeds through authorized implementation and delivery.
