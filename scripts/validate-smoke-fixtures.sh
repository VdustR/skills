#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT"

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

required_skills=(
  "vp-pr-comment-resolver"
  "vp-stacked-pr-rebase"
)

for skill_name in "${required_skills[@]}"; do
  fixture="fixtures/smoke/${skill_name}.md"
  skill_md="skills/${skill_name}/SKILL.md"

  [ -f "$fixture" ] || fail "$fixture is missing"
  [ -f "$skill_md" ] || fail "$skill_md is missing"

  prompt_pattern="Use \`\$${skill_name}\`"
  grep -Fq "$prompt_pattern" "$fixture" \
    || fail "$fixture must include a prompt invoking \$$skill_name"
  grep -Fq '## Prompt' "$fixture" \
    || fail "$fixture is missing ## Prompt"
  grep -Fq '## Expected Behavior' "$fixture" \
    || fail "$fixture is missing ## Expected Behavior"
  grep -Fq '## Regression Coverage' "$fixture" \
    || fail "$fixture is missing ## Regression Coverage"
done

grep -Fq 'Resolve only the handled bot review thread.' fixtures/smoke/vp-pr-comment-resolver.md \
  || fail "vp-pr-comment-resolver fixture must cover bot-only resolution"
grep -Fq 'Leave all human review threads unresolved' fixtures/smoke/vp-pr-comment-resolver.md \
  || fail "vp-pr-comment-resolver fixture must cover human unresolved policy"
grep -Fq 'PR discussion comment' fixtures/smoke/vp-pr-comment-resolver.md \
  || fail "vp-pr-comment-resolver fixture must cover PR discussion comments"
grep -Fq 'Do not skip the outdated unresolved review thread.' fixtures/smoke/vp-pr-comment-resolver.md \
  || fail "vp-pr-comment-resolver fixture must cover outdated unresolved threads"

grep -Fq 'squash merge' fixtures/smoke/vp-stacked-pr-rebase.md \
  || fail "vp-stacked-pr-rebase fixture must cover squash merges"
grep -Fq 'Ask before `git push --force-with-lease`.' fixtures/smoke/vp-stacked-pr-rebase.md \
  || fail "vp-stacked-pr-rebase fixture must cover force-with-lease confirmation"
grep -Fq 'Never delete the backup branch automatically.' fixtures/smoke/vp-stacked-pr-rebase.md \
  || fail "vp-stacked-pr-rebase fixture must cover backup retention"

printf 'Validated %s smoke fixtures.\n' "${#required_skills[@]}"
