# Delivery Brief

The delivery brief is written before the first edit and kept current through
release. It records what the later phases act on, so that a gate is evaluated
from evidence that was read, not from an assumption carried over from another
repository or an earlier task. Every row is filled from the repository itself:
its instructions, protection settings, code-owner files, workflow files, and
documented procedures.

Policy overlays add rows; they do not remove or blank any row below.

## Rows

| Row | What to record | Evidence source |
|-----|----------------|-----------------|
| Acceptance criteria | The observable outcomes that show the change is done, and what remains out of scope | Issue disposition, user request, validate phase |
| Base branch | The branch the unit targets, and the branch the repository releases from when they differ | Repository instructions, default branch, documented branch model |
| Review and integration gating | Branch protection and rulesets; code owners for the touched paths; review automation, what it accepts, and its documented re-trigger; protected paths; size or per-unit caps | Protection settings, code-owner files, workflow files, repository instructions |
| Deploy triggers for the touched paths | Which workflows deploy, what event triggers them, and whether their path filters cover the touched paths | Workflow files on the base branch |
| Release mechanism and ownership | The cells from [release-ownership.md](release-ownership.md): who owns integration, how the repository releases, where the release conditions are evaluated, and the terminal state | Protection settings, contribution rules, release procedures, deploy workflows |
| Delivery units | The decision from [delivery-units.md](delivery-units.md): one unit or an ordered sequence, one row per unit with its review route and dependencies, and the reason | Design phase, repository caps and routing rules |
| Open questions | Each question that could change a later decision, and the phase it is deferred to | Any phase |

A row that cannot be filled from evidence is an open question. An open
question that affects the design stops the work before design; one that
affects only a later phase is recorded with that phase and answered there,
after the independent work is done.

## Cross-repository work

When the change spans repositories, the brief has one section per repository,
each filled from that repository, plus the orchestration plan and readiness
check from [cross-repository.md](cross-repository.md).
