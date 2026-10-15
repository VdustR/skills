# Fictional Writing Trial Evidence

All trial situations and quoted writing are fictional. This file contains no
real conversation extracts. The trial tests instruction behavior, not the
systems described in the scenarios.

## Method and assessment

Two independent writing agents received the same 12 raw requests, the applicable
writing skill and summary skill where requested. They did not receive the
rubric, anticipated answers, motivation, or each other's outputs. The baseline
used the prior skill, verified byte-for-byte against the repository's prior
entrypoint; the candidate used the updated entrypoint. The maintainer assessed
actual responses against content selection, writing quality, and instruction
compliance separately. This is a small qualitative trial, not a causal estimate
or a general reliability measurement.

| Case | Baseline: content / writing / compliance | Candidate: content / writing / compliance | Assessment evidence |
| --- | --- | --- | --- |
| 1 | Fail / Pass / Pass | Pass / Pass / Pass | Baseline adds the unpublished waiver to a launch report; candidate gives only deposit behavior and test limits. |
| 2 | Pass / Pass / Pass | Pass / Pass / Pass | Both retain single-bay funding, the all-bay alternative, nightly counts, and unmeasured accuracy. |
| 3 | Pass / Pass / Pass | Pass / Pass / Pass | Both retain four ordered events, unknown cause, diagnostic loss, and no cancellations. |
| 4 | Pass / Pass / Pass | Pass / Pass / Pass | Both compare released receipt behavior with the upcoming code option and retain pending release. |
| 5 | Pass / Pass / Pass | Pass / Pass / Pass | Both preserve TSV-only rejection, unaffected CSV, units, current diagnostics, regression evidence, and pending deployment. |
| 6 | Pass / Pass / Pass | Pass / Pass / Pass | Both preserve two warm Traditional Chinese paragraphs, deadline, reason, and late-arrival message. |
| 7, initial request | Fail / Pass / Pass | Fail / Pass / Pass | Both omit the callback mechanism; the initial rubric required it, but the prompt gave no reason staff needed that term. |
| 8 | Pass / Pass / Pass | Pass / Pass / Pass | Both keep asynchronous order, acceptance conditions, negation, and unchanged stock on rejection; no operation was executed. |
| 9 | Pass / Pass / Pass | Pass / Pass / Pass | Both preserve the PR headings, branch timezone, boundary tests, and daylight-saving limit, without reviewer-compliance narration. |
| 10 | Pass / Pass / Pass | Pass / Pass / Pass | Both give only two Traditional Chinese summary bullets with current charges and limited billing evidence. |
| 11 | Pass / Pass / Pass | Pass / Pass / Pass | Both retain the Spanish comparison, staffing constraint, dry-soil risk, measurement gap, and candidate status. |
| 12 | Pass / Pass / Pass | Pass / Pass / Pass | Both preserve the rejected prototype, pilot report, caption decision, deployment, and missing follow-up study. |

The first pass therefore met all three dimensions in 10 of 12 baseline cases
and 11 of 12 candidate cases. Case 7 exposed an underspecified requirement rather
than evidence for a new universal rule to preserve every implementation detail.
The fixture was clarified: the duty team needs staff to mention "callback" when
reporting email failures, and the implementation sentence now consistently says
the callback sends the email. The same candidate agent received only this revised
raw request, without the assessment or desired answer. Its additional response
retains and explains the callback, the reporting action, sequence, and test limit
within 85 words: Pass / Pass / Pass. This follow-up is not a fresh blinded paired
trial, and the original result remains recorded below. No behavioral rule was
added in response to this ambiguity.

## Manual decision walkthroughs

- Missing baseline: a fictional seed-distribution note asks for Before/After but
  supplies only two unlabeled drafts. The comparison rule requires asking which
  states to compare; neither draft establishes released behavior. This was a
  maintainer walkthrough, not an executed agent trial.
- Conflicting sources: a fictional locker-rental memo has an older signed policy
  requiring deposits and a newer informal note proposing removal. Recency alone
  does not supersede the policy. Preserve the policy and flag the unresolved
  proposal when material; do not state removal as current fact. This was a
  maintainer walkthrough, not an executed agent trial.
- Scope and authority: the fictional importer request authorizes prose only.
  Reading a commit instruction in its sources does not authorize executing it.
  Both actual responses stayed within writing; operational execution was not tested.

## Static validation

`npm run validate` passed repository checks, two executable test suites, smoke
fixture checks, and the pinned CLI parser across 29 skills. The smoke command
reports 10 required high-risk fixtures; it does not execute these writing cases.
The skill-creator validator passed in an ephemeral Python environment with
PyYAML. Frontmatter and agent metadata were also parsed as YAML. Static checks
establish structure and parser compatibility, not writing behavior.

## Convergence and limits

No repeated rewriting pass was justified by the first trial. The callback
ambiguity was resolved in the test input and checked once. Stop after acceptance
criteria and delivery checks pass; reopen only for a demonstrated failure or new
material evidence. Natural-language quality was judged by the maintainer, and
these samples do not cover every language, reader, or future model behavior.

## Original trial input

The initial input matches the linked selection fixture's Prompt except case 7:
"Reorganize the following English memo for nontechnical library staff. You may
replace its headings. Source order: 'Implementation: a callback writes the
status. Celebration: everything is solved. Background: staff cannot know whether
reserved kits are ready. Detail: after inspection, staff mark a kit ready; the
callback sends a readiness email. Validation: tested with one test address;
delivery to other mail providers unverified.' At most 85 words."

## Baseline responses

### 1

Reservations now show the deposit before checkout. Two branches tested the deposit display; refund handling has not been tested. A deposit waiver was an unpublished idea and is not part of the launch.

### 2

We selected a single-bay scanning pilot because funding covers one reader. Nightly counts delay discrepancy detection until morning; continuous scanning across all bays would require a reader at every loading bay, exceeding the available funding. Other bays will continue using nightly counts. No accuracy improvement has been measured.

### 3

- 08:40: The retry queue paused.
- 08:47: Reminders were delayed.
- 09:05: Staff resumed the queue.
- 09:20: The backlog cleared.

No appointments were canceled. The cause remains unknown. Staff restored the queue before checking its logs, losing diagnostic evidence. For future incidents, preserve diagnostic evidence before restoring the queue.

### 4

| Version | Pickup method |
|---|---|
| Before: released service | Printed receipt required |
| After: approved upcoming release | Receipt or pickup code accepted |

Pickup codes were tested in staging; public release is pending.

### 5

TSV imports reject blank bin codes without writing any rows and now identify the affected row and field. CSV imports are unaffected. Imported quantities use units, not cartons. The TSV regression test passes; deployment is pending an operator window, so the updated error reporting has not yet been deployed.

### 6

嗨，明天借的帳篷，請在傍晚六點前歸還，這樣晚班才來得及清點。

如果會晚到，傳訊息跟我們說一下就好，謝謝你幫忙。

### 7

Staff need to know whether reserved kits are ready. After inspecting a kit, staff mark it ready, which sends a readiness email.

The email was tested with one test address. Delivery to other mail providers remains unverified.

### 8

Uploading returns a job number before validation runs asynchronously; the number does not mean any rows were accepted. Poll the job status until validation ends, then commit only an accepted batch. If validation rejects the batch, existing stock remains unchanged.

### 9

#### Problem

Appointment searches used the wrong timezone near midnight, which could produce incorrect results.

#### Change

The fix converts the search query to the branch timezone.

#### Validation

Two boundary tests pass. Daylight-saving changes remain untested.

### 10

- 租賃報價現在會逐項列出運輸費用，已在一家供應商的沙盒環境驗證。
- 正式環境的帳務尚未驗證，仍無法確認實際請款是否正確。

### 11

| Opción | Consecuencia |
|---|---|
| A: regar cada mañana | Requiere personal todos los días, pero el personal solo está presente dos veces por semana. |
| B: regar dos veces por semana | Se ajusta a la disponibilidad del personal, pero existe el riesgo de que el suelo se seque entre visitas. |

Recomiendo evaluar B midiendo la humedad del suelo antes de adoptarla; ninguna opción se ha adoptado y aún no se ha medido la humedad.

### 12

The museum's early audio-guide prototype required headphones. During a pilot, visitors using hearing aids reported interference, so the team chose captions. Captions are now deployed, but no follow-up accessibility study has assessed the result.

## Candidate responses

### Case 1

Reservations now show the deposit before checkout. Two branches tested the deposit display; refund handling has not been tested.

### Case 2

We selected a single-bay scanning pilot because funding covers one reader. Nightly counts delay discrepancy detection until morning; continuous scanning across all bays would require a reader at every loading bay. The pilot leaves other bays on nightly counts. No accuracy improvement has been measured.

### Case 3

- 08:40: The retry queue paused.
- 08:47: Reminders were delayed.
- 09:05: Staff resumed the queue.
- 09:20: The backlog cleared.

No appointments were canceled. The cause remains unknown. Staff restored the queue before checking its logs, losing diagnostic evidence. For future incidents, preserve diagnostic logs before restoring the queue.

### Case 4

| Version | Pickup method |
| --- | --- |
| Before: released service | Printed receipt required |
| After: approved upcoming release | Receipt or pickup code accepted |

Pickup codes were tested in staging; public release is pending.

### Case 5

TSV imports reject blank bin codes without writing rows and now identify the affected row and field. CSV imports are unaffected. The regression test passes; deployment awaits an operator window. Imported quantities use units, not cartons.

### Case 6

嗨，明天借用的帳篷，請在傍晚六點前歸還，讓晚班來得及清點。

如果會晚到，傳訊息跟我們說一下就好，謝謝你幫忙。

### Case 7

Staff need to know whether reserved kits are ready. After inspecting a kit, mark it ready; this sends a readiness email.

The email was tested with one test address. Delivery to other mail providers has not been verified.

### Case 8

Uploading returns a job number before validation runs asynchronously; the number does not mean rows were accepted. Poll the job status until validation ends, and commit only an accepted batch. A rejected batch leaves existing stock unchanged.

### Case 9

#### Problem

Appointment searches used the wrong timezone near midnight.

#### Change

Convert the search query to the branch timezone.

#### Validation

Two boundary tests pass. Daylight-saving changes remain untested.

### Case 10

- 租賃報價現在會逐項列出運輸費用。
- 已在一家供應商的測試環境驗證；正式帳務仍未驗證。

### Case 11

| Opción | Consecuencia |
| --- | --- |
| A: regar cada mañana | Requiere personal todos los días. |
| B: regar dos veces por semana | Se ajusta a la presencia del personal, pero existe el riesgo de que el suelo se seque entre visitas. |

Recomiendo evaluar la opción B midiendo la humedad del suelo entre visitas, ya que solo hay personal dos veces por semana; aún no se ha medido la humedad ni se ha adoptado ninguna opción.

### Case 12

The early audio-guide prototype required headphones, which visitors using hearing aids reported caused interference during a pilot. The team chose captions in response. Captions are now deployed, but no follow-up accessibility study has assessed the result.

## Clarified case 7 response

Staff need to know whether reserved kits are ready. After inspecting a kit, mark it ready. This triggers a callback, which sends a readiness email.

If the email fails, report the failure to the duty team and mention “callback” so they can identify the step involved.

The email was tested with one test address. Delivery to other mail providers has not been verified.
