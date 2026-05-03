---
name: vp-pr-review-followup
description: >-
  Follow up on GitHub PR review conversations from the reviewer side. Use when
  the user asks to verify author replies to review comments, challenge PR
  comment replies, resolve review threads they opened, remind authors about
  ignored review comments, review other reviewers' PR threads, or process PR
  discussion comments after review. Boundary: not for PR authors addressing
  feedback (use vp-pr-comment-resolver) or PR checklists (use
  vp-checklist-runner).
---

# PR Review Follow-up

Review PR comment replies from the reviewer side: verify what the PR author did,
resolve your own satisfied review threads, challenge unresolved issues, and add
useful signal to other reviewers' conversations without taking over their
threads.

## Core Principles

1. **Reviewer-Side Posture** - Do not edit, commit, push, or rewrite the PR
   branch unless the user explicitly asks. Your default job is verification,
   review, reply, and resolution of the user's own review threads.
2. **Evidence Before Replying** - Verify replies and code changes against the
   current diff, current files, relevant tests, CI, docs, or runtime behavior.
   Do not resolve or challenge based only on the author's claim.
3. **Own Threads Are Actionable** - If the user opened the review thread and the
   author replied or changed code, decide whether the concern is resolved. Resolve
   only after verification confirms it; otherwise continue the challenge in the
   thread.
4. **Ignored Own Threads Get Reminders** - If the author has continued work after
   the user's comment but did not reply to or address the thread, post a concise
   follow-up reminder in that thread.
5. **Other People's Threads Are Advisory** - Inspect other reviewers' comments.
   Add a reply only when you can contribute verified agreement, extra evidence,
   or a materially different concern. Never resolve threads opened by others.
6. **PR Discussion Comments Follow the Same Logic** - Bottom-of-PR comments are
   evaluated the same way, but they are not resolvable review threads. Reply with
   a mention and a quoted excerpt when follow-up is useful.

## Quick Start

```
User: Follow up on my review comments on https://github.com/owner/repo/pull/123
```

Workflow:

1. Fetch the PR, viewer login, author login, review threads, PR discussion
   comments, commits, and latest review activity.
2. Classify conversations as:
   - `own-thread`: opened by the viewer
   - `other-thread`: opened by another reviewer
   - `own-pr-comment`: bottom PR comment authored by the viewer
   - `other-pr-comment`: bottom PR comment authored by someone else
3. Verify the author's replies and changes with file reads, diff review, tests,
   CI, or docs as appropriate.
4. Act according to ownership and evidence:
   - Own review thread resolved by evidence: reply if useful, then resolve.
   - Own review thread not resolved: reply with a challenge or reminder.
   - Other review thread: reply only if adding useful verified signal; never
     resolve.
   - PR discussion comment: reply only; there is no thread resolution state.
5. Report what was verified, challenged, reminded, resolved, or skipped.

## Decision Matrix

| Conversation | Evidence | Action |
|--------------|----------|--------|
| Own review thread | Author replied and concern is fixed | Reply briefly if needed, then resolve |
| Own review thread | Author replied but concern remains | Reply with evidence and keep open |
| Own review thread | Author changed related code but ignored thread | Reply with a reminder and keep open |
| Own review thread | No reply and no related author activity | Skip or report as waiting |
| Other review thread | You verified the concern and can add value | Reply with concise agreement or extra evidence |
| Other review thread | You disagree or see another risk | Reply with evidence, framed as additional review input |
| Other review thread | No meaningful extra signal | Skip |
| PR discussion comment | Follow-up is useful | Post a PR comment with `@author` and a quoted excerpt |
| PR discussion comment | No follow-up is useful | Skip |

## Required Evidence

Use the cheapest reliable verification available:

- Read the referenced code and current diff before judging code review threads.
- Check commits after the user's comment before saying the author ignored it.
- Use CI status when the concern is already covered by a relevant check.
- Run targeted tests or reproduction commands when the claim depends on behavior.
- Use official docs or local repo docs when the disagreement is about API or
  project convention.

If evidence is incomplete, say what is missing and ask before posting a strong
challenge.

## Resolve Policy

- Resolve only review threads opened by the viewer, and only after the concern is
  verified as handled.
- Do not resolve threads opened by other reviewers, even when you agree the issue
  is fixed.
- Do not resolve bottom PR discussion comments; GitHub does not provide a review
  thread resolution state for them.
- If GitHub denies resolution, report the API failure and leave the thread open.

## GitHub Operations

Detailed GraphQL queries, mutations, and classification steps live in
[workflow.md](references/workflow.md).

Reply wording examples live in [reply-templates.md](references/reply-templates.md).

## Common Mistakes

- Treating any author reply as enough to resolve without checking the code.
- Posting "+1" on another reviewer's thread without adding new verified signal.
- Resolving another reviewer's thread because the issue looks fixed.
- Using `gh pr comment` for a review-thread reply; that posts to the PR bottom,
  not the review thread.
- Forgetting that PR discussion comments need mention-and-quote context because
  they are linear conversation comments.

## Summary Report

End with a concise report:

```markdown
## PR Review Follow-up Summary

**PR:** #<number> - <title>
**Checked:** <n> conversations

| Status | Count |
|--------|-------|
| Resolved own threads | <n> |
| Challenged own threads | <n> |
| Reminded own threads | <n> |
| Replied on others' threads | <n> |
| Replied to PR comments | <n> |
| Skipped | <n> |

### Notes
- <short evidence-backed note>
```
