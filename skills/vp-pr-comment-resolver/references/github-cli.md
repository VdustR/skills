# GitHub Operations

Prefer the connected GitHub integration when it exposes review-thread reads and
writes. Otherwise inspect the current `gh` and GraphQL help/schema before
constructing requests.

## Important Distinctions

- GitHub's REST API calls bottom-of-PR conversation comments **issue comments**.
  They are often called PR comments in conversation, but they use
  `/repos/{owner}/{repo}/issues/{pull_number}/comments`.
- GitHub calls inline code comments **pull request review comments**. GraphQL
  groups them into `PullRequestReviewThread` objects that expose resolution and
  outdated state.
- Review threads are not issue comments. Reply through the review-thread reply
  mutation; a bottom-of-PR comment is not equivalent.
- Resolving a review thread is a separate mutation from replying.
- PR conversation issue comments have no resolution state.
- Thread identifiers, comment identifiers, and PR node identifiers are not
  interchangeable.

Fetch both surfaces explicitly; `gh pr view --comments` or one `gh api` call is
not completeness evidence for both. For REST, use `gh api --paginate` and verify
the issue-comment count. For GraphQL, paginate `reviewThreads` and, when a
thread's `comments.pageInfo.hasNextPage` is true, paginate that nested
connection as well. Preserve stable comment and thread IDs and deduplicate by
node ID. Record each collection's count and final `hasNextPage: false` state.

Do not filter to unresolved threads during retrieval. Filter only after the
complete snapshot exists; resolved or outdated threads and later replies may
show that a request was handled or superseded.

Fetch enough pagination to prove no review thread, inline reply, or PR
conversation issue comment was missed.
Use typed variables or a payload file for multiline GraphQL and reply bodies.
After every mutation, re-query the target rather than trusting only the mutation
response.

If the intended review-thread operation is unavailable, stop or use a documented
fallback that preserves the correct surface. Do not silently substitute a
general PR comment.
