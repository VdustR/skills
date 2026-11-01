---
name: vp-session-organization
description: >-
  Generate a concise session title, or manage session names and verified related
  groups when requested or covered by standing user authorization. Use when a
  discussion settles on a concrete objective or the durable objective materially
  changes under that policy, including before implementation begins.
  Boundary: session metadata only; not session creation, execution, handoff,
  closeout, files, variables, or branches.
---

# Session Organization

## Choose the mode

- **Generate:** When the user only asks for a title or suggestions, return only
  the title unless they ask for alternatives or rationale. Do not mutate session
  metadata. A title-only request takes precedence over routine auto-management.
- **Manage:** Apply names or groups only within the user's explicit request or
  applicable standing authorization. This skill does not itself grant that
  authorization. Follow the [management decision tree](references/decision-tree.md)
  and [metadata procedure](references/session-metadata.md). Read only the relevant
  [harness guidance](references/harness-capabilities.md) when choosing an operation.

Authorization comes from the user or applicable personal policy; this skill owns
the procedure. Session notes preserve working context, not proof that a title or
group was changed. Keep execution lifecycle and closeout with their owning
workflows.

## Name the durable goal

Identify the context and intended outcome from the conversation. Once they are
clear, prefer a short title with concrete nouns and an action or state when
useful. Include the product, repository, or domain when needed to distinguish
the work; avoid generic labels, incidental tool names, and bare ticket numbers.
Use the user's language unless they request another. Do not imply completion
that has not been verified or expose sensitive details in sidebar metadata.

Preserve an explicit user-chosen name unless the user authorizes replacing it.
Keep an existing name that already describes the durable goal. If the goal is
still unclear, defer automatic renaming; an explicit naming request can use the
best-supported theme without inventing missing context.

Under standing auto-naming authorization, proactively check the displayed name
when an exploratory discussion first settles on a concrete direction, including
when the user proceeds directly to implementation without mentioning naming.
Do this as part of starting that work, without another naming request. Replace
a vague opening-prompt title or an outdated automatically managed name with the
now-clear context and intended outcome, then read it back. Keep an already
accurate title or a protected user-selected name. Initial clarification is a
naming trigger even when the overall topic has not changed; entering an
implementation phase alone is not.

A request to keep the current name is a preservation outcome, not a rename
operation that needs capability discovery. Report it as kept, not unavailable.

Revisit an automatically managed name only when the durable objective materially
changes. A new command, temporary investigation, implementation phase, test
failure, or completion of one subtask normally leaves the objective unchanged.
For example, investigating a checkout timeout and testing its fix still fit
`Checkout timeout repair`; switching the assignment to a payment-provider
migration warrants a new name.

## Organize related sessions

Group only current work with a verified shared objective or parent-child
relationship, within the authorized set of sessions. Similar titles, repository
paths, or keywords alone do not establish a family. Reuse a suitable group and
preserve user-selected names and organization.

Resolve missing relationship evidence before exploring grouping operations.
When only shared keywords are known, defer grouping and state what relationship
or target identification is missing; lack of a tool is not the primary finding.

Let the group name carry shared context and each session name express its
distinct goal. Keep enough context in each title to make sense outside the group:
in `Checkout reliability`, prefer `Checkout timeout repair` and `Checkout retry
validation` over `Fix` and `Tests`. A sidebar section is an organizational aid;
do not claim it creates a parent-child execution relationship.

Use the [decision scenarios](references/decision-scenarios.md) when reviewing
changes to this workflow. They are manual walkthrough cases, not proof of
automatic skill selection or cross-harness behavior.

## Verify the smallest change

Discover capabilities per operation and target, not per product name. Distinguish
an agent-callable tool, a user-facing slash command, and an externally operated
UI. Verify the exact session identity, compare current and intended state, and
skip changes that already fit. Rename and grouping may have different support.

Use a complete semantic interface first. If one is missing, route eligible UI
work through `vp-interaction-routing`; absence of an API alone does not establish
that management is impossible. Routine auto-management should not repeatedly
launch interactive clients or steal focus merely to discover capabilities.
When no eligible route is available, continue the original task and provide a
supported manual action if management was requested.
Recommend a manual action only when documentation or observation establishes
that exact operation. Do not invent a picker or sidebar grouping feature as a
fallback for unknown grouping support.

Read back the resulting title or membership. A zero exit code, a generated
title, a success message, or the agent's own claim does not establish the intended
state. Read uncertain state before retrying; preserve intervening user changes.
Keep verified, unverified, unavailable, and blocked operations distinct, and
report partial results without claiming the whole request succeeded.

## Related skills

- [`vp-interaction-routing`](https://github.com/VdustR/agent-plugin-vp-interaction-routing/tree/main/skills/vp-interaction-routing)
  when selecting a supported interface for session metadata changes.
- [`vp-session-wrapup`](https://github.com/VdustR/skills/tree/main/skills/vp-session-wrapup)
  when ending a session requires outcome reporting or leftover-state review.
