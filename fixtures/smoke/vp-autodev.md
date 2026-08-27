# vp-autodev Smoke Fixture

## Prompt

Use `$vp-autodev` to fix a confirmed issue in a repository I own. The change is
small, repository policy permits automated delivery, all required checks and
review signals apply to the current head, feedback is handled, verification is
complete, and remaining risk is low. Continue through delivery and release
follow-up without asking me to authorize each Git or pull-request operation.

## Expected Behavior

- Treat branch creation, commit, push, Draft PR creation, the Draft-to-Ready
  transition, merge, and required release follow-up as authorized in-scope
  operations.
- Keep the PR Draft while material design, verification, or feedback is
  unresolved, then mark it Ready when those gates pass.
- Treat successful review completion as a transition to merge evaluation.
- Verify required evidence against the current head before advancing.
- Require complete, independently paginated snapshots of PR conversation issue
  comments and pull request review threads with all inline comments and replies.
- Merge when repository policy permits, verification is complete, feedback is
  handled, and remaining risk is low.
- Determine whether a release is required after merge, perform a low-risk and
  unambiguous in-scope release, and verify the published result.
- Ask only when ownership is unclear, policy requires a human decision,
  evidence is incomplete, risk is material, release semantics are ambiguous,
  or the action would expand scope.
- Report an explicit bounded terminal state and missing gate when progress must
  stop.

## Regression Coverage

- authorization covers branch creation, commit, push, Draft PR creation, and
  the Draft-to-Ready transition
- passing review signals advance to merge evaluation
- partial reads cannot establish that feedback is handled on either GitHub
  feedback surface
- a local change, Draft PR, or Ready PR is not a successful terminal state
- merge is followed by release follow-up and published-result verification
- safety gates and scope boundaries remain intact
