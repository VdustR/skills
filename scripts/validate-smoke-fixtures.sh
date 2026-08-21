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
  "vp-skills"
  "vp-pr-comment-resolver"
  "vp-git"
  "vp-stacked-pr"
  "vp-recording"
  "vp-github"
  "vp-agent-browser-session"
  "vp-session-wrapup"
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
pr_resolver_reply_templates="skills/vp-pr-comment-resolver/references/reply-templates.md"
git_fixture="fixtures/smoke/vp-git.md"
stacked_rebase_fixture="fixtures/smoke/vp-stacked-pr.md"
recording_fixture="fixtures/smoke/vp-recording.md"
github_fixture="fixtures/smoke/vp-github.md"
agent_browser_session_fixture="fixtures/smoke/vp-agent-browser-session.md"
vp_skills_fixture="fixtures/smoke/vp-skills.md"
session_wrapup_fixture="fixtures/smoke/vp-session-wrapup.md"

require_pattern "$vp_skills_fixture" "agent '\\*'|--agent '\\*'" \
  "vp-skills fixture must cover quoted all-agent defaults"
require_pattern "$vp_skills_fixture" 'check.*dry-run|dry-run.*check' \
  "vp-skills fixture must cover check is not a dry-run"
require_pattern "$vp_skills_fixture" 'stale.*lock|lock.*stale' \
  "vp-skills fixture must cover stale lock repair"
require_pattern "$vp_skills_fixture" 'remove --all' \
  "vp-skills fixture must cover destructive remove --all avoidance"
require_pattern "$vp_skills_fixture" 'list -g --json|list --json' \
  "vp-skills fixture must cover JSON listing"
require_pattern "$vp_skills_fixture" 'add .*--list|--list.*add ' \
  "vp-skills fixture must cover source preview with add --list"
require_pattern "$vp_skills_fixture" 'skill-agent-table|agent inventory' \
  "vp-skills fixture must cover agent inventory tables"
require_pattern "$vp_skills_fixture" 'universal.*Codex|Codex.*universal' \
  "vp-skills fixture must cover universal agent table expansion"

require_pattern "$pr_resolver_fixture" 'resolve.*bot review thread|bot review thread.*resolve' \
  "vp-pr-comment-resolver fixture must cover bot-only resolution"
require_pattern "$pr_resolver_fixture" 'human review threads?.*unresolved|unresolved.*human review threads?' \
  "vp-pr-comment-resolver fixture must cover human unresolved policy"
require_pattern "$pr_resolver_fixture" 'PR discussion comment' \
  "vp-pr-comment-resolver fixture must cover PR discussion comments"
require_pattern "$pr_resolver_fixture" 'outdated unresolved review thread' \
  "vp-pr-comment-resolver fixture must cover outdated unresolved threads"
require_pattern "$pr_resolver_fixture" 'explicit Markdown commit link' \
  "vp-pr-comment-resolver fixture must cover linked commit evidence"
require_pattern "$pr_resolver_reply_templates" '\[`<short-sha>`\]\(<canonical-commit-url>\)' \
  "vp-pr-comment-resolver fixed reply must use an explicit commit link"

require_pattern "$git_fixture" 'force deletion harmless' \
  "vp-git fixture must cover squash-merge state not justifying force deletion"
require_pattern "$git_fixture" 'not treated as proof of merge' \
  "vp-git fixture must cover a deleted upstream not proving a merge"
require_pattern "$git_fixture" 'uninspected stashes are protected' \
  "vp-git fixture must cover stash protection"
require_pattern "$git_fixture" 'dirty worktree is not removed' \
  "vp-git fixture must cover dirty worktree protection"
require_pattern "$git_fixture" 'does not authorize destructive deletions' \
  "vp-git fixture must cover vague cleanup requests not authorizing deletions"

require_pattern "$stacked_rebase_fixture" 'squash[[:space:]-]*merge' \
  "vp-stacked-pr fixture must cover squash merges"
require_pattern "$stacked_rebase_fixture" 'force-with-lease' \
  "vp-stacked-pr fixture must cover force-with-lease confirmation"
require_pattern "$stacked_rebase_fixture" 'backup branch' \
  "vp-stacked-pr fixture must cover backup retention"
require_pattern "$stacked_rebase_fixture" 'gh stack (init|add|submit|merge)' \
  "vp-stacked-pr fixture must cover the native gh stack workflow"
require_pattern "$stacked_rebase_fixture" 'stack merge API' \
  "vp-stacked-pr fixture must cover stacked members requiring the stack merge API"
require_pattern "$stacked_rebase_fixture" 'native.*not.*(reconstruction|manual)|not manual reconstruction' \
  "vp-stacked-pr fixture must cover routing GitHub stacks to the native workflow"

require_pattern "$recording_fixture" 'window id, never a screen rectangle|screencapture -l' \
  "vp-recording fixture must cover window-scoped capture over rectangle capture"
require_pattern "$recording_fixture" 'samples on change|change-sampled' \
  "vp-recording fixture must cover change-sampled capture not being a demo recorder"
require_pattern "$recording_fixture" 'injected pointer follow' \
  "vp-recording fixture must cover the pointer following real mouse events"
require_pattern "$recording_fixture" 'live geometry' \
  "vp-recording fixture must cover resolving targets from live geometry"
require_pattern "$recording_fixture" 'verified by looking at frames|contact sheet' \
  "vp-recording fixture must cover verifying output before delivery"

require_pattern "$github_fixture" 'public by URL' \
  "vp-github fixture must cover attachments being public by URL"
require_pattern "$github_fixture" 'eight media content types|not promised on a token' \
  "vp-github fixture must cover the media-only token whitelist"
require_pattern "$github_fixture" 'x-fetch-nonce' \
  "vp-github fixture must cover the verified-fetch nonce gate"
require_pattern "$github_fixture" 'release asset or repo blob' \
  "vp-github fixture must cover the unattended release-asset fallback"
require_pattern "$github_fixture" 'survives GitHub.s sanitizer only when' \
  "vp-github fixture must cover inline video requiring a user-attachments source"

require_pattern "$agent_browser_session_fixture" 'dedicated managed profiles?' \
  "vp-agent-browser-session fixture must cover dedicated managed profiles"
require_pattern "$agent_browser_session_fixture" 'installed.*agent-browser skill' \
  "vp-agent-browser-session fixture must prefer installed agent-browser guidance"
require_pattern "$agent_browser_session_fixture" 'CLI-bundled.*(fallback|authoritative|authority)' \
  "vp-agent-browser-session fixture must cover CLI-bundled guidance fallback"
require_pattern "$agent_browser_session_fixture" 'GitHub.*not.*automatic|do not.*fetch GitHub' \
  "vp-agent-browser-session fixture must reject automatic GitHub fallback"
require_pattern "$agent_browser_session_fixture" 'delete.*marker|marker.*delete' \
  "vp-agent-browser-session fixture must cover marker-guarded deletion"
require_pattern "$agent_browser_session_fixture" 'running profiles?.*not deleted|in use.*Chrome' \
  "vp-agent-browser-session fixture must cover in-use profile deletion refusal"
require_pattern "$agent_browser_session_fixture" 'worktree-scoped' \
  "vp-agent-browser-session fixture must cover stable worktree sessions"

require_pattern "$session_wrapup_fixture" 'risk-free cleanup authorization does not extend' \
  "vp-session-wrapup fixture must cover bounded risk-free cleanup authorization"
require_pattern "$session_wrapup_fixture" 'pre-existing.*(not remove|reported)|predates' \
  "vp-session-wrapup fixture must cover pre-existing state protection"
require_pattern "$session_wrapup_fixture" 'credential files? are not deleted|Do not delete the credential file' \
  "vp-session-wrapup fixture must cover credential file protection"
require_pattern "$session_wrapup_fixture" 'uncertainty.*report|report, not remove' \
  "vp-session-wrapup fixture must cover report-on-uncertainty"
require_pattern "$session_wrapup_fixture" 'Name each item before removing|named before execution' \
  "vp-session-wrapup fixture must cover naming removals before execution"

tmp_home="$(mktemp -d)"
fake_profile_pid=""
cleanup() {
  if [ -n "$fake_profile_pid" ]; then
    kill "$fake_profile_pid" 2>/dev/null || true
  fi
  rm -rf "$tmp_home"
}
trap cleanup EXIT
sessionctl="skills/vp-agent-browser-session/scripts/agent-browser-sessionctl"
fake_bin="$tmp_home/bin"
mkdir -p "$fake_bin"
cat > "$fake_bin/agent-browser" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

case "$*" in
  --version)
    printf 'agent-browser 0.test\n'
    ;;
  'skills path core')
    printf '/test/agent-browser/core\n'
    ;;
  'skills get core --full')
    printf '# agent-browser core\n'
    ;;
  'session id --scope worktree --prefix '*)
    printf '%s-worktree\n' "$6"
    ;;
  *)
    printf '%s\n' "$*"
    ;;
esac
EOF
chmod +x "$fake_bin/agent-browser"
export PATH="$fake_bin:$PATH"

[ -x "$sessionctl" ] || fail "$sessionctl is missing or not executable"

file_mode() {
  stat -c '%a' "$1" 2>/dev/null || stat -f '%Lp' "$1" 2>/dev/null || printf 'unknown'
}

doctor_output="$(HOME="$tmp_home" "$sessionctl" doctor)" \
  || fail "agent-browser-sessionctl doctor must pass in this repository test environment"
printf '%s\n' "$doctor_output" | grep -Fq 'root:' \
  || fail "agent-browser-sessionctl doctor must print the profile root"
mkdir -p "$tmp_home/.agents/chrome-profiles"
chmod 755 "$tmp_home/.agents/chrome-profiles"
HOME="$tmp_home" "$sessionctl" create test-profile >/dev/null
[ "$(file_mode "$tmp_home/.agents/chrome-profiles")" = "700" ] \
  || fail "agent-browser-sessionctl must create profile root with mode 700"
[ "$(file_mode "$tmp_home/.agents/chrome-profiles/test-profile")" = "700" ] \
  || fail "agent-browser-sessionctl must create profiles with mode 700"
grep -Fxq 'tool=vp-agent-browser-session' "$tmp_home/.agents/chrome-profiles/test-profile/.vp-chrome-profile" \
  || fail "agent-browser-sessionctl create must write a tool marker"
HOME="$tmp_home" "$sessionctl" list | grep -Fq 'test-profile' \
  || fail "agent-browser-sessionctl list must show created profiles"
HOME="$tmp_home" "$sessionctl" session-id test-profile | grep -Fq 'test-profile' \
  || fail "agent-browser-sessionctl must derive a prefixed session id"
HOME="$tmp_home" "$sessionctl" core-skill | grep -Fq 'agent-browser core' \
  || fail "agent-browser-sessionctl must load CLI-bundled core guidance"
run_output="$(HOME="$tmp_home" "$sessionctl" run test-profile open https://example.com)"
printf '%s\n' "$run_output" \
  | grep -Fq -- "--session test-profile-worktree --profile $tmp_home/.agents/chrome-profiles/test-profile open https://example.com" \
  || fail "agent-browser-sessionctl run must bind the stable session and managed profile"
if HOME="$tmp_home" "$sessionctl" run test-profile --profile /tmp/override open https://example.com >/dev/null 2>&1; then
  fail "agent-browser-sessionctl run must reject profile overrides"
fi
if HOME="$tmp_home" "$sessionctl" run test-profile --restore open https://example.com >/dev/null 2>&1; then
  fail "agent-browser-sessionctl run must reject competing restore state"
fi
if HOME="$tmp_home" "$sessionctl" run test-profile close --all >/dev/null 2>&1; then
  fail "agent-browser-sessionctl run must not close unrelated sessions"
fi
mkdir -p "$tmp_home/.agents/chrome-profiles/adopted/Default"
touch "$tmp_home/.agents/chrome-profiles/adopted/Local State"
HOME="$tmp_home" "$sessionctl" adopt adopted --yes >/dev/null
grep -Fxq 'tool=vp-agent-browser-session' "$tmp_home/.agents/chrome-profiles/adopted/.vp-chrome-profile" \
  || fail "agent-browser-sessionctl adopt must write a tool marker"
HOME="$tmp_home" "$sessionctl" delete adopted --yes >/dev/null
mkdir -p "$tmp_home/.agents/chrome-profiles/adopt-in-use/Default"
touch "$tmp_home/.agents/chrome-profiles/adopt-in-use/Local State"
bash -c 'trap "exit 0" TERM; while :; do sleep 1; done' \
  agent-browser-sessionctl-test "--user-data-dir=$tmp_home/.agents/chrome-profiles/adopt-in-use" &
fake_profile_pid="$!"
if HOME="$tmp_home" "$sessionctl" adopt adopt-in-use --yes >/dev/null 2>&1; then
  fail "agent-browser-sessionctl adopt must refuse profiles that appear in use"
fi
kill "$fake_profile_pid" 2>/dev/null || true
wait "$fake_profile_pid" 2>/dev/null || true
fake_profile_pid=""
HOME="$tmp_home" "$sessionctl" adopt adopt-in-use --yes >/dev/null
HOME="$tmp_home" "$sessionctl" delete adopt-in-use --yes >/dev/null
mkdir -p "$tmp_home/.agents/chrome-profiles/legacy"
printf 'tool=vp-chrome-profiles\n' > "$tmp_home/.agents/chrome-profiles/legacy/.vp-chrome-profile"
HOME="$tmp_home" "$sessionctl" delete legacy --yes >/dev/null \
  || fail "agent-browser-sessionctl must accept legacy managed markers"
mkdir -p "$tmp_home/.agents/chrome-profiles/unmanaged"
if HOME="$tmp_home" "$sessionctl" delete unmanaged --yes >/dev/null 2>&1; then
  fail "agent-browser-sessionctl delete must refuse unmanaged profiles"
fi
bash -c 'trap "exit 0" TERM; while :; do sleep 1; done' \
  agent-browser-sessionctl-test "--user-data-dir=$tmp_home/.agents/chrome-profiles/test-profile" &
fake_profile_pid="$!"
if HOME="$tmp_home" "$sessionctl" delete test-profile --yes >/dev/null 2>&1; then
  fail "agent-browser-sessionctl delete must refuse profiles that appear in use"
fi
kill "$fake_profile_pid" 2>/dev/null || true
wait "$fake_profile_pid" 2>/dev/null || true
fake_profile_pid=""
HOME="$tmp_home" "$sessionctl" delete test-profile --yes >/dev/null
[ ! -e "$tmp_home/.agents/chrome-profiles/test-profile" ] \
  || fail "agent-browser-sessionctl delete must remove managed profiles"

printf 'Validated %s smoke fixtures.\n' "${#required_skills[@]}"
