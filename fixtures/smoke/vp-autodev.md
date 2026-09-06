# vp-autodev Smoke Fixture

## Prompt

Use `$vp-autodev` to fix a confirmed issue in a repository I own. The change is
small, repository policy permits automated delivery, all required checks and
review signals apply to the current head, feedback is handled, verification is
complete, and remaining risk is low. Continue through delivery and release
follow-up without asking me to authorize each Git or pull-request operation.

Also evaluate these decision cases without performing external writes:

- The same finding remains after two correction passes, and no new evidence
  supports repeating the fix.
- The user allows five correction passes; the same finding remains after two
  and there is no new hypothesis. Separately, the user allows only one pass
  and that pass has already failed.
- All acceptance criteria pass and the unchanged head has a completed review;
  an optional unrelated refactor is suggested.
- Two passes have elapsed, but Codex is still pending on the current head.
- A workflow document passes syntax and fixture checks, but no decision
  scenario has been exercised.

## Expected Behavior

- Treat branch creation, commit, push, Draft PR creation, the Draft-to-Ready
  transition, merge, and required release follow-up as authorized in-scope
  operations.
- Keep the PR Draft while material design, verification, or feedback is
  unresolved, then mark it Ready when those gates pass.
- Apply the pre-Ready gates before Ready without requiring terminal evidence
  from a reviewer that starts only after Ready.
- Treat Ready as a new review trigger and start a bounded final observation
  gate. A delayed inline Codex review blocks merge until its actionable finding
  is processed through `vp-pr-comment-resolver` and reconciled.
- Require an attributable terminal signal for every configured reviewer. For
  Codex, accept an authored review or thread, or a repository-documented
  reaction-only no-finding signal; silence after Ready remains pending.
- Treat successful review completion as a transition to merge evaluation.
- Verify required evidence against the current head before advancing.
- Require complete, independently paginated snapshots of PR conversation issue
  comments and pull request review threads with all inline comments and replies.
- Independently paginate submitted reviews so approvals and actionable
  body-only reviews cannot be missed.
- Include delayed bot replies plus PR-level, review-level, and inline-comment reactions
  in the final snapshot.
- Independently paginate every reaction collection and record completion so a
  no-finding or conflicting signal cannot be omitted.
- A terminal review signal starts settle/readback and does not permit immediate merge;
  finish the bounded observation and refresh again.
- Re-read current-head CI and feedback after the last mutation, including Ready,
  a reply, fix, push, or thread resolution.
- Merge when repository policy permits, verification is complete, feedback is
  handled, and remaining risk is low.
- Determine whether a release is required after merge, perform a low-risk and
  unambiguous in-scope release, and verify the published result.
- Ask only when ownership is unclear, policy requires a human decision,
  evidence is incomplete, risk is material, release semantics are ambiguous,
  or the action would expand scope.
- Report an explicit bounded terminal state and missing gate when progress must
  stop.
- Reassess repeated failures with a discriminating check; report a blocker if
  no safe next step exists instead of repeating the same edit.
- With a five-pass budget, reassess after the second failed correction before
  attempting a third; the budget does not postpone reassessment. With a
  one-pass budget, do not run a second correction just to reach reassessment.
- Defer the unrelated refactor and proceed to final reconciliation and merge
  evaluation without retriggering a completed review on the unchanged head.
- Keep merge blocked while Codex is pending regardless of correction count.
- Exercise the document's decisions and state the verification method; do not
  describe syntax or fixture-content checks as an agent trial.

## Regression Coverage

- authorization covers branch creation, commit, push, Draft PR creation, and
  the Draft-to-Ready transition
- passing review signals advance to merge evaluation
- a Ready-triggered delayed inline review cannot be bypassed by a pre-Ready
  snapshot
- a Ready-only reviewer cannot create a circular pre-Ready prerequisite
- valid current-head evidence from a pre-Ready-only reviewer survives Ready
- submitted reviews are a separate fully paginated collection
- a documented Codex no-finding reaction is recorded as an attributable
  reaction-only terminal signal
- delayed bot replies and all configured reaction surfaces are included
- queued, reviewing, and acknowledgment bot replies remain pending unless their
  documented semantics establish a terminal result
- a terminal signal cannot bypass the final bounded settle/readback
- actionable findings block merge until `vp-pr-comment-resolver` completes and
  the workflow reconciles again
- current-head CI and feedback are both re-read after the last mutation
- a bounded wait ends in a safe blocker when a reviewer has no terminal signal
- partial reads cannot establish that feedback is handled on either GitHub
  feedback surface
- a local change, Draft PR, or Ready PR is not a successful terminal state
- merge is followed by release follow-up and published-result verification
- safety gates and scope boundaries remain intact
