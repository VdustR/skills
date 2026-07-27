# GitHub Operations

Prefer the connected GitHub integration when it exposes review-thread reads and
writes. Otherwise inspect the current `gh` and GraphQL help/schema before
constructing requests.

## Important Distinctions

- Review threads are not issue comments. Reply through the review-thread reply
  mutation; a bottom-of-PR comment is not equivalent.
- Resolving a review thread is a separate mutation from replying.
- PR discussion comments use the PR conversation surface and have no resolution
  state.
- Thread identifiers, comment identifiers, and PR node identifiers are not
  interchangeable.

Fetch enough pagination to prove no unresolved thread or later reply was missed.
Use typed variables or a payload file for multiline GraphQL and reply bodies.
After every mutation, re-query the target rather than trusting only the mutation
response.

If the intended review-thread operation is unavailable, stop or use a documented
fallback that preserves the correct surface. Do not silently substitute a
general PR comment.
