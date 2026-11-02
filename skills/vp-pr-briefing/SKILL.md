---
name: vp-pr-briefing
description: >-
  Orient a user to an unfamiliar GitHub pull request. Use when taking over,
  summarizing, or understanding a PR, its implementation, review state, risks,
  and next actions. Boundary: not for resolving feedback or writing a review.
---

# Pull Request Briefing

Build the briefing from the current PR, full diff, linked context, checks, and
review conversation. Do not treat the description as verified implementation.
Resolve the exact host, owner, repository, and PR number from the user's URL or
an unambiguous local remote before querying; never rely on the number alone.

Read relevant artifacts on linked issues through `vp-github` when they contain
requirements, design decisions, or verification evidence. Retain the artifact
version and source revision when relevant; compare plans and claims with the
current diff and checks. A PR cannot own an issue artifact directly. Mark an
inaccessible artifact as missing context without inventing its contents or
expanding access.

Apply `vp-clear-writing` to the briefing. Use `vp-design-reasoning` when a
behavior model or trade-off needs explanation; choose a decision tree for
conditional behavior, a flow for handoffs, or a table for comparisons only when
it helps answer the reader's question. Keep the problem, result, material
risks, evidence limits, and next action understandable without opening links.

## Briefing

Cover:

- the problem and user impact;
- scope, main design decisions, and implementation shape;
- important dependencies and linked requirements;
- current head, checks, review state, and unresolved feedback;
- behavioral, migration, operational, and rollout risks;
- ownership, blockers, and the next useful action.

Separate repository evidence, hosting-platform state, and inference. Explain
unfamiliar code paths at the reader's altitude and link to the most useful
primary context. A checked-out branch is not proof that the local checkout
matches the PR head.

## Related skills

- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  when the PR author needs to address actionable feedback.
- [`vp-pr-review-followup`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-review-followup)
  when a reviewer needs to verify the author's response or fix.
- [`vp-checklist-runner`](https://github.com/VdustR/skills/tree/main/skills/vp-checklist-runner)
  when the PR contains an existing checklist to verify.
- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for the
  next authorized pull-request lifecycle action.
- [`vp-github`](https://github.com/VdustR/skills/tree/main/skills/vp-github)
  when linked issue artifacts supply design or verification context.
