---
name: vp-autodev
description: >-
  Take a valid issue or development task through named delivery phases:
  validate, research, design, plan delivery units, implement, verify, publish
  for review, observe feedback, reconcile, integrate, and release. Use for
  end-to-end development in repositories the user owns or is authorized to
  change. Boundary: use a narrower dependency, reproduction, checklist, or PR
  skill when the request covers only that step. The terminal state follows the
  repository's integration ownership and release mechanism: merge plus required
  release follow-up when the user owns integration, the repository's rules
  permit it, and the change is low risk and fully verified; a Ready PR with
  reviewers requested when another team or upstream owns integration. Policy
  overlays attach gates by phase name. It does not authorize unrelated fixes or
  writes outside that workflow.
---

# Auto Development

Take an owned-repository issue or development task through the authorized
delivery lifecycle. Follow repository instructions and the user's preferred
language, framework, Git, GitHub, review, and release skills.

An explicit auto-development request authorizes these in-scope operations:
branch creation, commit, push, Draft PR creation, the Draft-to-Ready transition,
merge, and required release follow-up as one delivery workflow. Proceed without
repeated authorization when ownership is clear, repository policy permits the
action, required evidence applies to the current head, verification is
complete, feedback is handled, and remaining risk is low. Ask only when a
safety gate in this workflow requires a human decision.

## Phases

The workflow is a sequence of named phases. Refer to a phase by its name, never
by a position; names stay stable when phases are added or reordered.

| Phase | Outcome |
|-------|---------|
| validate | A current issue disposition and acceptance criteria |
| research | Validated technical premises for the next design decision |
| design | A reviewed solution with recorded alternatives |
| plan delivery units | A recorded decision on how the change ships |
| implement | The smallest coherent change on a working branch, committed and pushed once verify passes |
| verify | Evidence that the change repairs the behavior and preserves the rest |
| publish for review | A self-contained PR, Draft until its gates pass, then Ready |
| observe feedback | Every repository-defined signal read against the current head |
| reconcile | A complete final snapshot after the last mutation |
| integrate | The change merged, or the bounded terminal state this repository allows |
| release | The published result verified, or a recorded reason no release is needed |

Keep evidence for each decision from validate through release.

### Validate

Start from a current issue disposition and acceptance criteria. Use
`vp-issue-investigator` first when the problem is still suspected, stale, or
unverified. Propose or make external corrections only when authorized.

### Research

Research the problem and the technical premises needed for the next design
decision. Before implementation or an expensive validation run, use
`vp-minimal-repro` when uncertain library, API, service, runtime, OS, or
device behavior could change that decision, even without a known failure.
Reuse applicable evidence first; otherwise run the smallest authorized check
at the real interface. State the question, relevant conditions, observable
result, and what it can and cannot establish. For a known failure, verify it
at the strongest practical level and distinguish observation from cause.
Do not add an experiment to a clear, low-risk change with no material unknown.
Before choosing a failure fix, trace the relevant producer, caller, lifecycle,
and ownership boundaries, including cleanup and reporting. Separate the
symptom, supported causes, and mitigation; use discriminating evidence rather
than assuming one root cause. Issue confirmation does not require a known
cause. Urgent, authorized mitigation may precede complete diagnosis; retain
evidence and report what remains unresolved.

### Design

Design a focused solution and review the design before coding. Check that it
addresses the problem using validated premises, fits repository conventions,
and avoids foreseeable regressions. Record material alternatives, trade-offs,
and the reason for the selected approach.
Check whether the proposal repairs behavior or only hides its symptom, and
preserve unrelated failure propagation and reporting. For cancellation or
error-filtering changes, read
[references/failure-diagnosis.md](references/failure-diagnosis.md) before
choosing the handling boundary or classification rule.

### Plan delivery units

Decide how the change ships before the first edit: as one unit or as an
ordered sequence of units. Neither is the default. Split when units are
independently deployable and valuable, when review routing differs between
parts, or when the repository documents a size or review cap. Do not split
when the parts only make sense merged together within minutes, when splitting
would require compatibility layers or flags invented solely to pass a size
gate, when a reviewer must judge the whole design at once, or when each merge
triggers a costly deploy or release in that repository. The reasons, the
invariants, and the record format are in
[references/delivery-units.md](references/delivery-units.md).

Whatever the decision: every unit stands alone on the base branch; files are
never renamed, moved, or restructured to escape a review control; a sequence
with dependent units goes through `vp-stacked-pr`; and the decision and its
reason are recorded before the first edit.

Start the delivery brief in validate and complete it in this phase, the last
phase before the first edit.

Before the first edit, evaluate the confirmation checklist in
[references/delivery-brief.md](references/delivery-brief.md). Check for
unconfirmed matters, missing necessary communication or decisions, and blockers.
Proceed only when every matter is resolved or confirmed non-blocking and safe
to defer under the brief's follow-up rules: create and link a tracking issue
by default, or explicitly retain a bounded session TODO that blocks bye.
An unrecorded promise of later follow-up does not pass this gate. Preserve this
checkpoint as the baseline for the pre-integration comparison.

### Implement

Create the working branch when needed and implement the smallest coherent
change. Preserve unrelated user work and avoid opportunistic fixes. Commit
and push the verified change as part of the delivery workflow.

### Verify

Verify the change against the reproduction or established premises and
relevant tests, checks, builds, or real behavior. Before repeating an
expensive or end-to-end run, name the new question, changed condition, or
invalidated evidence; use `vp-minimal-repro` to isolate an uncertain premise
rather than rebuild the feature to rediscover it. Reuse observations while
their versions, environment, relevant code, and conditions still apply.
Preserve required repository checks and integration, physical-device, or
human acceptance for claims the isolated check cannot establish. Compare
before and after evidence where applicable and retain unverified cases.
Exercise the repaired path and nearby failures that must still propagate or
report. Verify cleanup, completion state, retry behavior, and observability
affected by the change. An error or alert disappearing alone does not prove
repair; distinguish verified recovery from mitigation and unresolved causes.

### Publish for review

Create a Draft PR as part of the requested delivery workflow. Follow
`vp-git`'s `references/pull-requests.md` for a self-contained description,
design reasoning, clear writing, and supporting issue-artifact links. Review the
full diff, commits, and PR text as a maintainer before requesting human or
automated review. Keep it Draft while material design, verification, or
feedback remains unresolved; otherwise complete the Draft-to-Ready
transition. Treat Ready as a new mutation that may trigger review automation,
not as evidence that the pre-Ready feedback snapshot remains final.
When local screenshots, recordings, diagrams, or other files materially show
the result, route their publication in the PR through `vp-github` even if the
development request did not separately say to upload them.

### Observe feedback

Record the current head commit, then monitor all repository-defined signals:
CI, check runs, bot comments, pull request review comments (inline code
comments), issue comments in the PR conversation, and reaction
emoji on the main post or comments. Treat a changed emoji as new state, using
that repository's convention instead of a universal mapping. Re-check that a
positive signal applies to the current head. When the last review or
feedback signal arrives while checks are still pending, classify each
pending check as blocking or informational under the integrate phase before
deciding to wait; an informational check is no reason to wait. Before
ending a turn to wait for a blocking check,
name the event that will resume the work. A host PR monitor may wake the
session only for failures, conflicts, or new comments, so
a check that passes emits nothing. Host rules that forbid self-polling stay
binding. When no event covers the success path, do not end
the turn as if the work will continue. Pick the resume mechanism in this
order, record it in the brief, and name it before ending the turn:

1. A host event that fires on the awaited transition. A host-tracked goal
   whose completion conditions are the terminal state from the brief counts
   as one, because the host keeps the session on it until they are met; set
   it when the host offers one and its usage conditions permit.
2. A host-provided self-wake that the host permits for external work it
   cannot track: a scheduled wake-up, or a background wait that notifies
   once when the condition holds. Match its delay or interval to the check's
   usual duration in that repository, never a tight poll, and bound it by
   the user's budget. A self-wake the user directed, including a loop the
   user invoked, is permitted by that direction. When the host grants it
   only through a command or switch the user must issue themselves, that
   command was requested up front under the delivery brief; do not infer
   it from the auto-development request.
3. A bounded wait within the turn, where host rules permit it.

On resume, re-read the head and every signal before acting; a wait that
expires without the event is a missing gate to report, not a pass. When the
integrate phase authorizes the merge and every blocking signal still pending
on the current head is a branch-protection required check, also enable the
platform's auto-merge, through the host's PR tool when it offers one, and
name it as the resume event for the merge itself; the phases after integrate
still need a wake from the list above. Every other blocking signal must
already be final and passing on that head: review markers for that SHA,
every non-required check the repository treats as blocking, and no
unresolved thread. When that condition does not hold and no wake is
permitted, tell the user that nothing will resume the merge and which reply
from them resumes it. After enabling auto-merge, keep the failure and
comment monitor on. A real finding, a failed check, or a new
push reopens the merge decision: disable auto-merge before handling it,
because a push from someone with write access does not cancel it.

Route both GitHub feedback surfaces through `vp-pr-comment-resolver`. Require
a complete, independently paginated snapshot of PR conversation issue
comments and review threads with all inline comments and replies; a partial
read cannot establish that feedback is handled. Then repeat verification and
monitoring. When all pre-Ready gates pass, complete the Draft-to-Ready transition
described under publish for review.

After Ready, perform the passive automated-review observation described in
`references/automated-review-observation.md`. Invoking Codex or another
automated reviewer is not a default step in this workflow. Invoke one when
the user or a repository procedure explicitly asks for that action; an
installed integration, historical bot activity, or a documented trigger
command does not make invocation automatic; the one exception is the
documented re-trigger of a gating verdict described under Terminal state. Do not wait for an automated
reviewer that has not started, and do not make a missing terminal signal a
standalone merge blocker. For a repository-defined optional review that was
requested or started, make a reasonable repository-supported retrigger
attempt before temporarily proceeding without it. Repeated failures,
exhausted quota, or excessive delay may justify proceeding when required
evidence is otherwise complete. Use about one hour as a default reference
for unattended work, not a fixed deadline; adapt the retry and observation
window to repository conventions, progress, risk, and cost. Record the
evidence and rationale. Route every actionable item that actually appears
through `vp-pr-comment-resolver`. A repository-required review cannot be
degraded for failure, quota, or delay; keep it blocked until recovery and
completion, or until the user explicitly directs the next action.

### Reconcile

After the last mutation, including Ready, a PR description edit, a reply,
fix, push, or thread resolution, reconcile again. When the repository
reruns workflows on description edits, finish description edits before the
final push so they do not cancel or restart its checks. Record the current
head; re-read current-head CI and checks, applying the wait rule of the
observe feedback phase to any still pending; completely re-fetch PR conversation issue
comments, submitted reviews, review threads and their nested replies, and
reaction surfaces used by feedback that exists. A mutation invalidates the
prior final snapshot. Report an automated reviewer that did not run as
unobserved. Do not convert an optional reviewer into an indefinite wait
loop; apply the documented retry and degradation judgment when that review
was requested.

### Integrate

Immediately before merging or enabling auto-merge, re-evaluate the same
confirmation checklist against the current head and final feedback snapshot.
No blocker, unconfirmed matter, or missing necessary communication or decision
may remain. Reconfirm each deferral and its follow-up obligation; a record alone
does not make a blocker safe. Compare with the preserved pre-implementation baseline
and use `vp-retro` for differences as specified in the delivery brief before
proceeding. Apply this gate before the Ready handoff too when another party
owns integration.

Act on the integration owner and release mechanism recorded in the delivery
brief, classified under
[references/release-ownership.md](references/release-ownership.md). When the
user owns integration, merge when repository policy permits it, required
evidence is green, feedback is handled, the change is fully verified, and the
remaining risk is low. Treat the request to auto develop the change as
authorization for this in-scope merge. Ask before merging when ownership is
unclear, policy requires a human decision, risk is material, verification is
incomplete, or the merge would expand scope. When a merge itself deploys to
production for the touched paths, the merge is the release: evaluate the
release conditions before it, and read the deploy workflows' triggers and
path filters rather than assuming. When another team or an upstream
maintainer owns integration, the terminal state is a Ready PR with reviewers
requested and feedback handled, never a merge.
CI is green only when the checks the repository runs on the current head
have finished and passed. A pending check is not passing evidence, and
branch protection's required checks are a floor, not the whole gate: a
repository without required checks still expects its CI to finish. Decide
whether a particular pending or failing check blocks the merge from
repository convention, such as a check documented as informational or an
optional job that earlier merges did not wait for, and record that reason.
GitHub auto-merge waits only for branch-protection requirements and merges
at once when there are none, so it cannot hold a merge for any other check;
the observe feedback phase enables it only when those requirements are all
that remain.
If a blocking check runs well past its usual duration in that repository,
rerun it once through the repository's mechanism; if it still does not
finish, report it as the missing gate instead of merging.
A unit whose correctness depends on merge order relative to other open PRs,
such as sequentially numbered migrations or versioned artifacts, re-checks
that order against the base branch and the other open PRs immediately before
merging, and never merges around a conflict: an order conflict is fixed in
the unit, or the merge waits, and is reported either way.

### Release

After merge, act on the release mechanism recorded in the delivery brief.
Under the same ownership, policy, verification, and low-risk conditions, run
the in-scope release workflow and verify the published result. Ask before a
release with material operational impact, ambiguous versioning or release
policy, incomplete verification, or scope beyond the requested change. These
conditions apply whatever the mechanism; the classification only decides
where they are evaluated. For a merge that deploys, they were evaluated
before the merge, and the release is complete only when the deploy workflow
finished and the result is verified. For a shared batch, the change is done
when merged to base and on the batch; releasing the batch is a separate
decision that needs the other contributors' acknowledgement unless repository
policy says otherwise. For a versioned release step, that step is the release
decision. When another party releases, report the merged state and name the
release owner. Otherwise, record why no release is needed.

## Delivery brief

Before the first edit, record the delivery brief described in
[references/delivery-brief.md](references/delivery-brief.md): acceptance
criteria; base branch; how review and integration are gated in this
repository (branch protection, code owners, review automation and its
documented re-trigger, protected paths, size caps); deploy triggers for the
touched paths; release mechanism and integration ownership; the
delivery-unit decision; host prerequisites; and the confirmation checklist
shared by the pre-implementation and pre-integration gates. Fill every row from
the repository's own evidence. Later phases act on the brief, and policy
overlays add rows to it.

Host prerequisites are the mechanisms this run will need that the host
grants only through the user's own command or switch: a loop or scheduled
wake-up command, a goal the host tracks when creating it needs the user's
request, a monitor or auto-merge switch, a permission. An auto-development
request does not stand in for them. Identify them before
the first edit from the host's rules and the terminal state, and ask the
user for them once, in one message with any other up-front decision, so the
run does not stall at a later phase. A prerequisite the user declines turns
the phase that needs it into a stop that names the reply which resumes it.

## Cross-repository delivery

When the change spans repositories or depends on a change elsewhere, follow
[references/cross-repository.md](references/cross-repository.md). Each
repository is delivered under its own rules, read from that repository and
never carried over; the brief for each leg names those rule files and says
they override anything assumed. The orchestrating session fills each repository's
brief section and writes an orchestration plan before any leg starts: execution order
in dependency terms, the risk of each leg failing or shipping alone, a
concrete and already-available rollback per leg, and the verification that
gates the next leg. A leg without a rollback, whose rollback leaves another leg
broken, or with material risk goes to the user before anything starts, and a
leg that cannot be rolled back runs last.
Each other repository is delivered in its own session or delegate, started
only after the readiness check for that leg passes, run when that leg is about
to start. Producer legs start
before consumer legs; a delegate's report is a claim to verify against the
plan; a leg that fails verification stops the run and executes its rollback
if anything shipped.

## Terminal state

Successful completion reaches the terminal state the delivery brief derives
from integration ownership and release mechanism: merge plus required release
follow-up when the user owns integration, or a Ready PR with reviewers
requested and feedback handled when another team or upstream owns it. Local
changes, a Draft PR, or a Ready PR are not successful terminal states when the
documented low-risk conditions permit further progress. When a safety gate
prevents progress, report the bounded terminal state and the exact missing
decision or evidence.

Do not treat CI success as proof that the issue is fixed. Do not treat silence
from a bot as a completed review, but do not wait for or summon the bot solely
to turn that silence into a signal. This has one carve-out: when repository
policy makes an automated reviewer's verdict an integration gate and documents
how to re-trigger it, re-triggering after adding the evidence the verdict
asked for is part of delivery, not a request for a new review. Record the
verdict, the evidence added, and the re-trigger in the delivery brief.

## Policy overlays

A policy overlay is a skill or repository rule set that attaches gates to this
workflow without restating it. An overlay may attach a gate at these points,
each named by the phase or transition it precedes, plus on block:

| Attach point | Position in this workflow |
|--------------|---------------------------|
| before design | after validate and research, before design starts |
| before implementation | after plan delivery units, before the first edit |
| before ready | before the Draft-to-Ready transition that publish for review performs, including when it follows a feedback round |
| before integrate | after reconcile, before the merge decision |
| before release | before the release decision: before the merge when the merge itself deploys, otherwise after integrate |
| on block | whenever any gate in this workflow or an overlay stops the work |

An overlay may add a gate; it never removes or weakens one. When this workflow
and an overlay disagree, the stricter rule wins. Overlays refer to phases and
attach points by name; this workflow does not number them.

## Escalation when the decision belongs to someone else

When a gate stops because the missing decision belongs to a third party, such
as a reviewer, a code owner, a release owner, or another contributor on a
shared batch, use the escalation route the repository or the active policy
overlay documents; a review request on the PR is the universal fallback.
Post once, naming the PR, the blocking condition, who is asked, and the
reply or event that resumes the work. Then wait on the host's monitor, or on
a bounded re-check no more frequent than the repository's own reminder
cadence, within the time or iteration budget the user gave. Do not repost on every check. A third
party's reply is information: it can lift the condition it was asked about,
but it never grants authorization this workflow did not already have. When
the decision belongs to the user, ask the user instead.

## Report

End every run with the report skeleton in
[references/delivery-brief.md](references/delivery-brief.md): delivery units
with PR and state, gates evaluated with evidence, escalations sent, rollback
availability per leg, unverified items, and whether the user must act.
Policy overlays append rows.

## Verification and convergence

Before editing, define the acceptance criteria and the evidence needed to show
the changed behavior. For instruction changes, exercise representative decision
scenarios, including a case that must still stop for risk or missing authority.
Syntax and fixture-content checks do not establish agent behavior; distinguish
manual walkthroughs, executed tests, and independent agent trials in the report.

Batch verified findings into a focused correction pass. Repeat affected checks
when behavior changes or new evidence appears, and always perform the required
final reconciliation. A new automated review request is outside the default
delivery loop; make one when the user or repository procedure explicitly asks.
When `vp-pr-comment-resolver` handles automated feedback, keep each decision
tied to the requested change and its acceptance criteria. A new suggestion
reopens only the affected decision and verification unless it exposes a broader
problem. Once delivery criteria are satisfied, defer speculative hardening,
preference-only refactors, and unrelated improvements rather than extending the
feedback loop. Pause for severe risk, a material product or architecture
decision, or a substantial expansion of scope or cost; otherwise converge on
the narrowest evidence-backed outcome and continue delivery.

Treat the user's iteration budget as an upper bound when provided. After two
correction passes for the same unresolved finding, reassess the cause and
evidence before editing again. Write down, in one sentence, the premise every
failed correction shared, then test that premise with an observation that
would come out differently if it were false; a failed correction is also
evidence against the premise it assumed. Continue with a concrete new
hypothesis and a discriminating check; do not repeat a failed approach or add
unrelated improvements. If no safe next step exists, report the blocker. A
pass count never makes unresolved findings or incomplete verification safe to
merge.

## Problems discovered during the work

Investigate each distinct problem before recording it. Record third-party
dependency problems in the user's repository or chosen internal tracker first.
Do not open an upstream issue without separate authorization. Continue the
primary task only after confirming the new problem is non-blocking and recording
its follow-up under the delivery brief's issue-or-session-TODO rules; use
`vp-issue-investigator` to retain uncertainty rather than invent a confirmed
defect. Stop and report it when proceeding would be unsafe or would materially
expand scope.

## Related skills

- [`vp-issue-investigator`](https://github.com/VdustR/skills/tree/main/skills/vp-issue-investigator)
  for validating and recording a distinct problem found during development
  (validate phase).
- [`vp-minimal-repro`](https://github.com/VdustR/skills/tree/main/skills/vp-minimal-repro)
  for isolating a failure or validating an uncertain technical premise in the
  research and verify phases.
- [`vp-retro`](https://github.com/VdustR/skills/tree/main/skills/vp-retro)
  when confirmation checkpoints differ and the discovery or decision needs review.
- [`vp-session-wrapup`](https://github.com/VdustR/skills/tree/main/skills/vp-session-wrapup)
  for discharging explicit session TODOs and deciding whether the session can bye.
- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  for author-side feedback resolution in the observe feedback phase.
