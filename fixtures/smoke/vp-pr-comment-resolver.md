# vp-pr-comment-resolver Smoke Fixture

## Prompt

Use `$vp-pr-comment-resolver` to process review feedback on a GitHub PR with:

- one unresolved bot review thread on `src/session.ts:42` saying `session` can be
  undefined before `session.user.id` is read
- one unresolved human review thread on `src/logger.ts:18` asking why debug
  logging remains enabled
- one outdated unresolved human review thread on `src/auth.ts:90` asking for a
  null check that appears to have been added in a later commit
- 101 issue comments in the PR conversation across two REST pages, including a
  comment from `@reviewer` asking whether the retry path is covered by tests
- one body-only submitted review with actionable feedback and no inline thread
- a review thread whose inline review-comment replies require a second GraphQL
  page

Assume the branch is checked out locally and `gh` is authenticated.

## Expected Behavior

- Fetch every issue comment in the PR conversation and the pull request review
  surface, including every submitted review and every review thread with all
  inline review comments and replies.
- Paginate submitted reviews independently so the body-only review is processed.
- Exhaust REST and GraphQL pagination independently, record counts and final
  cursors, and do not treat a partial read as evidence that feedback is handled.
- Do not skip the outdated unresolved review thread.
- Classify the bot review-thread author separately from human authors.
- Verify each comment against current code before editing or replying.
- Fix only the verified `session` issue if the code confirms it.
- Ask the user before disagreeing with the human debug-logging comment.
- Reply to the PR conversation issue comment with `@reviewer` plus a quoted
  excerpt.
- For the actionable submitted-review body, reply in the PR conversation and
  identify and link the original review because GitHub has no top-level review
  reply mutation.
- Link each fix commit with a short SHA as the label and the canonical GitHub
  commit URL containing the full SHA as the target.
- Resolve only the handled bot review thread.
- Leave all human review threads unresolved unless the user explicitly says
  otherwise.
- Summarize fixed, no-fix, disagreed, skipped, unresolved, and verification
  outcomes.

## Regression Coverage

- review-thread replies use `addPullRequestReviewThreadReply`
- PR conversation issue comments use mention-plus-quote replies
- both GitHub feedback surfaces are mandatory and independently paginated
- submitted reviews are independently paginated within the review surface
- nested inline review-comment replies are fully paginated
- resolved threads are retained during retrieval and filtered afterward
- bot review threads are terminal after a decided outcome
- human review threads stay open for reviewer follow-up
- outdated unresolved threads still receive a decision
- reviewer suggestions are verified instead of blindly applied
- commits are grouped by modification topic, not by comment count
- fix replies use an explicit Markdown commit link, not a bare or code-formatted
  SHA
- GraphQL fallback is only used after GraphQL reply failure
- submitted-review body replies identify and link the original review in the PR
  conversation
