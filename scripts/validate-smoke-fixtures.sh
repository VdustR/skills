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

# Skill routing is decided by the frontmatter description, so a whole-file grep
# passes on body prose that never reaches a routing decision.
frontmatter_of() {
  awk '
    NR == 1 && $0 == "---" { in_fm = 1; next }
    in_fm && $0 == "---" { exit }
    in_fm { print }
  ' "$1"
}

require_frontmatter_pattern() {
  local skill_md="$1"
  local pattern="$2"
  local message="$3"

  frontmatter_of "$skill_md" | grep -Eiq -- "$pattern" || fail "$message"
}

refute_frontmatter_pattern() {
  local skill_md="$1"
  local pattern="$2"
  local message="$3"

  frontmatter_of "$skill_md" | grep -Eiq -- "$pattern" && fail "$message"
  return 0
}

required_skills=(
  "vp-autodev"
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
pr_resolver_agent="skills/vp-pr-comment-resolver/agents/openai.yaml"
git_fixture="fixtures/smoke/vp-git.md"
stacked_rebase_fixture="fixtures/smoke/vp-stacked-pr.md"
recording_fixture="fixtures/smoke/vp-recording.md"
recording_skill="skills/vp-recording/SKILL.md"
recording_still_capture="skills/vp-recording/references/still-capture.md"
github_fixture="fixtures/smoke/vp-github.md"
agent_browser_session_fixture="fixtures/smoke/vp-agent-browser-session.md"
vp_skills_fixture="fixtures/smoke/vp-skills.md"
session_wrapup_fixture="fixtures/smoke/vp-session-wrapup.md"
autodev_fixture="fixtures/smoke/vp-autodev.md"
autodev_skill="skills/vp-autodev/SKILL.md"
autodev_review_observation="skills/vp-autodev/references/automated-review-observation.md"

require_pattern "$autodev_fixture" 'branch creation.*commit.*push.*Draft PR' \
  "vp-autodev fixture must cover authorization through Draft PR creation"
require_pattern "$autodev_fixture" 'Draft-to-Ready|mark.*Ready' \
  "vp-autodev fixture must cover the Draft-to-Ready transition"
require_pattern "$autodev_fixture" 'Ready PR.*not.*terminal|not.*stop.*Ready PR' \
  "vp-autodev fixture must reject a Ready PR as a successful terminal state"
require_pattern "$autodev_fixture" 'merge.*release follow-up|release follow-up.*merge' \
  "vp-autodev fixture must cover merge and release follow-up"
require_pattern "$autodev_skill" 'branch creation' \
  "vp-autodev must explicitly authorize branch creation"
require_pattern "$autodev_skill" 'commit, push' \
  "vp-autodev must explicitly authorize commit and push"
require_pattern "$autodev_skill" 'Draft PR creation' \
  "vp-autodev must explicitly authorize Draft PR creation"
require_pattern "$autodev_skill" 'Draft-to-Ready' \
  "vp-autodev must explicitly authorize the Draft-to-Ready transition"
require_pattern "$autodev_skill" 'changes, a Draft PR, or a Ready PR' \
  "vp-autodev must reject local, Draft, and Ready states as successful completion"
if grep -Fq 'Stop when all required signals pass' "$autodev_skill"; then
  fail "vp-autodev review success must advance to merge evaluation"
fi
require_pattern "$autodev_fixture" 'Do not automatically post `@codex review`' \
  "vp-autodev fixture must keep Codex review invocation out of the default flow"
require_pattern "$autodev_fixture" 'historical reviews.*summary comment' \
  "vp-autodev fixture must not infer invocation authority from historical bot state"
require_pattern "$autodev_fixture" 'Do not wait for Codex when it has not started' \
  "vp-autodev fixture must not wait for a reviewer that did not start"
require_pattern "$autodev_fixture" 'repository-supported retrigger' \
  "vp-autodev fixture must retry an optional reviewer before degrading it"
require_pattern "$autodev_fixture" 'Allow repeated failures, exhausted quota, or excessive delay' \
  "vp-autodev fixture must allow evidence-based optional-review degradation"
require_pattern "$autodev_fixture" 'fixed deadline' \
  "vp-autodev fixture must keep the unattended wait reference adaptable"
require_pattern "$autodev_fixture" 'Never degrade a repository-required review' \
  "vp-autodev fixture must preserve required reviews through failure and quota exhaustion"
require_pattern "$autodev_fixture" 'PR-level.*review-level.*inline-comment' \
  "vp-autodev fixture must include every applicable reaction surface"
require_pattern "$autodev_fixture" 'current-head CI and feedback.*last mutation' \
  "vp-autodev fixture must reconcile CI and feedback after the last mutation"
require_pattern "$autodev_fixture" 'Independently paginate submitted reviews' \
  "vp-autodev fixture must cover body-only submitted reviews"
require_pattern "$autodev_review_observation" 'Invoke a reviewer with a command such as `@codex review`' \
  "vp-autodev observation must require an explicit trigger for a new review"
require_pattern "$autodev_review_observation" 'Do not wait for a reviewer that has not started' \
  "vp-autodev observation must not wait for absent reviewer activity"
require_pattern "$autodev_review_observation" 'reasonable attempt to retrigger' \
  "vp-autodev observation must retry an optional reviewer before degrading it"
require_pattern "$autodev_review_observation" 'not a mandatory deadline' \
  "vp-autodev observation must keep the unattended wait reference adaptable"
require_pattern "$autodev_review_observation" 'applies only to optional reviews' \
  "vp-autodev observation must preserve repository-required review gates"
require_pattern "$autodev_review_observation" 'until the reviewer recovers and completes, or until the' \
  "vp-autodev observation must wait for required-review recovery or user direction"
require_pattern "$autodev_review_observation" 'Fetch every submitted review with independent complete pagination' \
  "vp-autodev observation must independently paginate submitted reviews"
require_pattern "$autodev_review_observation" 'Independently paginate each' \
  "vp-autodev observation must fully paginate applicable reaction targets"
require_pattern "$autodev_review_observation" 'thread resolution restarts the final snapshot' \
  "vp-autodev observation must reconcile after the final mutation"

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
require_pattern "$pr_resolver_fixture" 'PR conversation issue comment' \
  "vp-pr-comment-resolver fixture must cover PR conversation issue comments"
require_pattern "$pr_resolver_fixture" 'both GitHub feedback surfaces.*independently paginated|independently paginated.*both GitHub feedback surfaces' \
  "vp-pr-comment-resolver fixture must require complete independent pagination"
require_pattern "$pr_resolver_fixture" 'nested inline review-comment replies.*fully paginated|fully paginated.*nested inline review-comment replies' \
  "vp-pr-comment-resolver fixture must cover nested review-comment pagination"
require_pattern "$autodev_fixture" 'partial reads.*feedback.*handled|feedback.*handled.*partial reads' \
  "vp-autodev fixture must reject partial feedback snapshots"
require_pattern "$pr_resolver_fixture" 'outdated unresolved review thread' \
  "vp-pr-comment-resolver fixture must cover outdated unresolved threads"
require_pattern "$pr_resolver_fixture" 'explicit Markdown commit link' \
  "vp-pr-comment-resolver fixture must cover linked commit evidence"
require_pattern "$pr_resolver_reply_templates" '\[`<short-sha>`\]\(<canonical-commit-url>\)' \
  "vp-pr-comment-resolver fixed reply must use an explicit commit link"
require_pattern "$pr_resolver_fixture" 'Paginate submitted reviews independently' \
  "vp-pr-comment-resolver fixture must cover body-only submitted reviews"
require_pattern "$pr_resolver_fixture" 'submitted-review body.*reply.*PR conversation' \
  "vp-pr-comment-resolver fixture must define the supported review-body reply"
require_pattern "$pr_resolver_agent" 'submitted-review bodies' \
  "vp-pr-comment-resolver agent prompt must include submitted-review bodies"

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
require_pattern "$stacked_rebase_fixture" 'git update-ref refs/backup/<name> <branch> ""' \
  "vp-stacked-pr fixture must provide the safe backup-ref command"
require_pattern "$stacked_rebase_fixture" 'expected-empty guard.*fail.*overwrite|cannot overwrite a retained recovery point' \
  "vp-stacked-pr fixture must reject overwriting an existing backup ref"
require_pattern "$stacked_rebase_fixture" 'backup ref.*verified unchanged|Confirm the backup ref did not move' \
  "vp-stacked-pr fixture must verify that the backup ref remains unchanged"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'backup branch.*unsafe|Do not use a local branch' \
  "vp-stacked-pr manual rebase guidance must reject backup branches with --update-refs"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'git update-ref refs/backup/<name> <branch> ""' \
  "vp-stacked-pr manual rebase guidance must provide the safe backup-ref command"
require_pattern "$stacked_rebase_fixture" 'gh stack (init|add|submit|merge)' \
  "vp-stacked-pr fixture must cover the native gh stack workflow"
require_pattern "$stacked_rebase_fixture" 'stack merge API' \
  "vp-stacked-pr fixture must cover stacked members requiring the stack merge API"
require_pattern "$stacked_rebase_fixture" 'native.*not.*(reconstruction|manual)|not manual reconstruction' \
  "vp-stacked-pr fixture must cover routing GitHub stacks to the native workflow"
require_pattern "$stacked_rebase_fixture" 'three stacked-change situations' \
  "vp-stacked-pr fixture must declare all three situations"
require_pattern "$stacked_rebase_fixture" 'retarget.*PR #202.*PR #203|retarget PR #202 and PR #203' \
  "vp-stacked-pr fixture must retarget every affected child before base-branch deletion"
require_pattern "$stacked_rebase_fixture" 'REST queries paginated to exhaustion' \
  "vp-stacked-pr fixture must exhaust pagination when discovering child PRs"
require_pattern "$stacked_rebase_fixture" 'complete descendant graph' \
  "vp-stacked-pr fixture must inventory deeper descendants"
require_pattern "$stacked_rebase_fixture" 'PR #204 remains based on PR #202' \
  "vp-stacked-pr fixture must distinguish direct children from deeper descendants"
require_pattern "$stacked_rebase_fixture" 'head repository, branch, and tip' \
  "vp-stacked-pr fixture must preserve cross-fork descendant identity"
require_pattern "$stacked_rebase_fixture" 'recorded PR URL' \
  "vp-stacked-pr fixture must address PRs in their recorded repositories"
require_pattern "$stacked_rebase_fixture" 'Stop the merge and branch deletion.*still names' \
  "vp-stacked-pr fixture must stop when retarget readback fails"
require_pattern "$stacked_rebase_fixture" 'Immediately before merge or deletion' \
  "vp-stacked-pr fixture must close the child-discovery race before deletion"
require_pattern "$stacked_rebase_fixture" 'no PR targets `feature/layer-one`' \
  "vp-stacked-pr fixture must require a zero-result final child query"
require_pattern "$stacked_rebase_fixture" 'Discover late PR #205' \
  "vp-stacked-pr fixture must detect a late deeper descendant"
require_pattern "$stacked_rebase_fixture" 'every recorded identity, base, head' \
  "vp-stacked-pr fixture must compare the final descendant graph"
require_pattern "$stacked_rebase_fixture" 'After the squash' \
  "vp-stacked-pr fixture must cover post-squash child repair"
require_pattern "$stacked_rebase_fixture" 'repair every branch in the descendant graph' \
  "vp-stacked-pr fixture must repair all descendant history after retargeting"
require_pattern "$stacked_rebase_fixture" 'PR #202, PR #203, or PR #204' \
  "vp-stacked-pr fixture must verify parent commits leave every descendant"
require_pattern "$stacked_rebase_fixture" 'three-dot diffs' \
  "vp-stacked-pr fixture must verify the repaired child PR diff"
require_pattern "$stacked_rebase_fixture" 'gh api -X PATCH repos/<owner>/<repo>/pulls/<child-pr> -f state=open' \
  "vp-stacked-pr fixture must recover the original PR through REST"
require_pattern "$stacked_rebase_fixture" 'query paginated to exhaustion' \
  "vp-stacked-pr fixture must inventory closed children before recovery"
require_pattern "$stacked_rebase_fixture" 'Delete the recreated branch only after every PR' \
  "vp-stacked-pr fixture must delay recovered base deletion until every affected PR is open"
require_pattern "$stacked_rebase_fixture" 'recorded affected set' \
  "vp-stacked-pr fixture must retain the complete recovery inventory"
require_pattern "$stacked_rebase_fixture" 'open on its expected base' \
  "vp-stacked-pr fixture must verify recovered base metadata before deletion"
require_pattern "$stacked_rebase_fixture" 'all-state query' \
  "vp-stacked-pr fixture must recheck all affected PRs before deletion"
require_pattern "$stacked_rebase_fixture" 're-read by number as open on its expected base' \
  "vp-stacked-pr fixture must re-read each recovered PR before deletion"
require_pattern "$stacked_rebase_fixture" 'do not assume `origin`' \
  "vp-stacked-pr fixture must verify the recovery remote"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'Retarget Before Deleting A GitHub Base Branch' \
  "vp-stacked-pr manual guidance must prevent deletion before retargeting"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'Stop if any affected PR is not open or its `baseRefName` does not match' \
  "vp-stacked-pr manual guidance must block deletion on failed retarget readback"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'Immediately before merging or deleting, repeat the fully' \
  "vp-stacked-pr manual guidance must repeat child discovery at the deletion gate"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'no PR still targets the branch' \
  "vp-stacked-pr manual guidance must block deletion while any child still targets the branch"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'gh api --method GET --paginate repos/<owner>/<repo>/pulls' \
  "vp-stacked-pr manual guidance must paginate child PR discovery"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'complete open descendant graph' \
  "vp-stacked-pr manual guidance must recursively inventory descendants"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'headRepository: .head.repo.full_name' \
  "vp-stacked-pr manual guidance must carry repository identity across forks"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'gh pr edit <child-pr-url>' \
  "vp-stacked-pr manual guidance must mutate the recorded PR repository"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'gh pr view <child-pr-url>' \
  "vp-stacked-pr manual guidance must read back the recorded PR repository"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'repeat the complete graph traversal and tip comparison' \
  "vp-stacked-pr manual guidance must rewalk descendants before rewriting"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'git push <target-remote> <merged-layer-sha>:refs/heads/<deleted-base>' \
  "vp-stacked-pr manual guidance must recreate the missing base at the verified tip"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'Do not assume `origin`' \
  "vp-stacked-pr manual guidance must verify the recovery remote"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'state=all -f base=<deleted-base> -f per_page=100' \
  "vp-stacked-pr manual guidance must inventory affected PRs across all states"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'every PR in the recorded affected set' \
  "vp-stacked-pr manual guidance must recover the complete affected set"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 're-read every PR in the recorded affected set' \
  "vp-stacked-pr manual guidance must verify recovered PRs by number"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'Retargeting changes PR metadata' \
  "vp-stacked-pr manual guidance must distinguish retargeting from history repair"
require_pattern "skills/vp-stacked-pr/references/manual-rebase.md" 'git rebase --onto <new-base> <old-parent-tip>' \
  "vp-stacked-pr manual guidance must provide post-merge child repair"

require_pattern "$recording_fixture" 'window id, never a screen rectangle|screencapture -l' \
  "vp-recording fixture must cover window-scoped capture over rectangle capture"
require_pattern "$recording_fixture" 'samples on change|change-sampled' \
  "vp-recording fixture must cover change-sampled capture not being a demo recorder"
require_pattern "$recording_fixture" 'injected pointer follow' \
  "vp-recording fixture must cover the pointer following real mouse events"
require_pattern "$recording_fixture" 'live geometry' \
  "vp-recording fixture must cover resolving targets from live geometry"
require_pattern "$recording_fixture" 'three independent layers|independently routed layers' \
  "vp-recording fixture must route cursor, keycast, and subtitles independently"
require_pattern "$recording_fixture" 'keycast reports input while subtitles explain' \
  "vp-recording fixture must distinguish keycast from subtitles"
require_pattern "$recording_fixture" 'sensitive input is.*suppressed before' \
  "vp-recording fixture must suppress sensitive input before overlay logging"
require_pattern "$recording_fixture" 'verified by looking at frames|contact sheet' \
  "vp-recording fixture must cover verifying output before delivery"
require_pattern "$recording_fixture" 'still image of a running UI has a producer' \
  "vp-recording fixture must route a still image to a producer"
require_pattern "$recording_fixture" 'application- and process-id targeting' \
  "vp-recording fixture must cover application- and process-id targeted capture"
require_pattern "$recording_fixture" 'never by extracting a session token from another browser' \
  "vp-recording fixture must reject extracting a session token for an authenticated capture"
require_pattern "$recording_fixture" 'isolated profile that is deleted' \
  "vp-recording fixture must dispose of the profile it creates for a login"
require_pattern "$recording_fixture" 'confirmed before upload' \
  "vp-recording fixture must confirm image contents before upload"
require_pattern "$recording_fixture" 'no documented deletion path' \
  "vp-recording fixture must state that attachment upload is not reliably reversible"
require_pattern "$recording_fixture" 'textual assertion from the same page state' \
  "vp-recording fixture must pair a still with a textual assertion"
require_frontmatter_pattern "$recording_skill" 'still (screenshot|image)' \
  "vp-recording frontmatter description must include still images"
require_frontmatter_pattern "$recording_skill" 'screenshots?' \
  "vp-recording frontmatter description must route screenshot requests"
refute_frontmatter_pattern "$recording_skill" 'rather than a screenshot' \
  "vp-recording frontmatter must not exclude screenshots from routing"
require_frontmatter_pattern "$recording_skill" 'vp-minimal-repro' \
  "vp-recording frontmatter must keep re-runnable reproductions with vp-minimal-repro"
# The display requirement for an authenticated still is stated in three places
# that a router may read independently; none of them may promise unconditionally.
require_frontmatter_pattern "$recording_skill" 'a still behind a login needs a display' \
  "vp-recording frontmatter must not promise a displayless authenticated still"
if grep -Fq 'run on any platform and inside a container.' "$recording_skill"; then
  fail "vp-recording environment summary must qualify the container guarantee"
fi
require_pattern "$recording_still_capture" 'window id names one window|Only a window id' \
  "vp-recording still capture must require window-id targeting"
require_pattern "$recording_still_capture" 'Application name, or process id' \
  "vp-recording still capture must enumerate application and process-id targeting"
require_pattern "$recording_still_capture" 'no documented deletion path' \
  "vp-recording still capture must state that attachment upload is not reliably reversible"
require_pattern "$recording_still_capture" 'Delete the profile directory' \
  "vp-recording still capture must dispose of the login profile"
require_pattern "$recording_still_capture" 'Close the context' \
  "vp-recording still capture must close the browser before deleting the profile"
require_pattern "$recording_fixture" 'no browser path to fall back on' \
  "vp-recording fixture must force window-id targeting where no browser path exists"
require_pattern "$recording_fixture" "output scale is checked against the window's point size" \
  "vp-recording fixture must check a capture tool's output scale"
require_pattern "$recording_fixture" 'four capture requests' \
  "vp-recording fixture prompt must declare every situation it contains"
if [ "$(grep -c '^\*\*Situation ' "$recording_fixture")" -ne 4 ]; then
  fail "vp-recording fixture must contain exactly the four situations its prompt declares"
fi
require_pattern "$recording_still_capture" 'filters on the owning application.s name, not the window title' \
  "vp-recording still capture must not pass a window title to the owner-name filter"
require_pattern "$recording_still_capture" 'switch a running context to headless' \
  "vp-recording still capture must not promise headless capture after an interactive sign-in"
require_pattern "$recording_still_capture" 'Two nested .finally. blocks' \
  "vp-recording still capture must remove the profile even when the context close fails"
require_pattern "$recording_still_capture" 'Wait for the state you are claiming, not for load' \
  "vp-recording still capture must wait for the claimed UI state before screenshotting"
require_pattern "$recording_still_capture" 'accessibility tree' \
  "vp-recording still capture must give the native path a textual assertion"
require_pattern "$recording_still_capture" 'the display has to remain available through the capture' \
  "vp-recording still capture must keep the display available past the sign-in"
require_pattern "$recording_still_capture" 'Closing first and planning to fall back does not work' \
  "vp-recording still capture must not offer a fallback to an already-closed context"
for recording_overlay_reference in cursor-and-clicks keycast subtitles; do
  require_pattern "$recording_skill" "references/$recording_overlay_reference.md" \
    "vp-recording must route to the $recording_overlay_reference reference"
done
require_pattern "skills/vp-recording/references/keycast.md" 'Suppress the entire event before it' \
  "vp-recording keycast guidance must suppress sensitive input before logging"
require_pattern "skills/vp-recording/references/subtitles.md" 'keycast says what input occurred.*subtitle says' \
  "vp-recording subtitle guidance must distinguish explanation from input"
# AGENTS.md keeps required routing in the frontmatter or main workflow, so a
# handoff that only appears under Related skills does not establish routing.
if ! awk '/^## Related skills$/{exit} {print}' "$recording_skill" \
  | grep -Fq 'vp-agent-browser-session'; then
  fail "vp-recording must state the managed-profile handoff outside Related skills"
fi

require_pattern "$github_fixture" 'referenced private-repository asset returned' \
  "vp-github fixture must preserve the measured private attachment boundary"
require_pattern "$github_fixture" '404 anonymously and 200 with a repository-readable token' \
  "vp-github fixture must preserve the measured private attachment result"
require_pattern "$github_fixture" 'public-repository asset returned 200 anonymously' \
  "vp-github fixture must preserve the measured public attachment boundary"
require_pattern "$github_fixture" 'v2\.99\.0.*--attach|--attach.*v2\.99\.0' \
  "vp-github fixture must prefer the supported GitHub CLI attachment path"
require_pattern "$github_fixture" 'partial upload failure.*read.*back|read.*back.*partial upload failure' \
  "vp-github fixture must cover partial-write readback before retry"
if grep -Fq -- '-H "Authorization: Bearer $(gh auth token)"' \
  skills/vp-github/references/attachments.md; then
  fail "vp-github must not expose gh auth token in curl process arguments"
fi
require_pattern "$github_fixture" 'eight media content types|not promised on a token' \
  "vp-github fixture must cover the media-only token whitelist"
require_pattern "$github_fixture" 'x-fetch-nonce' \
  "vp-github fixture must cover the verified-fetch nonce gate"
require_pattern "$github_fixture" 'release asset or repo blob' \
  "vp-github fixture must cover the unattended release-asset fallback"
require_pattern "$github_fixture" 'survives GitHub.s sanitizer only when' \
  "vp-github fixture must cover inline video requiring a user-attachments source"
if ! awk '/^## Related skills$/{exit} {print}' skills/vp-github/SKILL.md \
  | grep -Eiq 'use proactively.*writing or editing GitHub'; then
  fail "vp-github must advertise proactive invocation for material local evidence before Related skills"
fi
require_pattern skills/vp-github/references/attachments.md 'README or discussion.*Standalone legacy upload' \
  "vp-github must retain a standalone media path for README and discussion targets"
require_pattern skills/vp-github/references/attachments.md 'curl --config -' \
  "vp-github must retain an executable secure legacy upload fallback"

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
