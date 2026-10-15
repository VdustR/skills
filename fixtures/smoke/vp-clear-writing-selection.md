# Reader Purpose and Current Sources

All situations, organizations, records, and quoted drafts below are fictional.
Use `$vp-clear-writing` to complete each request independently. Do not browse,
run operational commands, or publish anything. Label responses by case number.
Do not add an editing report unless the request asks for one.

## Prompt

1. Write an English equipment-rental launch report for branch managers in at
   most 65 words. Draft: "Following the editor's correction, we removed the
   deposit-waiver idea and now explain the finalized plan. This is not just a
   draft cleanup; it is a complete upgrade. Our first draft mistakenly said the
   waiver was live." Approved facts: reservations now show the deposit before
   checkout; waiver was an unpublished idea; two branches tested deposit display;
   refund handling was not tested. Managers need the behavior and evidence.
2. Write a decision note for warehouse supervisors, at most 100 English words.
   Sources: nightly counts delay discrepancy detection until morning. Continuous
   scanning would need readers at every loading bay; funding covers only one
   reader. A single-bay pilot is selected; it will leave other bays on nightly
   counts. No accuracy improvement has been measured. The rejected all-bay option
   explains the budget tradeoff. Earlier editing discussion concerned commas.
3. Write the requested English incident timeline, keeping event order and the
   retrospective lesson, within 100 words. Fictional clinic booking incident:
   08:40 a retry queue paused; 08:47 reminders were delayed; 09:05 staff resumed
   the queue; 09:20 the backlog cleared. Cause remains unknown. Restoring the
   queue preceded checking its logs, which lost diagnostic evidence. Draft says
   "We revised the wording after review." No appointments were canceled.
4. Supply a two-row English Before/After table comparing the released parcel
   pickup service to the approved upcoming release. Released service requires
   a printed receipt. Upcoming release accepts receipt or pickup code; staging
   tested codes, public release is pending. An abandoned internal draft proposed
   biometric pickup, but it was never implemented or released. Columns must be
   Version and Pickup method. Include evidence in one sentence after the table.
5. Rebuild an inventory-import handoff from the latest trusted records in no
   more than 90 English words. Old draft: "Blank bin codes corrupt imports;
   migration is blocked; all formats fail." Later engineering log: only TSV
   rejects blank bin codes without writing rows; CSV is unaffected. Latest
   acceptance record: TSV now reports row and field; regression test passes;
   deployment awaits an operator window. Existing source detail still valid:
   imported quantities use units, not cartons. Readers need current behavior,
   evidence, limits, and next dependency, without the editing conversation.
6. Lightly polish this friendly note for volunteers in Traditional Chinese.
   Keep its two paragraphs and warm voice; fix awkward wording only. "嗨，明天
   借的帳篷，請在傍晚六點以前還回來，這樣晚班才來得及清點。\n\n如果會晚到，
   傳訊息跟我們說一下就好，謝謝你幫忙。" The literal \n\n marks the paragraph break.
7. Reorganize the following English memo for nontechnical library staff. You
   may replace its headings. Staff must mention "callback" when reporting
   email failures to the duty team. Source order: "Implementation: a callback sends
   the readiness email. Celebration: everything is solved. Background: staff cannot know
   whether reserved kits are ready. Detail: after inspection, staff mark a kit
   ready; the callback sends a readiness email. Validation: tested with one test
   address; delivery to other mail providers unverified." At most 85 words.
8. Write an English importer instruction in at most three sentences. Facts:
   upload returns a job number before validation runs asynchronously; a job
   number does not mean rows were accepted. Poll status until validation ends;
   only commit an accepted batch. A rejection leaves existing stock unchanged.
   The supplied prose includes "Do not commit before acceptance." Keep the
   technical conditions and order; only rewrite, do not execute the operation.
9. Write an English PR description using exactly the headings Problem, Change,
   and Validation. An appointment search used the wrong timezone near midnight;
   the fix converts the query to the branch timezone. Two boundary tests pass;
   daylight-saving changes remain untested. Revision notes say "The author has
   now addressed all reviewer requests"; no submitted review record is supplied.
   Keep each section to one or two sentences.
10. Use vp-tldr with the writing skill to write only a Traditional Chinese
    summary in two bullets for procurement staff. Current body: rental quotes
    now itemize transport charges; verified on one supplier's sandbox; live
    billing is unverified. Old summary says all invoices are correct and quotes
    are awaiting a design decision. The staff need to know what is supported.
11. Compare two candidate irrigation schedules in Spanish, in a table with
    Opción and Consecuencia, plus one recommendation sentence. A waters each
    morning and requires daily staffing; B waters twice weekly and risks dry
    soil between visits. Staff are present only twice weekly; soil moisture has
    not been measured. Neither candidate has been adopted. Preserve the options
    and uncertainty; do not claim water savings.
12. Write a short English decision-history paragraph for a museum accessibility
    review. An early audio-guide prototype required headphones; visitors using
    hearing aids reported interference in a pilot. The team chose captions;
    captions are now deployed, but no follow-up accessibility study has run.
    The reader explicitly needs the rejected prototype and causal reasoning.
    Preserve this history; draft-editing notes only say "cut a redundant adverb."

## Expected Behavior

Evaluate three dimensions separately for every response:

- **Content selection:** correct, relevant, self-contained claims from the
  applicable sources; material reasoning, evidence, uncertainty, and conditions
  retained; no irrelevant drafting history or false comparison baseline.
- **Writing quality:** natural, concrete language for the audience; clear
  referents and reasoning order; no empty contrasts, generic completion claims,
  invented benefits, or unsupported causal links. Necessary contrasts stay.
- **Instruction compliance:** requested language, extent of editing, length,
  structure, template, and scope; no operational action or publication.

Mark each dimension pass or fail with evidence from the actual response; do not
collapse a content error into a stylistic preference. Accept different wording
and structure when they meet the request. A response fails if it changes a
material fact or loses a required limit, even when polished and concise.

Case-specific acceptance criteria:

1. Rental report: include deposit visibility, two-branch test scope, and untested
   refunds. Exclude the author's correction, the waiver draft, and unsupported
   upgrade claims. Reject a polished narration of how feedback was addressed.
2. Warehouse decision: explain limited reader funding, selected single-bay pilot,
   remaining nightly counts, and unmeasured accuracy. Retain the all-bay option
   as decision evidence; omit comma editing. Reject deleting every rejected idea.
3. Clinic timeline: preserve all four event times, order, unknown cause, no
   cancellations, and diagnostic loss from restoring before log inspection.
   Exclude wording revisions. Reject replacing the requested timeline with only
   the current outcome or claiming the queue pause is the root cause.
4. Parcel comparison: use released receipt-only behavior as Before and the
   approved receipt-or-code release as After; retain pending release and staging
   scope. Reject biometric pickup as a former product or claiming public delivery.
5. Import handoff: use TSV-only behavior, no writes on rejection, current row and
   field diagnostics, passing regression, pending operator window, unaffected
   CSV, and units. Do not repeat corruption, all-format failure, or the obsolete
   migration blocker; distinguish superseded conclusions from still-valid facts.
6. Volunteer note: preserve two paragraphs, friendly Traditional Chinese voice,
   return deadline and its reason, and late-arrival message. Reject a formal
   announcement, a new procedure, or a needless reorganization.
7. Library memo: organize around kit readiness and the inspection-to-status-to-
   email sequence; preserve callback detail and limited delivery evidence.
   Remove unsupported completion. Reject keeping irrelevant draft headings merely
   because they existed, or dropping the technical mechanism to sound simple.
8. Import instruction: job number precedes asynchronous validation and does not
   establish acceptance; status polling precedes committing accepted batches;
   rejection leaves existing stock unchanged. Reject shortening away negation,
   asynchronous timing, conditions, or executing the described operation.
9. Appointment PR: preserve the three exact headings, branch-timezone fix,
   midnight trigger, passing boundary tests, and untested daylight-saving changes.
   Exclude reviewer-compliance claims. Reject an added TL;DR or verified-review claim.
10. Procurement summary: only two Traditional Chinese bullets; current itemized
    charges, one-supplier sandbox scope, and unverified live billing. Remove the
    obsolete decision and all-invoices claim; do not rewrite the body. Summary
    selection remains vp-tldr's responsibility.
11. Irrigation options: Spanish table and recommendation sentence; retain both
    candidate schedules, staffing tradeoff, dry-soil risk, unmeasured moisture,
    and proposal status. Recommend conditionally from staffing evidence without
    inventing water savings or an adoption decision.
12. Museum history: retain headphone prototype, hearing-aid interference report
    from pilot, resulting caption decision, deployment, and missing follow-up
    study. Remove adverb-editing notes. Reject removing the rejected prototype
    or claiming accessibility was fully verified.

## Regression Coverage

Fictional, independent domains distinguish result reports, decision documents,
incident timelines, released-versus-upcoming comparisons, current-source
reconstruction, light polishing, requested reorganization, asynchronous technical
instructions, PR templates, summary-only scope, candidate comparisons, and
requested decision history. Positive controls retain meaningful history,
negation, conditions, and uncertainty; negative controls exclude editorial
self-explanation, stale claims, false release history, and invented benefits.

## Trial protocol and stopping condition

For an independent trial, give the evaluator only the skill, the Prompt section
and its preceding setup, and necessary source artifacts. Withhold this rubric,
expected outputs, the motivating incident, and proposed corrections. Keep output
outside the working tree; assess it afterward with the three dimensions above.
A baseline trial can use the prior skill with the same raw requests; one paired
trial cannot establish that only the new rules caused a difference.

Report static validation, manual walkthroughs, and independent agent trials
separately. String checks and fixture existence do not prove behavior. Retain
actual responses and assessments when reporting a trial, with no real-world
conversation material or identifiers. Correct only demonstrated failures; stop
when the criteria pass and no new evidence remains. After two correction passes
on the same failure, reassess the hypothesis and use a discriminating check
instead of adding more instructions or repeating the trial unchanged.

See [Fictional Writing Trial Evidence](vp-clear-writing-selection-results.md)
for the recorded paired trial, clarification, and evidence limits.
