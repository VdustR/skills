---
name: vp-autodev
description: >-
  Take a valid issue or development task through research, reproduction,
  solution design, implementation, verification, draft PR review, feedback
  loops, merge readiness, and release follow-up. Use for end-to-end development
  in repositories the user owns or is authorized to change. Boundary: does not
  grant permission for external writes, merge, release, or unrelated fixes.
---

# Auto Development

Take an owned-repository issue or development task through the authorized
delivery lifecycle. Follow repository instructions and the user's preferred
language, framework, Git, GitHub, review, and release skills.

## Outcome

Keep evidence for each decision from issue validation through delivery:

1. Validate that the issue or task describes a real, current problem or desired
   change. Identify stale scope, assumptions, acceptance criteria, or impact
   before implementation. Propose or make external corrections only when
   authorized, and explain material changes.
2. Research the root cause and verify the failure at the strongest practical
   level: the real situation, a faithful simulation, or a minimal reproduction.
   State what each method does and does not prove.
3. Design a focused solution and review the design before coding. Check that it
   addresses the cause, fits repository conventions, and avoids foreseeable
   regressions. Record material alternatives, trade-offs, and the reason for the
   selected approach.
4. Implement the smallest coherent change. Preserve unrelated user work and
   avoid opportunistic fixes.
5. Verify the fix against the reproduction and relevant tests, checks, builds,
   or real behavior. Compare before and after evidence and retain any unverified
   environment or hardware cases.
6. Create a draft pull request when authorized. Review the full diff, commits,
   and PR text as a maintainer before requesting human or automated review.
7. Record the current head commit, then monitor all repository-defined signals:
   CI, check runs, bot comments, inline threads, PR discussion, and reaction
   emoji on the main post or comments. Treat a changed emoji as new state, using
   that repository's convention instead of a universal mapping. Re-check that a
   positive signal applies to the current head.
8. Verify feedback before acting, make focused corrections, respond on the
   original surface, and repeat verification and monitoring. Stop when all
   required signals pass, the repository reports that automated review finished
   with no feedback, or a blocker or human decision is explicit. If the
   repository exposes no completion signal, perform a fresh final check and
   report that limitation instead of claiming every bot passed.
9. Merge only when authorized, repository policy permits it, required evidence
   is green, feedback is handled, and the remaining risk is low enough for that
   repository. Do not infer merge permission from the skill invocation alone.
10. After merge, determine from repository policy and release mechanics whether
    a release is required. Run the authorized release workflow and verify the
    published result, or record why no release is needed.

Keep the pull request draft while material design, verification, or feedback is
unresolved. Do not treat CI success as proof that the issue is fixed, or silence
from one bot surface as proof that every review signal has completed.

## Problems discovered during the work

Route each distinct problem through
[`vp-issue-investigator`](https://github.com/VdustR/skills/tree/main/skills/vp-issue-investigator).
Record third-party dependency problems in the user's repository or chosen
internal tracker first. Do not open an upstream issue without separate
authorization. Continue the primary task when the new problem is non-blocking;
stop and report it when proceeding would be unsafe or would materially expand
scope.

## Related skills

- [`vp-minimal-repro`](https://github.com/VdustR/skills/tree/main/skills/vp-minimal-repro)
  for a re-runnable failure.
- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for Git and
  pull-request lifecycle decisions.
- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  for author-side feedback resolution.
- [`vp-tldr`](https://github.com/VdustR/skills/tree/main/skills/vp-tldr) for a
  concise PR or issue opening.
