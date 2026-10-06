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

## Authorization

A user request to process or resolve feedback on a specified PR authorizes
evidence-backed replies on that PR and resolution of handled bot review threads.
Send those replies directly when the evidence supports a safe decision and no
material risk or human judgment remains; do not require approval of each reply.
This includes routine replies to human reviewers and explanations of incorrect
or already-handled claims. A read-only review or request to draft replies does
not authorize sending. Respect any explicit approval requirement in the task.

Ask when evidence cannot settle a safe decision, a material product or
architectural choice remains, or feedback reveals severe risk or substantial
scope or cost expansion. Commits, pushes, history rewriting, other external
writes, and PR lifecycle changes need authorization from the task or its outer
workflow. Human review threads still require explicit direction to resolve.

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

## Convergence for automated feedback

Keep bot feedback tied to the requested change, its acceptance criteria, and
the evidence needed for safe delivery. Fix verified correctness or regression
problems within scope. When current code or proportionate test evidence
disproves a finding, explain that evidence and close the eligible bot thread
instead of changing correct code. Defer speculative hardening, preference-only
refactors, and unrelated improvements once the delivery criteria are satisfied.

Batch related findings into a coherent correction pass. New feedback reopens
only the affected decision and verification unless it reveals a broader
problem. Do not keep expanding implementation or verification merely because a
bot can suggest another improvement.

Pause for user judgment when feedback reveals a severe security, data
integrity, compatibility, or operational risk; requires a material product or
architectural decision; or would substantially expand the agreed scope or
cost. Otherwise, make the narrowest evidence-backed decision and continue the
authorized workflow.

Apply the authorization rules above to replies and resolutions. Read only the
relevant reference:

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
