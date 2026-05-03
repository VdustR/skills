---
name: pr-comment-resolver
description: >-
  Automate PR comment review, fix, and resolution workflow with atomic commits.
  Use when the user asks to "handle PR comments", "resolve PR review comments",
  "fix PR feedback", "process review comments", "address PR suggestions",
  "deal with review comments", or provides a GitHub PR URL with review comments.
  Also trigger when the user mentions unresolved PR threads or wants to
  batch-process reviewer feedback.
  Boundary: not for writing PR reviews (use code-review) or PR checklists
  (use checklist-runner).
---

# PR Comment Resolver

Automate the process of handling GitHub PR review comments: evaluate each comment, fix issues with atomic commits, and reply with detailed resolution information.

## Core Principles

0. **Critical Thinking Before Action** - Never blindly execute:
   - Comments may contain incorrect technical claims
   - Suggestions may violate repo guidelines (agent instructions, contributing docs)
   - Always verify facts (read the code, check docs, run tests) before deciding
   - When signals conflict, trade-offs exist, or interpretation is ambiguous: surface the conflict with options and a recommendation, then wait for user input
   - "Reviewer said so" is not sufficient justification — evidence is
1. **Verify Before Acting** - Check the technical validity of each suggestion against the codebase before implementing; reviewers can be wrong
2. **Commit by Topic, Not by Comment** - Group commits by logical change, not by comment count; one commit can address multiple related comments
3. **Atomic Commits** - Each commit should be a single logical fix; different concerns require separate commits
4. **Human Collaboration** - Ask the user when uncertain about a fix, interpretation, or when you disagree with a comment
5. **Detailed Replies** - Include fix explanation, commit hash, and link in every resolution
6. **Reply to Thread** - Always reply directly to each review thread, NOT as a general PR comment at the bottom

## Quick Start

### Interactive Mode (Default)

```
User: Handle the comments on this PR: https://github.com/owner/repo/pull/123
```

Workflow:
1. Fetch all unresolved review comments
2. Present each comment for review
3. For each comment, determine whether to fix or explain why no fix is needed
4. Execute fixes with atomic commits
5. Reply and resolve each comment

### Auto Mode

```
User: Auto-resolve all comments on https://github.com/owner/repo/pull/123
```

Process all comments automatically, only pausing for truly ambiguous cases.

## Workflow Overview

### Phase 1: Fetch Comments

Use `gh api graphql` to retrieve unresolved review comments, including `isOutdated` so stale diff anchors are visible:

```bash
gh api graphql -f query='
{
  repository(owner: "<OWNER>", name: "<REPO>") {
    pullRequest(number: <PR_NUMBER>) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 10) {
            nodes {
              body
              author {
                __typename
                login
              }
            }
          }
        }
      }
    }
  }
}' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)'
```

Extract key information:
- Comment ID and thread ID
- Resolution and outdated state
- File path and line number
- Comment body (the feedback)
- Author information (`login`, `__typename`)

Do not skip outdated threads. An outdated unresolved thread still needs a decision; `isOutdated` only means the line anchor may no longer match the current diff. Re-read the current file, verify whether a newer commit already addressed the feedback, then reply and apply the normal bot/human resolution policy.

### Phase 1.5: Classify Author (Bot vs Human)

Determine if each comment author is a bot. **Bot threads are always auto-resolved after handling; human threads are never auto-resolved.**

Use a tiered approach — stop at the first definitive answer. Once an author has been classified in this session, reuse that conclusion for later comments from the same author (conversation context serves as the cache; no separate lookup structure needed).

#### Tier 1 — GraphQL `__typename`

The `author.__typename` field (fetched in Phase 1) is the primary signal:

| `__typename` | Classification |
|--------------|----------------|
| `Bot` | **Bot** — GitHub App; reliable, no further check |
| `User` | Ambiguous — proceed to Tier 2 (could be human OR a user-token-driven service account) |
| `Organization` | Rare; skip to Tier 3 |

#### Tier 2 — Profile-based judgment (when `__typename == "User"`)

Fetch the user profile:

```bash
gh api users/<login> --jq '{bio, name, blog, company, public_repos, followers}'
```

Evaluate the returned fields and decide:

| Signal | Strong bot indicator |
|--------|---------------------|
| `bio` | Self-identifies as bot/service/automation/CI (e.g., "Bot managed by...", "I run your tests", "Automated checks for...") |
| `name`, `blog`, `company` | Points to a tool/service (e.g., blog links to bot documentation) |
| `public_repos` + `followers` | Both very low (typical service account profile) |

Examples of user-token-driven bots that pass Tier 2 clearly: `rustbot` (bio self-declares), `k8s-ci-robot` (bio describes automation role).

Reach one of three outcomes:
- **Clearly a bot** → classify as Bot
- **Clearly a human** → classify as Human
- **Ambiguous** (e.g., empty bio, few signals) → proceed to Tier 2b

#### Tier 2b — Activity fallback (optional, when Tier 2 inconclusive)

When profile signals are thin, fetch recent public events:

```bash
gh api users/<login>/events/public
```

A monolithic distribution (e.g., almost entirely `IssueCommentEvent` or `PullRequestReviewCommentEvent`) strongly suggests a bot. A diverse distribution (pushes, PRs, reviews, stars, forks) suggests a human.

This tier is triggered by the agent's judgment, not a mechanical rule — only fetch when it would meaningfully change the conclusion.

#### Tier 3 — Ask user

When all prior tiers leave doubt, or when `__typename == "Organization"`:

> "Should I treat @{author} as a bot? Profile: bio=<...>, repos=<n>, followers=<n>. If yes, the thread will be auto-resolved after handling."

#### Conflict handling

If any tiers disagree (e.g., `__typename == "User"` but profile looks strongly bot-like, or vice versa), do **not** silently pick one — surface the conflict to the user per Core Principle #0.

### Phase 2: Evaluate Each Comment

For each unresolved comment, **critically assess whether the suggestion is correct** before determining action:

| Decision | Criteria |
|----------|----------|
| **Needs Fix** | Valid point: actual bug, code issue, style violation, missing feature |
| **No Fix Needed** | Already addressed, misunderstanding, design choice, out of scope |
| **Disagree** | Reviewer's suggestion is incorrect, would introduce bugs, violates architecture, or is technically flawed |
| **Uncertain** | Ambiguous request, multiple interpretations, needs clarification |

> **⚠️ Important:** Do not blindly accept all comments. Reviewers can make mistakes. Always verify the technical validity of each suggestion before implementing.

#### Comment Validity Checklist

Before choosing an action, run each suggestion through these checks:

- **Technical claim holds** — Read the referenced code (and related files); don't rely on memory. Does the claim match current behavior?
- **Aligns with repo conventions** — Check agent instructions, contributing docs, and nearby code. A reviewer may not know local guidelines.
- **Compatible with existing architecture** — Does applying the fix fit current patterns, or would it introduce an inconsistency?
- **No simpler alternative the reviewer missed** — Could there be a cleaner solution that still satisfies the concern?

If any check fails or is uncertain, surface the gap to the user with:
- The specific conflict or uncertainty
- 2+ options with trade-offs
- A recommendation with rationale

This applies regardless of whether the author is a bot or a human — bots can also produce incorrect or repo-inappropriate suggestions.

### Phase 3: Execute Action

#### If Fix Needed

1. Read the relevant file(s)
2. Implement the fix
3. Create an atomic commit with descriptive message
4. Push to the PR branch
5. Reply with fix details
6. **If author is a bot**: Resolve the thread | **If human**: Leave unresolved

#### If No Fix Needed

1. Compose explanation of why no change is required
2. Reply with the explanation
3. **If author is a bot**: Resolve the thread | **If human**: Leave unresolved

#### If Disagree

1. **Verify your assessment** - Double-check your reasoning against the codebase
2. **Present to user first** - Always discuss with the user before responding to the reviewer; the user may still want to act on the suggestion
3. Explain why the suggestion may be problematic:
   - Would it introduce a bug?
   - Does it violate existing architecture patterns?
   - Is it based on incorrect assumptions about the code?
4. Compose a polite, technical response with evidence
5. **Resolution behavior**:
   - **If author is a bot** → resolve the thread after posting the reply (bot won't follow up; leaving it open is noise)
   - **If author is a human** → leave the thread unresolved so the reviewer can respond

#### If Uncertain

1. Present the comment to the user
2. Explain the ambiguity
3. Ask for guidance
4. Proceed based on user input

### Phase 4: Reply (and Conditionally Resolve)

After each action, reply to the comment thread. **Bot threads are always resolved; human threads are never auto-resolved.**

| Comment Source | Fix | No-Fix | Disagree |
|----------------|-----|--------|----------|
| **Bot** | Resolve | Resolve | Resolve |
| **Human** | Leave unresolved | Leave unresolved | Leave unresolved |

**Rationale:** Bots don't follow up, so any decided outcome (fix / no-fix / disagree) is terminal. Humans may dispute any decision, so threads are always left for the reviewer to close.

> **⚠️ CRITICAL:** You MUST use the GraphQL `addPullRequestReviewThreadReply` mutation to reply directly to each review thread. Do NOT use `gh pr comment` as it posts to the PR bottom instead of the specific thread.

**Reply format for fixes:**

```markdown
- [<short-hash> <commit-message>](<commit-url>)

**Files modified:**
- `<file-path>`

Generated with [pr-comment-resolver](https://github.com/VdustR/skills).
```

Example:

```markdown
- [a1b2c3f fix(auth): add null check for user session](https://github.com/owner/repo/commit/a1b2c3f)

**Files modified:**
- `src/auth/session.ts`

Generated with [pr-comment-resolver](https://github.com/VdustR/skills).
```

**Reply format for no-fix:**

```markdown
No changes needed.

**Reason:** <explanation of why no fix is required>

Generated with [pr-comment-resolver](https://github.com/VdustR/skills).
```

### Phase 5: Summary Report

After processing all comments, output a summary report:

```markdown
## PR Comment Resolution Summary

**PR:** #<number> - <title>
**Processed:** <total> comments

### Commits
- [<hash> <message>](<url>)
- [<hash> <message>](<url>)

### Statistics
| Action | Bot (auto-resolved) | Human (reply only) | Total |
|--------|---------------------|---------------------|-------|
| Fixed | <n> | <n> | <n> |
| No fix | <n> | <n> | <n> |
| Disagreed | <n> | <n> | <n> |
| Skipped | <n> | <n> | <n> |

> Bot threads are always resolved after handling; human threads are never auto-resolved.

### Details
| Comment | Author | Type | File | Action | Resolved |
|---------|--------|------|------|--------|----------|
| <summary> | @bot | 🤖 Bot | `<path>` | Fixed [<hash>](<url>) | ✅ |
| <summary> | @human | 👤 Human | `<path>` | Fixed [<hash>](<url>) | ⏳ Pending |
| <summary> | @bot | 🤖 Bot | `<path>` | Disagreed | ✅ |
| <summary> | @human | 👤 Human | `<path>` | Disagreed | ⏳ Pending |
```

## GitHub CLI Commands

### Fetch PR Comments

```bash
# Get all review threads (requires GraphQL - gh pr view does not support reviewThreads)
gh api graphql -f query='
{
  repository(owner: "<OWNER>", name: "<REPO>") {
    pullRequest(number: <NUMBER>) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 10) {
            nodes { body author { __typename login } }
          }
        }
      }
    }
  }
}'

# Get unresolved threads only (add jq filter)
# ... --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)'
```

### Reply to Comment

```bash
gh api graphql -f query='
  mutation($body: String!, $threadId: ID!) {
    addPullRequestReviewThreadReply(input: {
      pullRequestReviewThreadId: $threadId,
      body: $body
    }) {
      comment { id }
    }
  }
' -f threadId="<THREAD_ID>" -f body="<REPLY_BODY>"
```

### Resolve Thread

```bash
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: {
      threadId: "<THREAD_ID>"
    }) {
      thread { isResolved }
    }
  }
'
```

## Commit Message Format

Follow conventional commit style. **Describe the change, not the comment:**

```
<type>(<scope>): <what was changed>

<why this change was needed - optional>
```

> **Important:** Commit messages should describe the modification topic, NOT "address comment" or "per reviewer request". The commit should make sense even without PR context.

Example - Good:

```
fix(auth): add null check for user session

The session object may be undefined when the user
is not logged in. Added defensive check to prevent
TypeError.
```

Example - Bad:

```
fix: address PR review comments

Addresses PR review comment by @reviewer
```

## Commit Grouping Strategy

> **Key principle:** Group by **modification topic**, not by comment count.

### When to use ONE commit for multiple comments

Use one commit when comments point to the **same logical change**:

```
Comment A: "Add null check for session"
Comment B: "Handle undefined session gracefully"
Comment C: "Session might be null here"

All three → same topic (session null safety) → ONE commit
→ Reply to all three comments with the same commit link
```

### When to use SEPARATE commits

Use separate commits when comments are **different concerns**:

```
Comment A: "Add error handling"
Comment B: "Improve performance here"
Comment C: "Add input validation"

Three different topics → THREE separate commits
→ Each comment gets its own commit link
```

### Decision guide

| Scenario | Commits | Why |
|----------|---------|-----|
| Same topic, different locations | 1 | Same logical change |
| Same function, different concerns | N | Different modifications |
| Same line, same fix | 1 | Literally one change |
| Related but independent | N | Can be reverted separately |

## Decision Tree

```
Comment Received
      │
      ▼
┌──────────────────────────┐
│ Classify author          │  (Phase 1.5 tiered detection)
│  Tier 1: __typename      │
│  Tier 2: profile         │
│  Tier 2b: activity       │
│  Tier 3: ask user        │
└────────┬─────────────────┘
         │
         ▼
   is_bot = true | false
         │
         ▼
┌─────────────────┐
│ Comment clear?  │──No──▶ Ask user for clarification ──┐
└────────┬────────┘                                     │
         │Yes                                           │
         ▼                                              │
┌─────────────────┐                                     │
│ Comment passes  │──No──▶ Discuss with user first ─────┤
│ Validity        │        └──▶ Politely disagree       │
│ Checklist?      │                                     │
└────────┬────────┘                                     │
         │Yes                                           │
         ▼                                              │
┌─────────────────┐                                     │
│ Code change     │──No──▶ Reply with explanation ──────┤
│ needed?         │                                     │
└────────┬────────┘                                     │
         │Yes                                           │
         ▼                                              │
   Fix → Commit → Push → Reply ─────────────────────────┤
                                                        │
         ┌──────────────────────────────────────────────┘
         ▼
  (After ANY action: fix, no-fix, disagree, or clarification)
         │
         ▼
┌─────────────────┐
│ is_bot == true? │──Yes──▶ Resolve thread
└────────┬────────┘
         │No
         ▼
   Leave unresolved (human reviewer will close)
```

## Important Guidelines

### DO

- **Critically evaluate comments:** Verify the technical validity of each suggestion against the codebase before acting. Reviewers can be wrong.
- **Classify the author:** Use the Phase 1.5 tiered detection (`__typename` → profile → activity → ask user) before deciding whether to resolve.
- **Always resolve bot threads:** For any outcome (fix, no-fix, disagree), resolve the thread after replying. Bots won't follow up; leaving threads open adds noise.
- **Never auto-resolve human threads:** Reply only; let humans close their own threads, regardless of outcome.
- **Commit by topic:** Create atomic commits for each logical change. Group related fixes into one commit, never bundle unrelated changes. Reply to all related comments with the same commit link.
- **Write descriptive commit messages:** Describe the *what* and *why* of the change using conventional commit format. Avoid messages like "address PR comments".
- **Collaborate with the user:** Ask for clarification on ambiguous comments. Always discuss with the user before pushing back on a reviewer.
- **Provide detailed replies:** Include commit links for fixes. When disagreeing, use polite, technical reasoning with evidence.
- **Maintain code quality:** Verify fixes compile and pass linting before committing.

### DON'T

- **Blindly accept all comments** - always verify correctness first (applies to bot and human comments alike)
- **Auto-resolve human reviewer comments** - let humans close their own threads regardless of the outcome
- **Leave bot threads open** - after handling, resolve; unresolved bot threads are noise
- **Maintain a hardcoded list of bot service names** - rely on `__typename` and profile inspection instead
- **Bundle different concerns** into one commit - separate topics need separate commits
- Write commit messages like "address PR comments" or "per reviewer request"
- Implement changes that would introduce bugs or violate architecture
- Disagree with a reviewer (bot or human) without first discussing with the user
- Resolve without replying
- Make assumptions about ambiguous requests
- Force push or rewrite history
- Skip verification steps
- **Use `gh pr comment` for replies** - This posts to PR bottom, not to the review thread. Always use GraphQL `addPullRequestReviewThreadReply` for direct replies; use `gh pr comment` only as a fallback.

## Error Handling

| Error | Action |
|-------|--------|
| Comment already resolved | Skip and continue |
| File not found | Ask user for correct path |
| Commit fails | Report error, do not resolve |
| Push fails | Report error, suggest manual intervention |
| GraphQL API error | See the "Fallback Behavior" section |

## Additional Resources

### Reference Files

For detailed workflows and templates:

- **`references/workflow.md`** - Step-by-step workflow with examples
- **`references/reply-templates.md`** - Copy-paste reply templates for common scenarios

## Fallback Behavior

If the GraphQL API fails to reply to a thread (e.g., network error, permission issue, thread already resolved):

1. **Retry once** after a brief delay
2. **If retry fails**, fall back to `gh pr comment` with clear context:

```bash
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
**Re: Review comment on `<FILE_PATH>:<LINE>`**

> <ORIGINAL_COMMENT_EXCERPT>

<YOUR_REPLY_CONTENT>

---
*Note: Unable to reply directly to the review thread. This is a fallback comment.*
EOF
)"
```

3. **Report to user** that the reply was posted as a general comment instead of a thread reply
4. **Continue processing** remaining comments

> **Important:** The fallback should only be used when GraphQL truly fails. Always attempt GraphQL first.

## Notes

- Requires `gh` CLI authenticated with appropriate permissions
- Works with GitHub PRs (GitLab/Bitbucket not supported)
- Branch must be checked out locally
- Respect repository's commit message conventions if defined
