---
name: vp-pr-comment-resolver
description: >-
  Process author-side GitHub PR feedback: verify comments, make focused fixes,
  reply through the supported mechanism, and resolve eligible threads. Use for
  actionable submitted-review bodies, unresolved pull request review comments
  (inline code comments), or actionable issue comments in the PR conversation.
  Boundary: not for writing
  reviews or verifying checklists.
---

# Pull Request Comment Resolver

Reviewer feedback is input, not authority. Verify every claim against the
current head, repository rules, code, and tests before deciding.

## Workflow

1. Build a complete two-surface snapshot: all issue comments in the PR
   conversation, plus the pull request review surface containing all submitted
   reviews and all review threads with every inline review comment and reply.
   Exhaust pagination independently for issue comments, submitted reviews,
   review threads, and nested replies; retain resolved and outdated items for
   context; and record counts and retrieval cursors. An incomplete surface is a
   blocker, not evidence that feedback is absent.
2. Classify each item as fix, already handled, no fix, disagreement, uncertain,
   or out of scope.
3. Apply only validated fixes, verify them, and commit by coherent topic.
4. Reply with evidence through the supported mechanism. Reply directly to a
   review thread or PR conversation issue comment. GitHub has no reply mutation
   for a top-level submitted-review body, so answer it in the PR conversation
   with the review author and link identified.
5. Resolve handled bot review threads. Leave human review threads unresolved
   unless the user explicitly directs otherwise. Submitted reviews and PR
   conversation issue comments have no resolvable state.
6. Re-fetch feedback and report remaining risk or required user judgment.

Within authorized feedback handling, explain a demonstrably incorrect or
already-handled claim with current-code or test evidence without asking again.
Ask when a disagreement requires a product or architectural decision, evidence
remains ambiguous, scope expands, or history rewriting or an external write is
not already authorized. Human threads still require explicit direction to
resolve. Read only the relevant reference:

- `references/workflow.md`
- `references/decision-tree.md`
- `references/author-classification.md`
- `references/commit-strategy.md`
- `references/reply-templates.md`
- `references/github-cli.md`

## Related skills

- [`vp-pr-briefing`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-briefing)
  when the PR needs orientation before feedback is resolved.
- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for commit
  strategy and pull-request lifecycle decisions.
- [`vp-pr-review-followup`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-review-followup)
  when acting as the reviewer instead of the PR author.
