---
name: vp-pr-comment-resolver
description: >-
  Automate PR comment review, fix, and resolution workflow with atomic commits.
  Use when the user asks to "handle PR comments", "resolve PR review comments",
  "fix PR feedback", "process review comments", "address PR suggestions",
  "deal with review comments", or provides a GitHub PR URL with review comments.
  Also trigger when the user mentions unresolved PR threads, PR discussion
  comments at the bottom of the conversation, or wants to batch-process
  reviewer feedback.
  Boundary: not for writing PR reviews (use code-review) or PR checklists
  (use vp-checklist-runner).
---

# PR Comment Resolver

Handle GitHub PR feedback by fetching review-thread comments and general PR
discussion comments, verifying each request, applying focused fixes, committing
by topic, replying with evidence, and resolving only the right review threads.

## Core Principles

1. **Critical thinking before action** - Reviewer comments may be wrong,
   outdated, ambiguous, or incompatible with repo rules. Verify against code,
   docs, and tests before acting.
2. **Commit by topic** - Group comments by logical change, not by comment count.
   Different concerns require separate commits.
3. **Preserve collaboration** - Ask the user before disagreeing with a reviewer,
   force pushing, changing scope, or resolving ambiguity.
4. **Reply to the correct target** - Review threads use GraphQL
   `addPullRequestReviewThreadReply`; PR discussion comments get a new PR
   comment that mentions the author and quotes the original excerpt.
5. **Resolve selectively** - Bot review threads are resolved after a decided
   outcome. Human review threads are left unresolved. PR discussion comments
   cannot be resolved.

## Quick Start

Interactive mode (default) — walk through Phases 1-6 below, pausing for user
judgment as each phase requires:

```text
User: Handle the comments on this PR: https://github.com/owner/repo/pull/123
```

Auto mode:

```text
User: Auto-process all comments on https://github.com/owner/repo/pull/123
```

Process clear comments automatically, but pause for ambiguity, disagreement,
scope changes, or anything that needs user judgment.

## Phase 1: Fetch Feedback

Use `gh api graphql` to retrieve:

- PR node ID
- unresolved review threads
- `isOutdated`, `path`, and `line` for review threads
- PR discussion comments from the bottom conversation
- author `login` and `__typename`
- comment `body`, `createdAt`, and `url`

Read `references/workflow.md` for the full fetch query and queue structure. Use
`references/github-cli.md` for standalone GraphQL mutations and fallback command
patterns.

Do not skip outdated unresolved threads. Re-read the current file and decide
whether the feedback still applies, was already handled, or deserves a no-fix
reply.

For PR discussion comments:

- Treat them as actionable PR feedback when relevant.
- They are `IssueComment` items, not review threads.
- They have no resolution state.
- Inspect later discussion comments before replying to avoid duplicate answers.

## Phase 2: Classify Author

Classify each comment author before deciding resolution behavior.

Author classification order:

| Tier | Signal | Action |
|------|--------|--------|
| 1 | GraphQL `author.__typename == "Bot"` | classify as Bot |
| 2 | GraphQL `author.__typename == "User"` | inspect profile if bot/human matters |
| 2b | thin profile signals | optionally inspect recent public activity |
| 3 | ambiguous or `Organization` | ask the user |

Profile check:

```bash
gh api users/<login> --jq '{bio, name, blog, company, public_repos, followers}'
```

Activity fallback:

```bash
gh api users/<login>/events/public
```

Do not maintain a hardcoded service-name list. If signals conflict, surface the
conflict to the user instead of silently choosing.

Read `references/author-classification.md` for the detailed bot/human decision
rules, profile signals, activity fallback, and user prompt.

## Phase 3: Evaluate Each Comment

For every queued comment, verify the claim before choosing an action.

| Decision | Criteria |
|----------|----------|
| Needs fix | Valid bug, style issue, missing behavior, or repo-rule violation |
| No fix needed | Already addressed, intentional behavior, out of scope, or misunderstanding |
| Disagree | Suggestion is incorrect, unsafe, or conflicts with architecture |
| Uncertain | Multiple valid interpretations or missing context |

Validity checklist:

- Read the referenced file and nearby code.
- Check repo instructions, contribution docs, and local patterns.
- Confirm the suggestion does not introduce a bug or broader inconsistency.
- Look for a simpler fix that satisfies the same concern.
- Run focused verification for code changes when feasible.

If any check fails or remains uncertain, present the conflict with options and a
recommendation before replying to the reviewer.

## Phase 4: Execute Fixes

For comments that need a change:

1. Read the relevant file and surrounding context.
2. Implement only the scoped fix.
3. Verify with the narrowest relevant command.
4. Commit by modification topic, not by reviewer comment.
5. Push only after the user has authorized that workflow.
6. Reply with commit links, changed files, and a short explanation.

Read `references/commit-strategy.md` for commit grouping rules and message
examples.

## Phase 5: Reply And Resolve

Resolution matrix:

| Comment kind | Author | Reply target | Resolution |
|--------------|--------|--------------|------------|
| Review thread | Bot | `addPullRequestReviewThreadReply` | resolve after reply |
| Review thread | Human | `addPullRequestReviewThreadReply` | leave unresolved |
| PR discussion comment | Bot or human | PR `addComment` with mention + quote | reply only |

Use `references/reply-templates.md` for standard fix, no-fix, disagreement, and
PR discussion wrappers. Use `references/github-cli.md` for the GraphQL commands.

Never use `gh pr comment` as the normal path for a review-thread reply. It posts
to the PR bottom, not the review thread. Use it only as the documented fallback
when GraphQL truly fails.

## Phase 6: Summary Report

After processing, report:

- PR number, title, and URL
- number of comments processed by kind and author class
- commits created and pushed
- comments fixed, no-fixed, disagreed, skipped, or left uncertain
- bot review threads resolved
- human review threads left pending
- PR discussion comments replied to
- verification commands and results
- any errors or comments still needing user input

Read `references/workflow.md` for the complete queue and processing details, and
`references/decision-tree.md` for the end-to-end action flow.

## Important Guidelines

- Do not blindly accept every comment.
- Do not auto-resolve human review threads.
- Do not leave handled bot review threads open.
- Do not use hardcoded bot service-name lists.
- Do not bundle unrelated changes into one commit.
- Do not write commit messages like "address PR comments".
- Do not implement suggestions that introduce bugs or violate architecture.
- Do not resolve without replying.
- Do not assume ambiguous requests.
- Do not force push or rewrite history unless the user explicitly requested it.
- Do not use `gh pr comment` for review-thread replies unless GraphQL fallback is required.

## Error Handling

| Error | Action |
|-------|--------|
| Comment already resolved | Skip and continue |
| PR discussion comment already answered later | Skip and include in summary |
| File not found | Ask user for correct path |
| Commit fails | Report error, do not resolve |
| Push fails | Report error, suggest manual intervention |
| GraphQL API error | Retry once, then use the fallback in `references/github-cli.md` |

## Reference Files

- `references/workflow.md` - detailed fetch, queue, and processing workflow
- `references/author-classification.md` - bot/human author classification rules
- `references/reply-templates.md` - copy-paste reply templates
- `references/github-cli.md` - GraphQL commands and fallback behavior
- `references/commit-strategy.md` - commit grouping and message guidance
- `references/decision-tree.md` - condensed action flow

## Notes

- Requires `gh` CLI authenticated with appropriate permissions.
- Works with GitHub PRs. GitLab and Bitbucket are not supported.
- Branch must be checked out locally before making fixes.
- Respect repository commit message conventions when they exist.
