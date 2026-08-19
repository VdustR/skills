---
name: vp-tldr
description: >-
  Write or rewrite the concise summary that opens an artifact, message, or
  update so a reader without prior context can quickly understand the outcome,
  relevance, current state, and required action. Use for TL;DR blocks, executive
  summaries, pull request or issue openings, design documents, investigations,
  handoff notes, status updates, and other content whose conclusion or important
  uncertainty is buried. Boundary: covers the summary only, not the surrounding
  body and not a review of the underlying work.
---

# TL;DR Summary

Write the smallest summary that lets the intended reader decide whether the
artifact concerns them and what, if anything, they need to do.

## Follow the artifact

Apply instructions in this order:

1. Follow the user's requested content and structure.
2. Follow an established artifact template or documented convention.
3. Choose the shortest structure that preserves the important meaning.

Do not impose a standard TL;DR template when the user or artifact already has
one. Preserve requested labels and section order. When no structure is given,
use a short paragraph or a few bullets. Add labels only when they make distinct
kinds of information easier to scan.

## Select the content

Lead with the conclusion or current outcome. Include only details that change a
reader's understanding, decision, or next action. Depending on the source, that
may include:

- the topic and why it matters;
- the result, decision, or current state;
- the most important supporting point;
- a material limitation, risk, blocker, or unknown;
- the owner, dependency, or next action.

These are content options, not required sections. Omit empty concepts instead
of writing `None`, and do not manufacture a problem, approach, trade-off,
evidence item, or next action merely to complete a shape.

When labels help, derive them from the artifact and audience. Examples include
`Bottom line`, `Status`, `Decision`, `Evidence`, `Open`, and `Next action`.
Rename, reorder, merge, or omit them freely. See `references/beats.md` when
choosing a structure or checking length.

## Preserve epistemic status

Represent the source faithfully:

- State established facts directly.
- Attribute externally supplied claims when attribution affects trust.
- Mark inference, uncertainty, and unresolved questions in plain language.
- Name an owner for a confirmation, blocker, or next action when one is known.
- Do not upgrade a plausible claim into a verified fact.

Use a link or precise reference when the source provides one and it helps the
reader check a consequential claim. Do not require every fact to have an
external link, and do not invent evidence that is absent. See
`references/evidence.md` for evidence and attribution guidance.

## Rewrite from the current source

Make the summary true of the source's current state. When updating an existing
summary, reread the source before relying on the old wording. Remove superseded
claims and resolved questions rather than preserving an edit history in the
summary. See `references/rewrite.md` for the update check.

## Check the result

Ensure the first sentence carries the main point, each remaining sentence earns
its place, and the summary does not contradict the body. Remove filler,
unsupported intensifiers, process narration, and detail that belongs in the
body. Use `references/anti-slop.md` for the final language check.

## Route

Use a workflow-specific skill when the user needs investigation, review,
verification, lifecycle work, or edits beyond the summary. Apply this skill to
the summary portion only when the user requests its TL;DR logic there.
