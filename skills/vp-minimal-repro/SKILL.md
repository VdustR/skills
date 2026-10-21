---
name: vp-minimal-repro
description: >-
  Isolate an observed failure or uncertain external-system behavior in a small,
  re-runnable check. Use before implementation when an uncertain technical
  premise affects the design, before repeating a full-system or end-to-end run to
  confirm the same library, service, runtime, OS, or device behavior, or when
  preparing a standalone reproduction to share. Preserve verified observations
  and their reuse conditions. Boundary: establishes a bounded behavior or
  failure; not a substitute for integration acceptance or a report-filing workflow.
---

# Minimal Reproduction

Answer one uncertain behavior with the smallest check that still reaches the
real boundary. For a failure, produce a re-runnable reproduction, preferably
with an exit code. For external behavior, verify the specific event, response,
or effect before using it as a premise for application tests. A failure is not
required to investigate an unknown behavior.

## Define the question and scope

Before choosing a check, state:

- The unknown behavior and which implementation decision depends on the answer.
- The real interface under test, necessary environment and preconditions, and
  what the check deliberately leaves out.
- The observable result that distinguishes the plausible answers, and the
  conclusions it can and cannot support.
- When to stop: an answer sufficient for that decision, an inconclusive result
  needing a specific additional control, or a missing permission or environment
  that blocks the observation.

Inspect applicable evidence before creating a new probe. Skip a separate
experiment when existing evidence resolves the material unknown or the change
has no such unknown. Do not build a complete feature or change architecture
merely to discover a dependency's behavior. See
[references/external-behavior.md](references/external-behavior.md) for evidence
handling and the distinction between failure reproduction and technical
exploration.

## Before another full-system run

State the exact question and inspect existing evidence first. If its environment
and relevant code still match, reuse the recorded observation within its stated
limits. Otherwise, isolate the missing fact at the real boundary; a mock or
synthetic event cannot establish what the external system actually does.

For external behavior, read
[references/external-behavior.md](references/external-behavior.md) for choosing
the check, retaining evidence, and deciding when it needs to run again. Record
reusable findings in the repository's existing documentation or evidence location,
with a link from the relevant test or acceptance plan. Recommend that location
when writing it is outside the authorized scope. Session history alone should
not be the only way to recover a premise.

Use the resulting facts to test application logic cheaply. Keep integration,
physical-device, or human acceptance for claims the isolated check cannot prove.
Before repeating an end-to-end run, name the unresolved interaction or changed
condition it will test. Follow required repository checks; do not remove or skip
mandated acceptance merely because a smaller check passes.

## Two levels

For observed failures, choose between these two levels. An unknown-behavior
probe may establish normal behavior and does not need to fail.

A **working reproduction** exists to find the problem and to test a candidate
fix. It only has to fail reliably, run fast, and be honest about what has
actually been verified. It stays where the work is and is disposable. See
`references/working-repro.md`.

A **demonstration reproduction** is an artifact built for a reader who has none
of this context. It shows the mechanism, the fix when there is one, and nothing
else, and it is designed to make that mechanism obvious rather than to recreate
the original symptom. See `references/demonstration-repro.md`.

Choose from the situation rather than from a fixed rule. While the cause or the
fix is still unknown, the answer is a working reproduction. Escalate when there
is a reason for a stranger to run it, typically an instruction to prepare a
demo or a shared artifact. If a working reproduction is about to be shared as
is, say that it can be upgraded first and what that would add.

## Evidence requirements

Execute the check when authorized and feasible. A failure reproduction must
actually fail; reasoning alone is not a run. Once a candidate fix exists, also
watch it pass with the fix applied and fail again once the fix is reverted
safely in the reproduction. That sequence is required before claiming a cause,
not before reporting an observation. A successful external-behavior check does
not need an artificial failure or a change to the external system.

When the decisive observation needs human perception, physical access, or
additional authority, finish the safe preparation and give the smallest manual
procedure with the expected observation. Keep that claim unverified until the
observation is supplied. A machine-readable proxy proves only what it measures.

Separate what was observed from what explains it. State plainly which parts are
verified by a run and which are inference, and never let an explanation inherit
the confidence of the observation it explains. When something comes from
documentation, a changelog, or an issue tracker, keep the source with it; a
demonstration reproduction carries those references into the artifact.

De-identify before a reproduction leaves the machine, and treat what survives
de-identification as a measure of whether it is minimal. See
`references/de-identification.md`.

Report where a kept reproduction lives, along with anything it installed or
started, so it is not left behind silently.

## Related skills

- [`vp-issue-investigator`](https://github.com/VdustR/skills/tree/main/skills/vp-issue-investigator)
  when the reproduction should support a problem report.
- [`vp-autodev`](https://github.com/VdustR/skills/tree/main/skills/vp-autodev)
  when the reproduced failure should proceed through a fix and PR delivery.
- [`vp-long-running-processes`](https://github.com/VdustR/skills/tree/main/skills/vp-long-running-processes)
  for processes the reproduction must keep running.
- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) when the
  reproduction or fix should be committed.
- [`vp-session-wrapup`](https://github.com/VdustR/skills/tree/main/skills/vp-session-wrapup)
  for reporting or cleaning up reproduction artifacts.
