#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT"

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_pattern() {
  local fixture="$1"
  local pattern="$2"
  local message="$3"

  grep -Eiq -- "$pattern" "$fixture" || fail "$message"
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

pr_resolver_fixture="fixtures/smoke/vp-pr-comment-resolver.md"
stacked_rebase_fixture="fixtures/smoke/vp-stacked-pr-rebase.md"

require_pattern "$pr_resolver_fixture" 'resolve.*bot review thread|bot review thread.*resolve' \
  "vp-pr-comment-resolver fixture must cover bot-only resolution"
require_pattern "$pr_resolver_fixture" 'human review threads?.*unresolved|unresolved.*human review threads?' \
  "vp-pr-comment-resolver fixture must cover human unresolved policy"
require_pattern "$pr_resolver_fixture" 'PR discussion comment' \
  "vp-pr-comment-resolver fixture must cover PR discussion comments"
require_pattern "$pr_resolver_fixture" 'outdated unresolved review thread' \
  "vp-pr-comment-resolver fixture must cover outdated unresolved threads"

require_pattern "$stacked_rebase_fixture" 'squash[[:space:]-]*merge' \
  "vp-stacked-pr-rebase fixture must cover squash merges"
require_pattern "$stacked_rebase_fixture" 'force-with-lease' \
  "vp-stacked-pr-rebase fixture must cover force-with-lease confirmation"
require_pattern "$stacked_rebase_fixture" 'backup branch' \
  "vp-stacked-pr-rebase fixture must cover backup retention"

printf 'Validated %s smoke fixtures.\n' "${#required_skills[@]}"
