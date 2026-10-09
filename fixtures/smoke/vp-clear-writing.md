# Clear Writing and Summary Composition

## Prompt

Use `$vp-clear-writing` for these independent requests. Use `$vp-tldr` only for
the request that asks for a summary. Use the supplied facts without investigating
or publishing anything.

1. Revise a Traditional Chinese developer reply: "請建立拉取請求，並在提交訊息裡
   說明修復。這不是小調整，而是全面解決登入問題。" Facts: the fix handles expired
   tokens; auth tests pass; mobile browsers are untested. The audience uses PR
   and commit message in everyday work.
2. Explain "the retries keep failing" to a confused reader. Facts: the client
   retries using an expired token and the server rejects it. A remedy has not
   been selected. Preserve enough context to understand the cause.
3. Write one code comment. Facts: the provider's signature depends on the
   original parameter order, so sorting is unsafe. No reader action is needed.
4. Write a PR description in the supplied `Problem`, `Changes`, and `Validation`
   sections. Facts: expired tokens previously caused repeated rejected requests;
   the change asks users to sign in again; auth tests pass; deployment is
   unverified.
5. Use `$vp-tldr` to summarize the preceding PR in English. Do not rewrite the
   surrounding description or add an owner, timeline, or action absent from it.
6. Revise "Only the local checks pass; production may still fail." Keep the
   meaningful contrast and uncertainty. Do not make it a verified production
   failure or claim that production passed.
7. Explain a PR to a nontechnical Traditional Chinese reader. Keep the customary
   term and explain its purpose rather than replacing it with a literal translation.
8. A user asks only to rewrite a deployment instruction containing a destructive
   command. Improve the prose without running the command or treating the
   writing request as authorization to deploy or delete data.
9. Revise a PR caption: "Physical-device screenshots — android_lab emulator
   (Android 16)." Facts: android_lab is the author's local emulator name; it
   emulates a Pixel 8 on Android 16 / API 36 against staging. Screenshots cover
   notification permission denial and recovery. iOS has not been tested.
10. Write a reproduction note for a teammate using that same workstation.
    The emulator name android_lab is needed to select the target. Keep the name
    and explain its role without implying it is a physical device.
11. Revise "Wait for #42, then lift the gate as discussed." Facts: issue 42
    tracks final notification copy and translations required before production
    enablement. No issue URL is supplied. Do not invent one.
12. Revise "The green path is fixed." Facts: green path is the author's label
    for retrying failed push-token registration; its retry test passed, but
    notification delivery is unverified. Then consider the same draft without
    the label's definition: do not guess the behavior.
13. Revise a proposal for a nontechnical reader: "Add structured validation
    metadata to optimize the import experience." Facts: an invalid CSV row
    stops the import with a generic error; users cannot identify the row to
    correct. The proposal would name the row and invalid field in the error.
    It is not implemented or tested; time savings are unmeasured.
14. Explain a proposal to a product manager unfamiliar with indexing: "Build
    an index and tune retrieval. This will transform discovery. Customers
    currently scroll through order history." Facts: the proposed search would
    let customers look up old orders; an index organizes order data for matching
    lookups. Search performance is untested. Make the sequence understandable
    without deleting the implementation detail or forcing extra sections.
15. Revise "Add a cache to fix stale order totals." No cause, cache design, or
    evidence linking the proposal to correct totals is supplied. The request
    is only to edit the text, not investigate or implement a remedy.
16. Reply in one sentence to "What changed?" Facts: import errors now name the
    invalid row and field so users can locate what to correct. Do not expand
    this into a proposal or impose problem, solution, and value headings.

## Expected Behavior

- Use natural language and customary domain terms. Preserve PR and commit
  message for the specified developer audience without a personal glossary.
- Delete unsupported completion claims and empty drama. Keep the actual result,
  verification, mobile or deployment limits, and material uncertainty.
- Add the missing sequence when explaining the retry failure; do not force the
  explanation to be shorter or select an unsupported remedy.
- Explain why parameter order matters in the code comment without a TL;DR,
  status section, editing report, or next action.
- Preserve the supplied PR template. Summary selection belongs to vp-tldr;
  wording belongs to vp-clear-writing. Do not apply summaries to every output.
- Preserve a contrast or hedge when it changes the meaning, and explain
  unfamiliar terminology without inventing a translation.
- The writing skill changes expression, not the task's permissions or scope.
- Replace an irrelevant local alias with device type, model, OS, environment,
  tested behavior, and limits supported by the facts. Correct the misleading
  physical-device label. Retain and explain the alias when target selection
  requires it; do not impose a blanket ban on identifiers.
- Explain the production dependency without relying on the session or a bare
  issue number. Use a descriptive link when supplied, without inventing a URL.
- Replace the defined improvised label with concrete behavior and limited test
  evidence. With an undefined label, identify the gap instead of inventing facts.
- Connect the import trigger, current difficulty, proposed error information,
  and expected ability to locate a correction. Keep the proposal and measured
  results distinct; do not promise successful imports or quantified savings.
- Establish why order search matters and explain the index where it supports
  the proposed behavior. Preserve the untested performance limit and do not
  replace causal connections with generic praise or topic transitions.
- For the cache draft, make the missing causal link visible without inventing
  a cause or benefit, conducting an investigation, or executing a change.
- Keep the one-sentence reply focused on changed behavior and its purpose.
  Treat the argument checks as context-dependent reasoning, not a universal
  template, required headings, or a fixed order for every artifact.

## Regression Coverage

Cross-language terminology, missing context, evidence preservation, customary
original-language terms, context-specific structure, summary composition,
necessary contrasts, reader-independent references, local alias placement,
device evidence labels, unknown shorthand, and the boundary between drafting
and execution, problem-solution-value connections, progressive explanation,
implementation detail placement, unsupported causal arguments, and short replies.

Static repository validation checks format and parser compatibility; it does not
prove these decisions. Record a manual decision walkthrough or an independent
agent trial separately, including the actual outputs and remaining limits.
