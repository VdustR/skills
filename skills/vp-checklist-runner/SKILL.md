---
name: vp-checklist-runner
description: >-
  Parse and verify checklists from GitHub PRs and issues, auto-checking items
  that pass verification. Use when asked to verify PR/issue checklists, check off
  items, process checklist tasks, run the checklist, or when a PR/issue contains
  unchecked checkbox items that need verification. Also trigger when the user
  mentions "checklist", "checkbox", or wants to auto-verify PR merge requirements.
  Boundary: not for creating new checklists (just write markdown) or handling
  PR review comments (use vp-pr-comment-resolver).
---

# Checklist Runner

Parse and verify GitHub PR/issue checklists, auto-checking items that pass
verification. Classifies each checklist item, runs the cheapest verification
possible, and checks off what passes — asking the user only when truly
necessary.

Accepted inputs: nothing (auto-detect the current branch's PR), a `#123`
number, or a PR/issue URL.

## Core Principles

1. **Classify Before Executing** — Categorize every item before verification to pick the cheapest strategy
2. **CI-First for Tests** — Check CI status before running locally; avoid redundant work
3. **Confidence-Based Automation** — HIGH confidence items auto-proceed; MEDIUM/LOW confidence items pause for user
4. **Ownership-Aware Updates** — Respect GitHub permissions; never silently modify someone else's content
5. **Safe Operations** — Use `updated_at` to prevent race conditions; default to comment mode for others' posts

## Workflow Overview

| Phase | Name | Purpose |
|-------|------|---------|
| 1 | Source Resolution + Permission Probe | Auto-detect PR/issue, fetch body + comments, parse checklist items, detect ownership + permissions |
| 2 | Item Classification | Classify each unchecked item into Auto / CI / Shell / Scan / Human |
| 3 | Verification Execution | Execute verifications: Auto (instant) → CI (one-time check) → Shell (grep/jq) → Scan (subagents) → Human (batched questions) |
| 4 | Checkbox Update | Apply ownership rules: own post → auto-check; other's post → suggest or comment mode |
| 5 | Summary Report | Per-item status table, statistics, failed items with evidence, next steps |

### Phase 1: Source Resolution + Permission Probe

Determine the target PR/issue, fetch all checklist sources, and probe
permissions upfront.

**Source Resolution Decision Tree:**

```text
Input received
      │
      ├── Explicit URL
      │   └── Parse owner/repo/type/number from URL
      │
      ├── #N (number)
      │   └── gh api repos/{o}/{r}/issues/{n} → detect PR vs issue
      │       (PRs are also issues in GitHub API; check for pull_request key)
      │
      └── Nothing provided
          └── gh pr view --json number,title,body,url
              ├── Success → use current branch's PR
              └── Failure → ask user to specify
```

**Fetch Checklist Sources:**

Collect all checklist items from the PR/issue body and comments. Use
`gh pr view` for the PR body and GraphQL for comments. See
[verification-recipes.md](references/verification-recipes.md) for exact API
endpoints, queries, and pagination handling (paginate when
`pageInfo.hasNextPage` is true).

> **API field naming**: `gh pr view --json` uses camelCase (`updatedAt`),
> while REST `gh api` returns snake_case (`updated_at`). Normalize to
> `updated_at` internally.

**Parse Checklist Items:**

Extract all `- [ ]` and `- [x]` items from each source.

**Important**: Before extracting, strip fenced code blocks
(`` ``` ... ``` ``) and inline code spans to avoid parsing example checklists
inside code as real items.

Track for each item:

- Item text (normalized, trimmed)
- Checked state (unchecked = needs verification)
- Source (body vs comment ID)
- Source author
- Source `updated_at` timestamp (for race condition prevention in Phase 4)
- Nesting level — flatten nested checklists with parent context preserved;
  verify each item independently but note its parent condition

**Permission Probe:**

Get current user (`gh api user`), check repo write access
(`gh api repos/{o}/{r}`), and compare with each source author. See
[checkbox-update-rules.md](references/checkbox-update-rules.md) for full
ownership detection, bot detection rules, permission commands, and the full
permission matrix.

> **Null permissions**: If `.permissions` is null or absent (e.g.,
> fine-grained PAT without `metadata:read`), treat as no write access.

**Output update mode to user:**

```text
Source Analysis:
- PR #123 body: 8 unchecked items, author: @you → auto-check mode
- Comment by @reviewer: 3 unchecked items → suggest-then-check mode
- Total: 11 unchecked items to verify
```

### Phase 2: Item Classification

Classify each unchecked item to determine verification strategy.

**5 Classification Categories:**

| Category | Description | Example Items |
|----------|-------------|---------------|
| **Auto** | Verifiable with file/field checks | "SKILL.md has valid frontmatter", "Required metadata exists" |
| **CI** | Verifiable via CI status check | "Tests pass", "Lint passes", "Build succeeds" |
| **Shell** | Verifiable with a single grep/find/jq | "No console.log left", "No TODO comments", "No `debugger` statements" |
| **Scan** | Needs semantic understanding (subagent) | "No secrets in code", "Documentation updated", "Changelog entry added" |
| **Human** | Cannot be automatically verified | "Design reviewed", "PM approved", "UX looks good" |

**Classification**: Normalize item text → match against patterns in priority
order (Auto > CI > Shell > Scan > Human) → assign confidence. See
[classification-patterns.md](references/classification-patterns.md) for the
full algorithm, regex patterns, disambiguation rules, and confidence level
definitions.

Present the classification to the user as a compact table (item, category,
confidence). Confidence describes how sure the classification is, not the
verification result. HIGH confidence auto-proceeds; for MEDIUM/LOW items, ask
the user to confirm or reclassify before verifying:

```text
⚠️ Item #6 "Code quality is good" has LOW confidence. Confirm category or reclassify? [Human/Shell/Scan]
```

### Phase 3: Verification Execution

Execute verifications in cost order: Auto (instant) → CI (one API call) →
Shell (single command) → Scan (subagents, confirm first) → Human (batched
questions). See [verification-recipes.md](references/verification-recipes.md)
for specific commands, recipe guidelines, and subagent prompt templates.

**Auto Verification:**

Run specific file/field checks. Each produces a definitive PASS/FAIL.

**CI Verification (one-time check, NO polling):**

```bash
gh pr checks <N> --json name,state,bucket
```

| CI State | Action |
|----------|--------|
| All passed | PASS |
| Any failed | FAIL (show which checks failed) |
| Pending | Offer options: (1) skip, mark PENDING (2) wait and re-run skill later (3) run locally if user requests |
| No CI configured | Offer local execution with user confirmation |

**Shell Verification:**

Run single-command checks (grep, find, jq). Expected exit code 0 = PASS.

**Scan Verification (subagents):**

For items requiring semantic understanding. **Must confirm with user before
launching**, listing the planned scans. Cap at 5 subagents per execution; each
returns PASS/FAIL with evidence.

**Scan results always have MEDIUM confidence** (never HIGH) — subagents can
hallucinate (e.g., confusing closing ``` with bare opening blocks). Always
verify scan findings with a targeted grep/command before accepting, and
require user confirmation before checking off Scan-verified items, even on
own posts.

**Human Verification:**

Batch all Human items into a single prompt:

```text
The following items need manual verification:
1. "Design reviewed by team" — Has this been reviewed?
2. "PM approved" — Has PM given approval?

For each, reply: pass / fail / skip
```

### Phase 4: Checkbox Update

Apply the ownership rules determined in Phase 1. See
[checkbox-update-rules.md](references/checkbox-update-rules.md) for the full
decision matrix, update mechanics, anti-patterns, interaction examples, and
the comment report template. Exception to "own post → auto-check":
Scan-verified items still need user confirmation first (Phase 3).

**Update Flow (6 steps):**

1. `gh api` GET current body/comment — fetch both `body` and `updated_at` in a **single API call**
2. Compare `updated_at` with Phase 1 timestamp
3. If changed → **abort update for this source**, notify user (continue with other unaffected sources)
4. If unchanged → apply checkbox replacements via `jq` gsub
5. Update body/comment (batch per source — one update per body/comment)
6. **Post-update verification** — assert the updated body contains all expected `[x]` items; escalate to user if assertion fails

> **Preferred method for PR/issue body**: Use `jq -r` to extract the modified
> body to a temp file, then `gh pr edit --body-file` /
> `gh issue edit --body-file`. The CLI handles JSON encoding internally,
> eliminating double-encoding risks. Never pipe the body through shell
> variables or `sed`. Use the raw API method (`jq` pipeline →
> `gh api --input -`) only for **comments** (no CLI shortcut) or when the CLI
> is unavailable.

### Phase 5: Summary Report

Generate a final report after all verifications and updates:

```markdown
## Checklist Verification Summary

**Source:** PR #123 - Feature implementation
**Items:** 11 total (8 unchecked → verified)

### Results

| # | Item | Category | Result | Confidence | Updated |
|---|------|----------|--------|------------|---------|
| 1 | Tests pass | CI | PASS | HIGH | ✅ Checked |
| 2 | No secrets | Scan | FAIL | MEDIUM | — |
| 3 | Lint passes | CI | PENDING | — | — |

### Statistics
- **Passed:** 1/3 verified items · **Failed:** 1 · **Pending:** 1 · **Already checked:** 3 (skipped)

### Failed Items
1. **No secrets in code** — Found potential API key in `src/config.ts:42`. Please review and remove before merging.

### Next Steps
- Fix the failed item (#2) and re-run the checklist
- CI check (#3) is pending — re-run after CI completes
```

Report evidence for every PASS and FAIL — traceability matters.

## Error Handling

| Error | Action |
|-------|--------|
| No checklist found | Report "No checklist items found" and exit |
| All items already checked | Report; offer to re-verify if user explicitly requests |
| PR is closed/merged | Warn; ask if proceed anyway |
| Different repo URL | Extract owner/repo, verify `gh` access |
| CI failing | Report which checks failed, mark as FAIL |
| CI pending | One-time check; offer: skip / wait-and-rerun / local |
| No CI configured | Suggest local execution with detected commands |
| No edit permission | Comment-based verification report |
| Bot PR | Default to comment mode |
| Race condition (`updated_at` changed) | Abort PATCH for that source; continue with remaining sources; notify user |
| Large PR with many scan items | Cap at 5 subagents; confirm before launching |
| GraphQL API error | Retry once; fall back to REST API if available |
| `gh` CLI not configured | Report prerequisite; suggest `gh auth login` |

## Reference Files

- [classification-patterns.md](references/classification-patterns.md) — Item classification rules, keyword patterns, confidence assignment
- [verification-recipes.md](references/verification-recipes.md) — Verification commands, subagent prompts, API endpoints
- [checkbox-update-rules.md](references/checkbox-update-rules.md) — Ownership detection, permission rules, update mechanics

## Notes

- Requires `gh` CLI authenticated with repo read access (write access for auto-checking)
- Works with GitHub PRs and issues (GitLab/Bitbucket not supported)
- GHES support is best-effort — some instances disable GraphQL or have different pagination limits; test against your target instance
- Fine-grained PATs need `issues:write` or `pull_requests:write` for checkbox editing, `metadata:read` for permission probe
- Mixed checklists across multiple comments are supported — each source is tracked and updated independently
- Re-running the skill on the same PR is safe — already-checked items are skipped unless the user explicitly asks to re-verify all items (which re-classifies and re-verifies regardless of checked state)
- Race condition prevention is best-effort (TOCTOU between GET and PATCH) — GitHub API has no conditional-write support; the `updated_at` check reduces but does not eliminate the race window
