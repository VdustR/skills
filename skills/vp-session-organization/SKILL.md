---
name: vp-session-organization
description: >-
  Generate a concise session title, or manage session names and verified related
  groups when requested or covered by standing user authorization. Use when a
  durable objective becomes clear or materially changes under that policy.
  Boundary: not for files, variables, branches, or general task execution.
---

# Session Organization

## Choose the mode

- **Generate:** When the user only asks for a title or suggestions, return only
  the title unless they ask for alternatives or rationale. Do not mutate session
  metadata. A title-only request takes precedence over routine auto-management.
- **Manage:** Apply names or groups only within the user's explicit request or
  applicable standing authorization. This skill does not itself grant that
  authorization. Read [Session metadata](references/session-metadata.md) before
  changing metadata or deciding how a harness supports it.

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

Let the group name carry shared context and each session name express its
distinct goal. Keep enough context in each title to make sense outside the group:
in `Checkout reliability`, prefer `Checkout timeout repair` and `Checkout retry
validation` over `Fix` and `Tests`. A sidebar section is an organizational aid;
do not claim it creates a parent-child execution relationship.

Use the [decision scenarios](references/decision-scenarios.md) when reviewing
changes to this workflow. They are manual walkthrough cases, not proof of
automatic skill selection or cross-harness behavior.

## Related skills

- [`vp-interaction-routing`](https://github.com/VdustR/agent-plugin-vp-interaction-routing/tree/main/skills/vp-interaction-routing)
  when selecting a supported interface for session metadata changes.
