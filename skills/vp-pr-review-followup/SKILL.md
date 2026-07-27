---
name: vp-pr-review-followup
description: >-
  Follow up on GitHub PR conversations from the reviewer side. Use to verify
  author replies or fixes, challenge unsupported responses, remind authors, or
  resolve threads opened by the reviewer. Boundary: authors addressing feedback
  should use vp-pr-comment-resolver.
---

# Pull Request Review Follow-Up

Re-evaluate the original concern against the current head and full conversation.
An author reply, emoji, or changed line is not proof that the concern is fixed.

## Decisions

- **Resolved:** the current implementation and verification address the concern.
- **Needs follow-up:** evidence is incomplete, the fix is partial, or a new risk
  was introduced.
- **No longer applicable:** the code or scope changed and the original concern
  is obsolete.
- **Needs user judgment:** product or architectural intent remains ambiguous.

Reply on the original surface with concrete evidence and a clear next action.
Resolve only threads the acting reviewer owns and only after the concern is
actually closed. Inspect later discussion to avoid duplicate or contradictory
replies.

Read `references/workflow.md` for state transitions and
`references/reply-templates.md` for concise response shapes.
