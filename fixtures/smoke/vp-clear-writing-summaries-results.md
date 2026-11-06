# Summary Consolidation Trial Results

Observed November 6, 2026 (Asia/Taipei). All requests and sources are fictional.
This tests writing instructions, not the systems described in the sources.

## Method and evidence limits

Four fresh independent agents completed the same four raw requests, two with
baseline skills and two with the candidate. Baseline files were copied from
this change's parent revision using `git show`; candidate files were copied
from the working tree. Each isolated ordinary directory contained only local
skills, an AGENTS.md skill catalog and scope rules, request.md, and the agent's
result.md. Agents received no rubric, version label, expected answer, comparison
purpose, or other outputs. Their only assigned mutation was result.md.

The maintainer scored actual result files, not agent self-assessments. The
candidate's subsequent entrypoint edit only wrapped an existing paragraph;
its routing and summary reference remained unchanged. No correction was made
in response to these outputs.

| Dimension | Baseline, runs 1 / 2 | Candidate, runs 1 / 2 |
| --- | --- | --- |
| Summary content, cases 1 and 4 | Pass / Pass | Pass / Pass |
| Requested output scope and clear wording, all four cases | Pass / Pass | Pass / Pass |
| Actual skill selection and resource reads | Unobserved / Unobserved | Unobserved / Unobserved |
| Absence of operational side effects from tool traces | Unobserved / Unobserved | Unobserved / Unobserved |

Both versions preserved the supplied facts and limits without adding an owner,
next action, extra summary, or changed body. The result files contained only
the requested writing. Full tool/read traces were not available to the
maintainer, so successful prose does not establish which skill or reference
was read, or prove an absence of external actions. Agent self-report is not
substituted for that missing evidence. The trial supports these output cases,
not a measured improvement in implicit invocation or general reliability.

## Repeated manual mechanism walkthroughs

Two maintainer passes traced the baseline and candidate instructions: first
from the catalog to the entrypoint, then from each request's scope back to the
applicable rule. These are manual walkthroughs, not independent agent behavior.

| Case | Baseline mechanism in both passes | Candidate mechanism in both passes |
| --- | --- | --- |
| Executive summary | Writing delegates selection to a separate summary skill, which loads writing again | Description explicitly covers executive summaries; body requires local summaries.md |
| Code comment | Shared writing rules apply without a summary | Shared writing rules apply; ordinary prose does not require summary guidance |
| Exact PR template | Preserve three headings, with no added summary | Preserve three headings, with no added summary |
| Condensed incident opening | Summary skill covers an opening with a buried conclusion | Body explicitly covers an opening that summarizes a larger source |

Both passes found a complete candidate route without the retired skill and
preserved summary-only scope. The baseline could fail when its handoff was
missed or its second skill was absent; neither failure occurred in the observed
prose. The candidate could still fail to follow its reference-loading rule.
Measured resource-read behavior, cross-agent implicit invocation, multilingual
summary regression trials, and user acceptance remain unverified. Existing
Traditional Chinese summary cases were migrated, not rerun in this trial.

## Actual outputs

### Baseline 1

1.

- Rental quotes now itemize transport charges, making those costs visible to procurement staff.
- This behavior was verified on one supplier sandbox. Live billing remains unverified.

2.

// Preserve the original parameter order: the provider signs that sequence, so sorting would invalidate the signature.

3.

## Problem

Expired tokens caused repeated rejected requests.

## Change

Ask users to sign in again when their token expires.

## Validation

Auth tests pass. Mobile browsers and production deployment remain untested.

4.

The booking service has recovered. Reminders were delayed for 20 minutes, but no bookings were lost. The cause remains unknown.

### Candidate 1

1.

- Rental quotes now itemize transport charges, as verified in one supplier sandbox.
- Live billing remains unverified.

2.

// Preserve parameter order because the provider signs the original sequence; sorting would break the signature.

3.

## Problem

Expired tokens caused repeated rejected requests.

## Change

Ask users to sign in again when their token expires.

## Validation

Auth tests pass. Mobile browsers and production deployment remain untested.

4.

The booking service has recovered. Reminders were delayed for 20 minutes, but no bookings were lost. The cause remains unknown.

### Baseline 2

1.

- Rental quotes now itemize transport charges.
- This was verified in one supplier sandbox. Live billing remains unverified.

2.

// Preserve the original parameter order because the provider signs that sequence; sorting would break the signature.

3.

## Problem

Expired tokens caused repeated rejected requests.

## Change

Ask users to sign in again when their token expires.

## Validation

Auth tests pass. Mobile browsers and production deployment remain untested.

4.

The booking service has recovered. Reminders were delayed for 20 minutes, but no bookings were lost. The cause remains unknown.

### Candidate 2

1.

- Rental quotes now itemize transport charges.
- This was verified in one supplier sandbox. Live billing remains unverified.

2.

// Preserve parameter order: the provider signs the original sequence, so sorting would break the signature.

3.

## Problem

Expired tokens caused repeated rejected requests.

## Change

Users are now prompted to sign in again when their token expires.

## Validation

Auth tests pass. Mobile browsers and production deployment remain untested.

4.

The booking service has recovered. Reminders were delayed for 20 minutes, but no bookings were lost. The cause remains unknown.
