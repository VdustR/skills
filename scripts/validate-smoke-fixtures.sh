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
  "vp-chrome-profiles"
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
chrome_profiles_fixture="fixtures/smoke/vp-chrome-profiles.md"

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

require_pattern "$chrome_profiles_fixture" 'dedicated managed profiles?' \
  "vp-chrome-profiles fixture must cover dedicated managed profiles"
require_pattern "$chrome_profiles_fixture" 'delete.*marker|marker.*delete' \
  "vp-chrome-profiles fixture must cover marker-guarded deletion"
require_pattern "$chrome_profiles_fixture" 'running profiles?.*not deleted|in use.*Chrome' \
  "vp-chrome-profiles fixture must cover in-use profile deletion refusal"
require_pattern "$chrome_profiles_fixture" 'browser-url|browserUrl' \
  "vp-chrome-profiles fixture must cover browser-url MCP connection"

tmp_home="$(mktemp -d)"
fake_profile_pid=""
cleanup() {
  if [ -n "$fake_profile_pid" ]; then
    kill "$fake_profile_pid" 2>/dev/null || true
  fi
  rm -rf "$tmp_home"
}
trap cleanup EXIT
profilectl="skills/vp-chrome-profiles/scripts/chrome-profilectl"

[ -x "$profilectl" ] || fail "$profilectl is missing or not executable"

HOME="$tmp_home" "$profilectl" create test-profile >/dev/null
HOME="$tmp_home" "$profilectl" list | grep -Fq 'test-profile' \
  || fail "chrome-profilectl list must show created profiles"
HOME="$tmp_home" "$profilectl" mcp-args test-profile --port 9344 | grep -Fq -- '--browser-url=http://127.0.0.1:9344' \
  || fail "chrome-profilectl mcp-args must emit browser-url"
mkdir -p "$tmp_home/.agents/chrome-profiles/unmanaged"
if HOME="$tmp_home" "$profilectl" delete unmanaged --yes >/dev/null 2>&1; then
  fail "chrome-profilectl delete must refuse unmanaged profiles"
fi
bash -c 'exec -a "Google Chrome --user-data-dir=$1" sleep 30' \
  chrome-profilectl-test "$tmp_home/.agents/chrome-profiles/test-profile" &
fake_profile_pid="$!"
if HOME="$tmp_home" "$profilectl" delete test-profile --yes >/dev/null 2>&1; then
  fail "chrome-profilectl delete must refuse profiles that appear in use"
fi
kill "$fake_profile_pid" 2>/dev/null || true
wait "$fake_profile_pid" 2>/dev/null || true
fake_profile_pid=""
HOME="$tmp_home" "$profilectl" delete test-profile --yes >/dev/null
[ ! -e "$tmp_home/.agents/chrome-profiles/test-profile" ] \
  || fail "chrome-profilectl delete must remove managed profiles"

printf 'Validated %s smoke fixtures.\n' "${#required_skills[@]}"
