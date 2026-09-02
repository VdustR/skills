---
name: vp-autodev
description: >-
  Take a valid issue or development task through research, reproduction,
  solution design, implementation, verification, draft PR review, feedback
  loops, merge, and release follow-up. Use for end-to-end development
  in repositories the user owns or is authorized to change. Boundary: use a
  narrower dependency, reproduction, checklist, or PR skill when the request
  covers only that step. In a user-specified repository the user owns, this
  workflow owns delivery through merge and required release follow-up when the
  repository's rules permit it and the change is low risk and fully verified.
  It does not authorize unrelated fixes or writes outside that workflow.
---

# Auto Development

Take an owned-repository issue or development task through the authorized
delivery lifecycle. Follow repository instructions and the user's preferred
language, framework, Git, GitHub, review, and release skills.

An explicit auto-development request authorizes these in-scope operations:
branch creation, commit, push, Draft PR creation, the Draft-to-Ready transition,
merge, and required release follow-up as one delivery workflow. Proceed without
repeated authorization when ownership is clear, repository policy permits the
action, required evidence applies to the current head, verification is
complete, feedback is handled, and remaining risk is low. Ask only when a
safety gate in this workflow requires a human decision.

## Workflow

Keep evidence for each decision from issue validation through delivery:

1. Start from a current issue disposition and acceptance criteria. Use
   `vp-issue-investigator` first when the problem is still suspected, stale, or
   unverified. Propose or make external corrections only when authorized.
2. Research the root cause and verify the failure at the strongest practical
   level: the real situation, a faithful simulation, or a minimal reproduction.
   State what each method does and does not prove.
3. Design a focused solution and review the design before coding. Check that it
   addresses the cause, fits repository conventions, and avoids foreseeable
   regressions. Record material alternatives, trade-offs, and the reason for the
   selected approach.
4. Create the working branch when needed and implement the smallest coherent
   change. Preserve unrelated user work and avoid opportunistic fixes. Commit
   and push the verified change as part of the delivery workflow.
5. Verify the fix against the reproduction and relevant tests, checks, builds,
   or real behavior. Compare before and after evidence and retain any unverified
   environment or hardware cases.
6. Create a Draft PR as part of the requested delivery workflow. Review the
   full diff, commits, and PR text as a maintainer before requesting human or
   automated review. Keep it Draft while material design, verification, or
   feedback remains unresolved; otherwise complete the Draft-to-Ready
   transition. Treat Ready as a new mutation that may trigger review automation,
   not as evidence that the pre-Ready feedback snapshot remains final.
   When local screenshots, recordings, diagrams, or other files materially show
   the result, route their publication in the PR through `vp-github` even if the
   development request did not separately say to upload them.
7. Record the current head commit, then monitor all repository-defined signals:
   CI, check runs, bot comments, pull request review comments (inline code
   comments), issue comments in the PR conversation, and reaction
   emoji on the main post or comments. Treat a changed emoji as new state, using
   that repository's convention instead of a universal mapping. Re-check that a
   positive signal applies to the current head.
8. Route both GitHub feedback surfaces through `vp-pr-comment-resolver`. Require
   a complete, independently paginated snapshot of PR conversation issue
   comments and review threads with all inline comments and replies; a partial
   read cannot establish that feedback is handled. Then repeat verification and
   monitoring. When all pre-Ready gates pass, advance to Ready. Do not require a
   terminal signal from a reviewer that is configured to start only after Ready;
   step 9 observes that reviewer after its trigger exists.
9. After Ready, start the final reviewer observation gate described in
   `references/reviewer-terminal-signals.md`. Bind reviewers triggered by Ready
   to the Ready trigger time and current head. Retain valid current-head evidence
   from pre-Ready-only reviewers instead of requiring a signal they will never
   re-emit. Wait a documented, bounded interval for every pending configured
   reviewer to reach a terminal signal; silence is not completion.
   For Codex, accept an authored review or thread, or the repository-documented
   no-finding reaction. Include PR-level, review-level, and inline-comment
   reactions plus delayed bot replies. Independently paginate PR conversation
   issue comments, submitted reviews, and review threads with every nested
   inline comment and reply. Route actionable items through
   `vp-pr-comment-resolver`, and block merge while any reviewer is pending or
   its terminal state is ambiguous.
10. After the last mutation, including Ready, a reply, fix, push, or thread
    resolution, reconcile again. Record the current head; re-read current-head
    CI and checks; completely re-fetch PR conversation issue comments,
    submitted reviews, review threads and their nested replies, and all
    configured reaction surfaces; and confirm every reviewer terminal signal
    still applies. A mutation invalidates the prior final
    snapshot. If a bounded wait expires without an attributable terminal
    signal, stop with the reviewer, head, trigger time, surfaces checked, wait
    policy, and exact missing evidence.
11. For a user-specified repository the user owns, merge when repository policy
   permits it, required evidence is green, feedback is handled, the change is
   fully verified, and the remaining risk is low. Treat the request to auto
   develop the change as authorization for this in-scope merge. Ask before
   merging when ownership is unclear, policy requires a human decision, risk is
   material, verification is incomplete, or the merge would expand scope.
12. After merge, determine from repository policy and release mechanics whether
    a release is required. Under the same ownership, policy, verification, and
    low-risk conditions, run the in-scope release workflow and verify the
    published result. Ask before a release with material operational impact,
    ambiguous versioning or release policy, incomplete verification, or scope
    beyond the requested change. Otherwise, record why no release is needed.

Successful completion reaches merge plus required release follow-up. Local
changes, a Draft PR, or a Ready PR are not successful terminal states when the
documented low-risk conditions permit further progress. When a safety gate
prevents progress, report the bounded terminal state and the exact missing
decision or evidence.

Do not treat CI success as proof that the issue is fixed, or silence from one
bot surface as proof that every review signal has completed.

## Problems discovered during the work

Investigate each distinct problem before recording it. Record third-party
dependency problems in the user's repository or chosen internal tracker first.
Do not open an upstream issue without separate authorization. Continue the
primary task when the new problem is non-blocking; stop and report it when
proceeding would be unsafe or would materially expand scope.

## Related skills

- [`vp-issue-investigator`](https://github.com/VdustR/skills/tree/main/skills/vp-issue-investigator)
  for validating and recording a distinct problem found during development.
- [`vp-minimal-repro`](https://github.com/VdustR/skills/tree/main/skills/vp-minimal-repro)
  for a re-runnable failure.
- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for Git and
  pull-request lifecycle decisions.
- [`vp-github`](https://github.com/VdustR/skills/tree/main/skills/vp-github) when
  local evidence should be attached to an issue, pull request, or comment.
- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  for author-side feedback resolution.
