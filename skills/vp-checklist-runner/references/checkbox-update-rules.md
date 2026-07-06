# Checkbox Update Rules

Ownership detection, permission rules, and update mechanics for Phase 4 checkbox updates.

## Ownership Detection

### Get Current User

```bash
gh api user --jq '.login'
```

### Compare with Post Author

Each checklist source (PR body, comment) has an author from Phase 1. Compare:

```text
current_user = gh api user --jq '.login'
post_author  = (from Phase 1 data)

is_own_post = (current_user == post_author)
```

### Bot Detection

An author is a bot if:

1. **Login ends with `[bot]`**: `dependabot[bot]`, `github-actions[bot]`, `renovate[bot]`
2. **Known bot services** (case-insensitive match):
   - `dependabot`, `renovate`, `github-actions`
   - `copilot`, `coderabbitai`, `codiumai`, `sourcery-ai`
   - `deepsource`, `sonarcloud`, `codeclimate`, `snyk`

```bash
# Detection logic — regex MUST be in a variable (unquoted in =~), not inline-quoted
author_lower=$(echo "$author" | tr '[:upper:]' '[:lower:]')
is_bot=false

bot_suffix='\[bot\]$'
bot_names='^(dependabot|renovate|github-actions|copilot|coderabbitai|codiumai|sourcery-ai|deepsource|sonarcloud|codeclimate|snyk)$'

if [[ "$author_lower" =~ $bot_suffix ]]; then
  is_bot=true
elif [[ "$author_lower" =~ $bot_names ]]; then
  is_bot=true
fi
```

## Permission Detection

### Check Repository Write Access

```bash
gh api repos/{o}/{r} --jq '.permissions.push // false'
# Returns: true or false
# Note: .permissions may be null for fine-grained PATs without metadata:read scope
# If null/absent, treat as no write access (the `// false` fallback handles this)
```

### Permission Matrix

| Condition | `is_own_post` | `has_push` | `is_bot` |
|-----------|:---:|:---:|:---:|
| Auto-check | true | any | false |
| Suggest-then-check | false | true | false |
| Comment-only | false | false | any |
| Comment-only (default for bots) | any | any | true |

> **Bot override**: When `is_bot=true` and `has_push=true`, the default is Comment-only. User can explicitly request "check them for me" to override to Suggest-then-check mode.

## Update Decision Matrix

| Post Owner | Permission | Default Behavior | User Override |
|------------|-----------|-----------------|--------------|
| **Self** | Any | Auto-check passed items | — |
| **Other (human)** | Push access | Suggest user self-operate | "Check them for me" → edit |
| **Other (human)** | No access | Comment with verification report | — |
| **Bot** | Any | Comment with verification report | "Check them for me" → edit (if has push) |

### Interaction Examples

**Own post — auto-check:**
```text
Checking off 5 passed items in your PR body...
Updated PR #123 body: 5 items checked.
```

**Other's post — suggest:**
```text
PR #123 body was authored by @other-user.
Default: I'll post a verification report as a comment.

Options:
1. Post verification report as comment (recommended)
2. Check off items directly (I have write access)
3. Skip updating — just show me the results

Which option? [1/2/3]
```

**No access — comment only:**
```text
You don't have write access to this repository.
I'll post a verification report as a comment instead.
```

## Race Condition Prevention

### Timestamp Comparison

Phase 1 saves `updated_at` for each source. Before PATCH in Phase 4:

```bash
# Create a unique temp file to avoid collisions with concurrent executions
tmpfile=$(mktemp) && trap 'rm -f "$tmpfile"' EXIT

# Re-fetch current body AND updated_at in a SINGLE API call — save to temp file
gh api repos/{o}/{r}/pulls/{n} > "$tmpfile"
# For issues: gh api repos/{o}/{r}/issues/{n} > "$tmpfile"
# For comments: gh api repos/{o}/{r}/issues/comments/{id} > "$tmpfile"

current_updated_at=$(jq -r '.updated_at' "$tmpfile")

# Compare with Phase 1 timestamp
if [ "$current_updated_at" != "$phase1_updated_at" ]; then
  echo "Source has been modified since we started."
  echo "Skipping checkbox update for THIS source."
  echo "Please re-run the checklist to get fresh data for this source."
  # abort: do not proceed to PATCH for this source
  # (continue with other unaffected sources in the outer loop)
  return 1  # or exit 1 if not in a function
fi
# Safe to proceed — timestamp matches
```

> **TOCTOU note**: There is a residual race window between this GET and the subsequent PATCH. GitHub API has no conditional-write (ETag/If-Match) support for body updates. This timestamp check is best-effort — it reduces but does not eliminate the risk. After PATCH, optionally re-fetch to verify the update applied correctly.

### Rules

1. **Always compare timestamps** before every PATCH operation
2. **Fetch body AND timestamp in a single API call** — avoid mini-race between separate calls
3. **If timestamps differ** → skip this source's PATCH; continue with other sources
4. **Notify user** with clear message about which source was skipped
5. **Suggest re-running** the skill to get fresh data for skipped sources

## Update Mechanics

### PR Body Update

#### Preferred: CLI Method

Use `gh pr edit --body-file` — the CLI handles JSON encoding internally, eliminating double-encoding risks entirely.

> **Cross-fork PRs**: `gh pr edit` targets the current git remote's repo. For PRs from forks, it may target the wrong repo or fail silently. Use the Raw API Method instead for cross-fork PRs.

```bash
# Prerequisite: $tmpfile and $body_file must be set via mktemp
tmpfile=$(mktemp) && body_file=$(mktemp) && trap 'rm -f "$tmpfile" "$body_file"' EXIT

# 1. GET current body + updated_at in a single call
gh api repos/{o}/{r}/pulls/{n} > "$tmpfile"

# 2. Compare updated_at (see Race Condition Prevention)
current_updated_at=$(jq -r '.updated_at' "$tmpfile")

# 3. Extract body with checkbox replacements → raw text file
#    jq -r decodes JSON string to raw text; gh pr edit re-encodes correctly
#    Chain one gsub per passed item — do NOT use a catch-all pattern
#    NOTE: Parentheses in item text must be regex-escaped in jq gsub: \( \)
jq -r '(.body // "")
  | gsub("- \\[ \\] First passed item"; "- [x] First passed item")
  | gsub("- \\[ \\] Item with \\(parens\\)"; "- [x] Item with (parens)")
' "$tmpfile" > "$body_file"

# 4. Update PR body — CLI handles encoding
#    Note: if body was null (empty PR), $body_file contains "" — gh pr edit sets an empty body
gh pr edit {n} --body-file "$body_file"
```

> **Why this is preferred**: The `jq -r` → file → `--body-file` pipeline has a clean encoding boundary: `jq -r` decodes JSON to raw text, and `gh pr edit` encodes raw text back to JSON. There is no manual JSON wrapping step where double-encoding can occur.

#### Anti-Patterns (DO NOT USE)

These patterns cause **double-encoding** — newlines (`\n`) become literal `\\n` in the PR body, collapsing the entire body into a single unreadable line on GitHub:

| Anti-Pattern | Why It Breaks |
|-------------|---------------|
| `gh api --jq '.body' \| jq -Rs '{body: .}'` | `--jq` decodes JSON → raw text; `jq -Rs` re-encodes raw text → JSON, double-escaping `\n` to `\\n` |
| `body=$(gh api --jq '.body' ...); jq -n --arg b "$body" '{body: $b}'` | Shell variable loses trailing newlines; `--arg` re-encodes, double-escaping |
| `gh api --jq '.body' \| sed 's/\[ \]/[x]/' \| ...` | `sed` on decoded text + any re-encoding path = double-escape; also vulnerable to shell metacharacter injection |

**Consequence**: The PR/issue body renders as a single line of escaped text on GitHub. All markdown formatting (headers, lists, checkboxes) is destroyed. Requires a manual `gh pr edit --body-file` to fix.

#### Alternative: Raw API Method

Use `jq` pipeline piped to `gh api --input -` when the CLI method is unavailable (e.g., insufficient CLI version, cross-fork PRs).

> **CRITICAL: Do NOT use shell `sed` or `echo` for checkbox replacement.** PR body content may contain shell metacharacters (backticks, `$()`, sed delimiters) that would cause injection or corruption. Keep content in JSON throughout — this avoids shell expansion entirely.
>
> **Do NOT use `gh api --jq '.body'` to extract the body as raw text.** This decodes JSON escapes (e.g., `\n` → real newlines), and any subsequent `jq -Rs` re-encoding will double-escape them (`\n` → `\\n`), corrupting the body on PATCH. Always operate on the full JSON response via a temp file so `jq` reads `.body` as a JSON string, not raw text.

> **Note — gsub regex escaping**: `jq`'s `gsub` uses Oniguruma regex. Checklist item text may contain regex metacharacters (`.`, `*`, `+`, `?`, `[`, `]`, `(`, `)`, `{`, `}`, `^`, `$`, `|`, `\`). Escape them with `\\` in the gsub pattern. If duplicate item text exists across sources, warn the user — gsub replaces all occurrences and cannot target by position.

```bash
# Prerequisite: $tmpfile must be set via mktemp (see Race Condition Prevention)
#
# 1. GET current body + updated_at in a single call
#    IMPORTANT: Save to a temp file, NOT a shell variable — PR body may contain
#    control characters (newlines, tabs) that corrupt shell variable expansion.
gh api repos/{o}/{r}/pulls/{n} > "$tmpfile"

# 2. Compare updated_at (see Race Condition Prevention)
current_updated_at=$(jq -r '.updated_at' "$tmpfile")

# 3. Replace checkboxes and build JSON payload in a single jq pipeline
#    This keeps the body in JSON throughout, avoiding shell escaping entirely
#    Chain one gsub per passed item — do NOT use a catch-all pattern (would check off failed items too)
#    NOTE: Parentheses in item text must be regex-escaped in jq gsub: \( \)
jq '{body: ((.body // "")
  | gsub("- \\[ \\] First passed item"; "- [x] First passed item")
  | gsub("- \\[ \\] Item with \\(parens\\)"; "- [x] Item with (parens)")
)}' "$tmpfile" \
  | gh api repos/{o}/{r}/pulls/{n} -X PATCH --input -
```

### Issue Body Update

#### Preferred: CLI Method

```bash
# Same pattern as PR body, using gh issue edit
tmpfile=$(mktemp) && body_file=$(mktemp) && trap 'rm -f "$tmpfile" "$body_file"' EXIT
gh api repos/{o}/{r}/issues/{n} > "$tmpfile"
current_updated_at=$(jq -r '.updated_at' "$tmpfile")
jq -r '(.body // "")
  | gsub("- \\[ \\] First passed item"; "- [x] First passed item")
  | gsub("- \\[ \\] Second passed item"; "- [x] Second passed item")
' "$tmpfile" > "$body_file"
gh issue edit {n} --body-file "$body_file"
```

> **Why this is preferred**: Same encoding boundary as PR body — `jq -r` decodes to raw text, `gh issue edit` encodes back to JSON. No manual JSON wrapping, no double-encoding risk.

#### Alternative: Raw API Method

```bash
# Prerequisite: $tmpfile must be set via mktemp (see Race Condition Prevention)
# Same pattern as PR body, using issues endpoint
gh api repos/{o}/{r}/issues/{n} > "$tmpfile"
jq '{body: ((.body // "")
  | gsub("- \\[ \\] First passed item"; "- [x] First passed item")
  | gsub("- \\[ \\] Second passed item"; "- [x] Second passed item")
)}' "$tmpfile" \
  | gh api repos/{o}/{r}/issues/{n} -X PATCH --input -
```

### Comment Update

#### Raw API Method (only option — no CLI shortcut for comments)

The `gh` CLI has no `gh comment edit --body-file` equivalent, so the raw API method is the only option for comment updates.

```bash
# Prerequisite: $tmpfile must be set via mktemp (see Race Condition Prevention)
# 1. GET current comment (body + updated_at in single call)
gh api repos/{o}/{r}/issues/comments/{comment_id} > "$tmpfile"

# 2. Compare updated_at (see Race Condition Prevention)
current_updated_at=$(jq -r '.updated_at' "$tmpfile")

# 3. Replace checkboxes and PATCH — same jq pipeline pattern
jq '{body: ((.body // "")
  | gsub("- \\[ \\] First passed item"; "- [x] First passed item")
  | gsub("- \\[ \\] Second passed item"; "- [x] Second passed item")
)}' "$tmpfile" \
  | gh api repos/{o}/{r}/issues/comments/{comment_id} -X PATCH --input -
```

### Post-Update Verification

After every update, verify the body contains all expected checkboxes.

#### CLI Method Verification

Since `gh pr edit --body-file` / `gh issue edit --body-file` do not return the updated body, re-fetch via API to verify:

```bash
# After gh pr edit {n} --body-file "$body_file"
# or    gh issue edit {n} --body-file "$body_file"

# Set $source_endpoint: "pulls/{n}" for PRs, "issues/{n}" for issues
source_endpoint="pulls/{n}"

# Re-fetch and assert all expected items are checked — one `contains` per item
# Uses `contains` (literal substring match) instead of `test` (regex) to avoid escaping issues
# Limitation: `contains` is a substring match — if one item text is a prefix of another
# (e.g., "Fix bug" vs "Fix bug in auth"), the shorter match may false-positive.
# For precise matching, use `test` with regex anchoring instead.
gh api "repos/{o}/{r}/$source_endpoint" \
  | jq -e '.body | contains("- [x] First passed item")'
```

> **Error handling**: If `gh api` fails (auth error, rate limit, 404), the error is piped to `jq` which produces a parse error. To get clearer diagnostics, run with `set -o pipefail` or capture the API response separately before piping to `jq`.

#### Raw API Method Verification

The `gh api` PATCH response already returns the updated resource — save it and assert:

```bash
# Set $patch_endpoint to the same endpoint used for PATCH
patch_endpoint="pulls/{n}"  # or "issues/{n}" or "issues/comments/{id}"

verify_tmpfile=$(mktemp) && trap 'rm -f "${tmpfile:-}" "${verify_tmpfile:-}"' EXIT

# Capture PATCH response (replaces the bare `gh api ... -X PATCH --input -` above)
jq '{body: ((.body // "")
  | gsub("- \\[ \\] First passed item"; "- [x] First passed item")
)}' "$tmpfile" \
  | gh api "repos/{o}/{r}/$patch_endpoint" -X PATCH --input - > "$verify_tmpfile"

# Assert all expected items are checked — one `contains` per item
# Uses `contains` (literal substring match) instead of `test` (regex) to avoid escaping issues
# Limitation: substring match — see CLI Method Verification note about prefix ambiguity
jq -e '.body | contains("- [x] First passed item")' "$verify_tmpfile"
```

**If verification fails** (assertion exits non-zero), report the failure to the user and stop updating this source. Do NOT attempt automatic repair — the failure indicates an unexpected encoding issue that requires human investigation. Include the PATCH response in the summary report as evidence.

### Batching

- **One PATCH per source**: Group all checkbox updates for the same body/comment into a single PATCH
- **Order**: Update PR/issue body first, then comments (oldest first)
- **Per-source abort on race condition**: If a source has a timestamp mismatch, skip only that source and continue with others; report which sources were skipped

## Comment Report Template

When posting a verification report as a comment (instead of editing checkboxes):

```markdown
## Checklist Verification Report

<!-- Generated by vp-checklist-runner -->

| Status | Item | Evidence |
|--------|------|----------|
| ✅ PASS | ~~SKILL.md has valid frontmatter~~ | `head -20 skills/vp-checklist-runner/SKILL.md` contains `name:` and `description:` |
| ✅ PASS | ~~Tests pass~~ | CI: all 12 checks passed |
| ❌ FAIL | **No secrets in code** | Found potential key in `src/config.ts:42` |
| ⏳ PENDING | Lint passes | CI check still running |
| ⏭️ SKIP | Design reviewed | Requires human verification |

**Summary:** 4/6 passed | 1 failed | 1 pending

---
*Generated by [vp-checklist-runner](https://github.com/VdustR/skills)*
```

### Comment Placement

Use `gh api` with JSON wrapping for both PRs and issues (PRs are issues in GitHub API):

```bash
# Write report to temp file, then wrap in JSON — avoids shell expansion of $report
# (Do NOT pass report content through shell variables — use --rawfile instead)
# Note: if $tmpfile trap is already set, combine cleanup:
#   trap 'rm -f "$tmpfile" "$report_file"' EXIT
report_file=$(mktemp)
# ... write report content to "$report_file" ...
jq -n --rawfile body "$report_file" '{"body": $body}' \
  | gh api repos/{o}/{r}/issues/{n}/comments --input -
```

### Updating Existing Report

If a previous vp-checklist-runner comment exists (detected by `<!-- Generated by vp-checklist-runner -->` marker):
- Update the existing comment instead of creating a new one
- Use the comment's `databaseId` (integer from GraphQL, same as the REST `id` field) for the PATCH URL path
