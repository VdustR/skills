---
name: vp-interaction-design
description: >-
  Design or review user-facing interaction behavior: user intents, interface
  states, information needs, action outcomes, and recovery. Use for web and
  native UI planning, implementation, UX copy, interaction bugs, and reviews,
  including onboarding, navigation, forms, settings, and embedded chat tools.
  Boundary: not agent tool routing, backend-only architecture, or standalone
  visual branding and static artwork.
---

# Interaction Design

Make each interaction understandable before use, truthful while it runs, and
recoverable when it fails. Cover the user's task across states and transitions,
not just the screen shown in a successful screenshot.

## Scope and composition

Use this skill for behavior and information architecture. For frontend design,
use it together with [Impeccable](https://github.com/pbakaus/impeccable) for visual
direction and interface craft. Resolve and read the installed skill, or its
canonical source, before applying it. Share discovery, product context, and
verification evidence; do not run two separate interviews or duplicate reviews.
Follow Impeccable's applicable setup and playbook when doing frontend work.

For a specification, copy review, or behavioral diagnosis without a frontend
build, apply the relevant reasoning without starting a visual implementation.
Keep the user's brief, established design system, platform conventions, and
fixed service contracts explicit. Preserve requested surfaces and supported
container constraints; a larger replacement surface is not a fix for omitted
small-container behavior. This skill grants no permission to change
contracts, publish, deploy, or act on real user data.

Scale work to the change. A button-label fix needs its affected action and
states checked; a new multi-step flow needs an explicit state and transition
map. Do not require a document, workshop, new capability, or full-product audit
for every edit. Ask only about unknowns that materially change the solution;
continue safe independent work and label remaining assumptions.

## Establish intent and coverage

Identify who arrives, through which entry points, what they know, and what they
need to accomplish or understand. Include relevant secondary intents such as
inspecting, comparing, postponing, correcting, canceling, and resuming. Define
observable success and the boundary of the task before choosing controls.

Inspect the existing interface, requirements, service responses, and available
research. Distinguish verified behavior, proposed behavior, and assumptions.
Ground expectations in user evidence, existing product behavior, or platform
conventions; do not treat an imagined persona as research.

Enumerate all known reachable states and transitions within scope, including
alternate entries and return paths. Use
[state and transition coverage](references/state-coverage.md) for a new flow,
behavioral change, or review with material state gaps. Group equivalent cases
only when their information needs and outcomes are the same. Mark unsupported,
unknown, and excluded cases; do not claim literal completeness over unknown
conditions or expand product scope to fill the list.

## Give each state enough information

For each relevant state, make it possible to understand:

- What is happening, which object is affected, and which data is current.
- What has taken effect, what is pending, and what remains uncertain.
- What the user can do next, with the prerequisites and consequences needed
  to make that decision.
- Why an expected action is unavailable and how to proceed, when explaining it
  is useful and does not disclose restricted information.

Keep user-facing UI focused on that need. Do not insert internal specifications,
implementation notes, acceptance criteria, or explanations of the design itself.
Translate relevant constraints into user consequences. Retain technical details
when the intended audience needs them; retain necessary privacy, safety, and
data-handling disclosures. Never invent product claims, success, recovery
options, or reasons for a failure.

Use hierarchy, familiar terms, and progressive disclosure. Keep information
needed for the current decision visible before commitment; place optional
detail where it can be found. Do not bury consequences in tooltips or hide
essential actions behind hover. Prefer a clearer control or sequence over
adding paragraphs to explain a confusing interaction.

## Design for content and available space

Before constraining variable content, choose its sizing bounds, wrapping or
truncation policy, full-content route, and intentional scroll regions/axes. Use
[content resilience](references/content-resilience.md) when text, available
space, or scroll behavior can hide information or actions. Natural content
growth is a valid size decision; avoid arbitrary bounds on every element.
Do not leave ellipsis, glyph clipping, or access to the full value as styling
details to decide after the design is complete.

## Make controls keep their promises

For every interaction element in scope, connect its label, appearance, semantic
role, and placement to the behavior it actually performs. Check prerequisites,
immediate feedback, final outcome, failure, and the next reachable state.
Check pointer, keyboard, touch, and assistive-technology behavior as applicable
to the supported platform; visual feedback alone is insufficient.

- Distinguish navigation, selection, editing, saving, and external commitment.
  Make the affected object and extent clear, especially for bulk actions.
- Preserve familiar navigation, focus, and return behavior. Consider deep links,
  Back, reload, and reopening when the flow supports them. Do not put sensitive
  or transient state into a URL merely to make it shareable.
- Distinguish accepted, queued, running, partially completed, and completed
  operations. Do not show final success before it is established. When an
  outcome is uncertain, reconcile it before offering a retry that might
  duplicate an action.
- Preserve user input and progress where appropriate. Make cancellation,
  dismissal, undo, and rollback match their actual guarantees. Use confirmation
  or undo in proportion to consequences rather than confirming every action.
- Keep feedback perceivable without relying only on color, animation, sound,
  or a disappearing toast. Respect motion preferences, readable content,
  meaningful focus order, and access to help and errors.
- Use realistic content and supported locales, data sizes, and device classes.
  Important distinctions must survive narrow layouts, text scaling, and long
  or missing content. Exercise full-content disclosure and intentional scroll
  regions, not only the initial truncated preview or first visible rows.

Prevent misleading affordances and manipulative defaults. Make refusal,
correction, and exit reasonably discoverable; do not disguise costs, consent,
or irreversible effects to improve conversion.

## Verify and review

Before implementation, walk through the intended flow and resolve mismatches
between intent, presented information, and action outcomes. After changes,
exercise the relevant paths against the implementation, including failure and
recovery. Review copy with
[vp-clear-writing](https://github.com/VdustR/skills/tree/main/skills/vp-clear-writing).

Use the state map to select meaningful verification. Cover distinct behavior
and high-consequence paths rather than every redundant Cartesian combination.
Use controlled fixtures or owned test data for destructive, paid, permission,
or messaging operations; a design task does not authorize a live commitment.

Share a bounded verification pass with Impeccable when both apply. Screenshots
can establish visual state, not action effects or successful recovery. Label
manual walkthroughs, executed interaction tests, and user research separately.
Identify what remains unverified, including physical-device behavior when only
emulation was available. Do not call accessibility or user expectations proven
by a checklist alone.

Return the requested artifact. For a review, report the affected intent and
state, the misleading or missing information, the user consequence, and the
smallest supported correction. Keep internal coverage notes out of the product
UI. Reopen verification only for changed behavior, new evidence, or a required
final check; report a persistent blocker instead of polishing indefinitely.

Read [research and design boundaries](references/design-sources.md) when
extending this workflow or evaluating a conflicting recommendation from another
design skill; it is not a required reading list for every UI task.

## Related skills

- [`impeccable`](https://github.com/pbakaus/impeccable) for frontend visual
  direction, composition, and interface craft alongside this workflow.
- [`vp-css-best-practices`](https://github.com/VdustR/skills/tree/main/skills/vp-css-best-practices)
  when web CSS implements sizing, text overflow, disclosure, and scroll decisions.
- [`vp-clear-writing`](https://github.com/VdustR/skills/tree/main/skills/vp-clear-writing)
  for clear labels, instructions, feedback, and error messages.
- [`vp-autodev`](https://github.com/VdustR/skills/tree/main/skills/vp-autodev)
  when the request includes implementation and authorized delivery.
