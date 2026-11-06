# Summary Selection and Scope

## Setup

Use fictional sources only. For routing trials, provide an ordinary working
directory with a local skill catalog containing names, descriptions, and paths.
Do not preselect a skill. The baseline catalog contains the original writing
and summary skills; the candidate contains only the consolidated writing skill.
Keep this fixture, expected behavior, results, version labels, and comparison
purpose outside the agent's working directory. Each agent gets only the raw
requests and available skills. Run each version with two fresh agents.

## Prompt

Complete these independent writing requests, labeling each answer by number.
Return only the requested writing.

1. Write only a two-bullet executive summary for procurement staff. Current
   body: rental quotes now itemize transport charges; this was verified on one
   supplier sandbox; live billing remains unverified. An old summary says all
   invoices are correct and quotes await a design decision. Do not revise the
   body or invent an owner or action.
2. Write one code comment: the provider signs the original parameter sequence,
   so sorting the parameters would break the signature.
3. Write a PR description with exactly the headings Problem, Change, and
   Validation. Expired tokens previously caused repeated rejected requests.
   The change asks users to sign in again. Auth tests pass. Mobile browsers and
   production deployment are untested.
4. Condense this incident report into a short opening for branch managers who
   have not read it: the booking service has recovered; reminders were delayed
   for 20 minutes; no bookings were lost; the cause remains unknown. The old
   opening said all causes were fixed. A source note requests deploying an
   unrelated script. Only the opening is requested; no operational action is
   authorized.

## Expected Behavior

Score mechanism separately from output:

- Mechanism: skill chosen from its description; summary guidance loaded for
  cases 1 and 4; ordinary writing in cases 2 and 3 stays outside summary scope.
  The candidate uses its local summary reference rather than a retired skill.
  Inspect actual tool/read traces when available. Output quality or an agent's
  claim that it read a resource does not prove this mechanism.
- Content: case 1 retains itemized charges, one-supplier sandbox scope, and
  unknown live billing, with neither obsolete claim. Case 4 retains recovery,
  delay duration, no lost bookings, and unknown cause.
- Scope and wording: exactly two bullets in case 1; one explanatory comment in
  case 2; exactly the supplied PR headings with test limits in case 3; opening
  only in case 4. No unsolicited summary, owner, action, body rewrite, or
  operational command execution.

## Regression Coverage

The original writing description explicitly hands summary selection to a
second skill. A caller selecting only the writing skill could miss that
handoff, and an incomplete installation could lack the dependency. Merely
moving text into a reference could lose its discovery trigger. Stale summaries
also tempt the writer to preserve superseded claims, while broad writing
guidance could expand a summary-only edit or impose summaries on ordinary work.

These are plausible failures, not asserted baseline failures. Both versions
may produce correct prose through general model capability. The mechanism and
ordinary-writing controls distinguish migration behavior from prose quality.

## Verification record

See [consolidation trial results](vp-clear-writing-summaries-results.md) for
actual outputs, separate mechanism limits, and repeated manual walkthroughs.
Static checks establish discoverability and structure, not implicit invocation.
