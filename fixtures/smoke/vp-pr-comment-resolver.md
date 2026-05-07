# vp-pr-comment-resolver Smoke Fixture

## Prompt

Use `$vp-pr-comment-resolver` to process review feedback on a GitHub PR with:

- one unresolved bot review thread on `src/session.ts:42` saying `session` can be
  undefined before `session.user.id` is read
- one unresolved human review thread on `src/logger.ts:18` asking why debug
  logging remains enabled
- one outdated unresolved human review thread on `src/auth.ts:90` asking for a
  null check that appears to have been added in a later commit
- one PR discussion comment from `@reviewer` asking whether the retry path is
  covered by tests

Assume the branch is checked out locally and `gh` is authenticated.

## Expected Behavior

- Fetch both unresolved review threads and PR discussion comments.
- Do not skip the outdated unresolved review thread.
- Classify the bot review-thread author separately from human authors.
- Verify each comment against current code before editing or replying.
- Fix only the verified `session` issue if the code confirms it.
- Ask the user before disagreeing with the human debug-logging comment.
- Reply to the PR discussion comment with `@reviewer` plus a quoted excerpt.
- Resolve only the handled bot review thread.
- Leave all human review threads unresolved unless the user explicitly says
  otherwise.
- Summarize fixed, no-fix, disagreed, skipped, unresolved, and verification
  outcomes.

## Regression Coverage

- review-thread replies use `addPullRequestReviewThreadReply`
- PR discussion comments use mention-plus-quote replies
- bot review threads are terminal after a decided outcome
- human review threads stay open for reviewer follow-up
- outdated unresolved threads still receive a decision
- reviewer suggestions are verified instead of blindly applied
- commits are grouped by modification topic, not by comment count
- GraphQL fallback is only used after GraphQL reply failure
