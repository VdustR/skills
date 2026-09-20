# Automated Review Observation

Automated review is an asynchronous feedback source, not an automatic delivery
gate. Observe what the repository produces. Starting a new review is an
optional action rather than a default lifecycle step.

## Invocation boundary

- Invoke a reviewer with a command such as `@codex review`, a review request, or
  another trigger when the user or a repository-owned procedure explicitly
  instructs that action. Do not infer that instruction from the workflow itself.
- An installed integration, a bot summary comment, historical review activity,
  or documentation showing how to invoke a reviewer does not authorize
  invocation.
- Ready may cause repository automation to start on its own. Observe that state;
  do not assume that Ready must produce a review.
- Do not wait for a reviewer that has not started unless the user or repository
  procedure asked to invoke it. If a reviewer is visibly running, allow a
  bounded observation window appropriate to the repository and delivery risk.

## Optional review degradation

Repository-defined optional reviews must not leave an unattended pull request
stuck indefinitely. Before temporarily proceeding without one, make a
reasonable attempt to retrigger it through the repository-supported mechanism;
this distinguishes a transient failure from an unavailable reviewer. Then use
judgment from the observed state rather than a rigid retry count or timer.

Repeated failures, exhausted quota, or an excessive wait are valid reasons to
degrade an optional review to unobserved and continue when required evidence is
otherwise complete. About one hour is a useful default reference for an
unattended pull request, not a mandatory deadline: shorten or extend it based on
repository conventions, reviewer progress, change risk, cost, and whether a
retry produced new evidence. Do not repeat a trigger that is unsupported,
unsafe, known to consume unavailable quota, or unlikely to change the result.

Record the reviewer, attempts, observed failure or quota state, elapsed wait,
and why proceeding remains safe. Continue observing later feedback and process
it if it arrives. This degradation applies only to optional reviews; a review
required by repository policy remains a required gate. Never degrade or bypass
a required review because of failures, quota exhaustion, or elapsed time. Keep
the pull request blocked until the reviewer recovers and completes, or until the
user explicitly directs the next action.

## Existing feedback

Process every actionable item that actually appears through
`vp-pr-comment-resolver`. A stale-head item may still identify a current defect,
so verify the claim against the current head instead of discarding it by age.
Resolved and outdated threads remain useful context.

## Complete final snapshot

After Ready and after every later mutation:

1. Record the current head and current-head CI and check states.
2. Fetch every PR conversation issue comment with complete pagination.
3. Fetch every submitted review with independent complete pagination, including
   its body, state, author, submission time, commit, and reactions.
4. Fetch every review thread, every inline comment, and every nested reply with
   independently complete pagination, including resolved and outdated threads.
5. Fetch reactions on the PR, reviews, inline comments, and repository-specified
   feedback targets when those surfaces exist. Independently paginate each
   collection and record pagination completion.
6. Route new actionable feedback through `vp-pr-comment-resolver`. Any reply,
   fix, push, or thread resolution restarts the final snapshot.
7. Record an automated reviewer that did not run as unobserved. If repository
   procedure requested an optional review, apply the retry and degradation
   judgment above before proceeding. Then evaluate merge from the verified
   implementation, CI, repository policy, feedback that exists, and remaining
   risk.

Do not merge from a partial read, a stale positive check, unresolved actionable
feedback, or incomplete verification. Reviewer silence is neither proof of no
findings nor an automatic reason to summon or wait for the reviewer.
