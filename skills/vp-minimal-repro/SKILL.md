---
name: vp-minimal-repro
description: >-
  Reduce an observed failure to a small reproduction that fails on demand and
  passes once the cause is removed. Use when a failure has been seen and the
  next step would otherwise be to drive the whole system again to watch it, or
  when a reproduction has to be rebuilt standalone to demonstrate or share it.
  Applies at any layer, including build tools, libraries, services, runtimes,
  and version-specific behavior. Boundary: starts from an observed failure and
  ends at a re-runnable reproduction; not for filing the report or deciding
  where it goes.
---

# Minimal Reproduction

Turn an observed failure into something that can be run again and answers with
an exit code. Driving the whole system to watch a symptom is slow, hard to
repeat, and produces evidence nobody can re-run.

## Two levels

A **working reproduction** exists to find the problem and to test a candidate
fix. It only has to be deterministic, fast, and honest about which direction it
fails in. It stays where the work is and is disposable. See
`references/working-repro.md`.

A **demonstration reproduction** is an artifact built for a reader who has none
of this context. It shows the mechanism and the fix and nothing else, and it is
designed to make that mechanism obvious rather than to recreate the original
symptom. See `references/demonstration-repro.md`.

Choose from the situation rather than from a fixed rule. While the cause or the
fix is still unknown, the answer is a working reproduction. Escalate when there
is a reason for a stranger to run it, typically an instruction to prepare a
demo or a shared artifact. If a working reproduction is about to be shared as
is, say that it can be upgraded first and what that would add.

## Requirements at both levels

Verify the reproduction yourself. Watch it fail, watch it pass after the cause
is removed, and watch it fail again once that change is reverted. Reporting a
reproduction that has not been run in both directions is reporting a guess.

Separate what was observed from what explains it. State plainly which parts are
verified by a run and which are inference, and never let an explanation inherit
the confidence of the observation it explains. When something comes from
documentation, a changelog, or an issue tracker, keep the source with it; a
demonstration reproduction carries those references into the artifact.

De-identify before a reproduction leaves the machine, and treat what survives
de-identification as a measure of whether it is minimal. See
`references/de-identification.md`.
