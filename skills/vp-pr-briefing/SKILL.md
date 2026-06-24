---
name: vp-pr-briefing
description: >-
  Use when the user asks to "take over a PR", "brief me on this PR", "what is
  this PR about", "help me understand PR #X", "summarize this PR", provides a
  GitHub PR URL and wants context, checks out someone else's branch, or needs
  to onboard onto a PR they have no prior context for.
  Not for: review comment processing (vp-pr-comment-resolver), writing code
  reviews (code-review), PR description rewrites (cl-rewrite-pr-description).
---

# PR Briefing

Research a pull request and present a structured, progressive-disclosure
briefing. The goal is to bring the reader from zero context to full
understanding in one pass — shallow enough to skim, deep enough to act on.

## Prerequisites

Before starting, verify:

- **`gh` CLI** is installed and authenticated (`gh auth status`)
- **`git`** is available and the working directory is inside a repository

If any tool is missing or not authenticated, guide the user through setup
before proceeding.

## Identify the PR

Accept any of these inputs:

| Input | Detection |
|-------|-----------|
| GitHub URL | Parse the host, owner, repo, and PR number from the URL. If the URL repo differs from the local remote, pass the full repo identifier (including host when targeting GitHub Enterprise) to `gh` so commands reach the correct instance. |
| `#123` or bare number | Use the current repo context |
| No number given | Run `gh pr view --json number --jq .number` to find the PR for the current branch |

If the branch has no associated PR, or the PR belongs to a different repo
(e.g., upstream fork), say so and ask the user for a PR URL or `-R` target.

## Gather Data

Fetch everything before writing anything. Use the `gh` CLI (and `gh api graphql`
when needed) for all queries. When the PR URL points to a GitHub Enterprise host
that differs from the current `gh` default, include that host in every `gh`
invocation so commands reach the correct instance.

Do not memorize specific CLI flags or `--json` field names from this document —
they can change across `gh` versions. Instead, use the intent list below to
decide **what data you need**, then construct the appropriate commands at
runtime. Check `gh pr view --help` or `gh api --help` if unsure about available
fields.

| Data needed | Used by | Notes |
|---|---|---|
| Core metadata: title, author, state, labels, milestone, dates, base/head branch, draft status, mergeability, review decision, URL, body | TL;DR, Context, Current Status | Single `gh pr view --json` call with the relevant fields |
| Commit list: short hash + headline per commit | Implementation Summary | |
| Per-file diff stats: path, additions, deletions | Implementation Summary | |
| Full diff / patch content | Design Decisions, Implementation Summary, Risk Assessment | Needed to understand *what actually changed* — file stats alone are not enough. Use `gh pr diff` or equivalent |
| Per-reviewer review state: each reviewer's latest submitted review (approved, changes requested, commented, dismissed) | Review Status | The aggregate `reviewDecision` only tells the overall outcome. Fetch individual reviews or latest reviews to support per-reviewer summaries |
| Review threads: thread resolution state, path, line, author, comment bodies | Review Status | Use GraphQL when `gh pr view --json` does not expose thread-level detail |
| CI / status check results | Current Status | |
| Linked issues (`closes #X`, `fixes #X`, `refs #X`, autolink URLs) | Context, Dependencies | Fetch each issue's title, state, labels, and body summary |
| Referenced PRs ("depends on #Y", "follow-up to #Z", stacked PRs) | Dependencies | Fetch title, state, and URL |

Read review threads to extract reviewer opinions, unresolved discussions, and
requested changes. Capture enough to summarize — do not reproduce full
conversations.

## Present the Briefing

Use the following order as the default structure. Each section adds one layer of
depth so the reader can stop at any point and still have a coherent
understanding. Merge or skip sections when the PR is small enough that they
would be empty or redundant.

### 1. TL;DR

One sentence. What this PR does and why, in plain language. If the PR type is
obvious, prefix with a conventional tag: `[feat]`, `[fix]`, `[refactor]`,
`[chore]`, `[docs]`.

Example:
> **TL;DR:** `[feat]` Add OAuth2 login flow so users can sign in with their
> GitHub account instead of managing a separate password.

### 2. Context & Requirements

Why this PR exists. Connect it to the problem being solved.

- Originating issue(s) with title, state, and link
- Who requested or motivated the change
- Acceptance criteria or definition of done, if stated
- Constraints or requirements mentioned in the issue or PR body

Keep this section focused on the **problem space**, not the solution.

### 3. Design Decisions

What approach was chosen and why. This section bridges the gap between "what
problem" and "what code changed."

- Architecture or approach chosen
- Alternatives considered or discussed (from PR body, issue, or review threads)
- Key tradeoffs acknowledged
- Any open design questions still under discussion

If the PR body or review threads contain no design discussion, infer the
approach from the diff and state it as observed rather than documented.

### 4. Implementation Summary

What actually changed in the code. Present this at the right altitude — not a
line-by-line diff walk, but enough to understand the shape of the change.

- Group changed files by concern (e.g., "API layer", "UI components", "tests",
  "config")
- For each group: what changed and why, in 1–3 sentences
- Call out new files, deleted files, or renamed files explicitly
- Highlight any non-obvious changes (e.g., a migration, a schema change, a
  new dependency added)

Use a table for the file grouping when there are many files:

```markdown
| Area | Files | What changed |
|------|-------|-------------|
| API  | `src/api/auth.ts`, `src/api/routes.ts` | New OAuth2 endpoint, route registration |
| UI   | `src/components/Login.tsx` | GitHub login button, OAuth callback handler |
| Tests | `tests/auth.test.ts` | Integration tests for OAuth flow |
```

### 5. Review Status

Where the PR stands in the review process.

- Review decision: approved / changes requested / pending
- Reviewer-by-reviewer summary: who said what, one line each
- Unresolved discussion threads: summarize the core disagreement or question
- Resolved threads worth noting: significant decisions made during review

If there are no reviews yet, say so.

### 6. Dependencies & References

Everything connected to this PR.

- **Linked issues:** issue number, title, state, relationship (closes/refs)
- **Related PRs:** number, title, state, relationship (depends on / blocks /
  follow-up to / stacked on)
- **External references:** docs, RFCs, Slack threads, design docs mentioned in
  the PR body or comments
- **New dependencies:** any packages added or upgraded in the diff

Use a compact table:

```markdown
| Type | Ref | Title | State | Relation |
|------|-----|-------|-------|----------|
| Issue | #45 | Users can't log in with SSO | open | closes |
| PR | #120 | Add OAuth2 provider config | merged | depends on |
```

### 7. Risk Assessment

What could go wrong or needs attention.

- Breaking changes: API, schema, config, or behavior changes that affect
  consumers
- Affected systems or features beyond the immediate scope
- Migration or deployment considerations
- Test coverage gaps visible in the diff
- Security considerations if the change touches auth, data handling, or
  external APIs

Rate the overall risk if helpful: **low** (isolated change, good test
coverage), **medium** (touches shared code, some gaps), **high** (breaking
change, migration required, or security-sensitive).

### 8. Current Status & Next Steps

Where things stand right now.

- PR state: draft / open / approved / changes requested / merged
- CI status: passing / failing (which checks)
- Merge readiness: what's blocking merge, if anything
- Remaining work: items the author mentioned as TODO or in-progress
- Suggested next action: what the reader should do next (e.g., "address the
  unresolved thread about error handling in auth.ts", "rebase onto main after
  #120 merges", "ready to merge after CI passes")

## Presentation Guidelines

The briefing is designed for a human reader who needs to build a mental model
quickly. Follow these principles:

- **Progressive disclosure:** each section adds depth. A reader who stops after
  section 3 should still understand the PR at a strategic level.
- **Concrete over abstract:** use file names, function names, and specific
  reviewer names. "Alice requested a retry mechanism for the OAuth callback"
  beats "a reviewer suggested error handling improvements."
- **Proportional depth:** a 5-file bugfix gets a shorter briefing than a
  50-file feature. Scale each section to the PR's complexity. Skip sections
  that would be empty or trivial (e.g., "Risk Assessment" for a typo fix).
- **Link everything:** every issue, PR, and check reference should be a
  clickable link.
- **Separate fact from inference:** when design decisions are inferred from the
  diff rather than documented, say "Based on the diff, the approach appears
  to be..." rather than stating it as documented intent.

## After the Briefing

Once the briefing is delivered, ask the reader what they want to do next.
Common follow-ups:

- **Deep dive:** read specific files or review threads in detail
- **Take over:** start working on the PR (check out the branch, understand
  remaining TODOs)
- **Review:** begin a code review with the context now established
- **Resolve comments:** hand off to `vp-pr-comment-resolver` for review thread
  processing

Do not assume the next step. The briefing's job is to inform, not to act.

## Error Handling

If data is unavailable (PR not found, private repo without access, empty
description, API rate limit), degrade gracefully: note what could not be
fetched and continue with the data you have. Do not hallucinate missing
information.
