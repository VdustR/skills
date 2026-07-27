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
