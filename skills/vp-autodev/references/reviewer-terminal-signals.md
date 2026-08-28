# Reviewer Terminal Signals

Use this gate after a pull request moves from Draft to Ready or after another
mutation triggers a configured reviewer. Repository configuration is the source
of truth for which reviewers run and how they signal completion.

## Observation Record

Record the pull request, Ready or review-request trigger time, current head,
configured reviewers, repository-documented terminal signals, bounded wait
policy, retrieval times, and pagination completion. Silence is not completion.
Do not infer a terminal signal from evidence that cannot be attributed to this
trigger and head.

## Signal Matrix

| Reviewer state | Evidence | Result |
| --- | --- | --- |
| Finding | An attributable authored review, review thread, or bot reply with actionable content or documented terminal semantics | Route all actionable feedback through `vp-pr-comment-resolver`; merge remains blocked until the fix and final reconcile complete. |
| No findings | The repository-documented reaction-only signal on its specified target, attributable to the current observation | Record the target, reaction, actor, timestamp, trigger, and head as terminal evidence. |
| Completed by check | A repository-documented terminal check or review status for the current head | Record it as terminal only when the documented contract says it represents reviewer completion. |
| Pending | The reviewer is requested, running, queued, or has no attributable terminal signal | Continue the bounded wait; merge remains blocked. |
| Ambiguous | The signal predates the trigger, may apply to another head, has an unexpected actor or target, conflicts with another signal, or cannot be read completely | Stop at the safe blocker after the bounded wait or immediately when completeness cannot be established. |

For Codex, an authored review or thread is a terminal result with feedback. A
repository-documented no-finding reaction is a terminal result without feedback.
The mere absence of a Codex review after Ready is pending, not no findings.
Queued, reviewing, acknowledged, and other nonterminal bot replies remain pending.
Authorship alone does not prove reviewer completion.
Reaching a terminal signal starts the final settle and readback phase; it does
not authorize an immediate merge. Continue through the repository-documented
settle condition or bounded observation policy so delayed replies are included.
If no settle condition is documented, perform a final refresh at the end of the
bounded observation and report that limitation; do not invent a universal wait
duration.

## Complete Final Snapshot

After Ready and after every later mutation:

1. Record the current head and current-head CI and check states.
2. Fetch every PR conversation issue comment with complete pagination.
3. Fetch every review thread, every inline comment, and every nested reply with
   independently complete pagination, including resolved and outdated threads.
4. Fetch PR-level reactions, review-level reactions, inline-comment reactions,
   and reactions on repository-specified comments or commands.
5. Read delayed bot replies on both feedback surfaces and map each signal to its
   actor, target, timestamp, trigger, and head.
6. Re-evaluate the matrix for every configured reviewer. Any actionable item or
   mutation restarts this final snapshot.
7. After every reviewer is terminal, satisfy the documented settle condition or
   finish the bounded observation, then repeat the complete readback before
   merge evaluation.

Do not merge from a partial read, a pre-Ready snapshot, a stale positive check,
or a reaction whose meaning is undocumented. When the bounded wait expires,
report the exact pending reviewer and missing terminal evidence rather than
weakening the gate.
