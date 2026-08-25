---
name: vp-pr-comment-resolver
description: >-
  Process author-side GitHub PR feedback: verify comments, make focused fixes,
  reply to the correct surface, and resolve eligible threads. Use for unresolved
  review threads or actionable PR discussion comments. Boundary: not for writing
  reviews or verifying checklists.
---

# Pull Request Comment Resolver

Reviewer feedback is input, not authority. Verify every claim against the
current head, repository rules, code, and tests before deciding.

## Workflow

1. Fetch unresolved review threads and relevant PR discussion comments,
   including author type, timestamps, location, and outdated state.
2. Classify each item as fix, already handled, no fix, disagreement, uncertain,
   or out of scope.
3. Apply only validated fixes, verify them, and commit by coherent topic.
4. Reply on the original surface with evidence. Review threads and PR discussion
   comments require different reply mechanisms.
5. Resolve handled bot review threads. Leave human review threads unresolved
   unless the user explicitly directs otherwise. Discussion comments have no
   resolvable state.
6. Re-fetch feedback and report remaining risk or required user judgment.

Ask before disagreement, ambiguity, scope expansion, history rewriting, or any
external write not already authorized. Read only the relevant reference:

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
