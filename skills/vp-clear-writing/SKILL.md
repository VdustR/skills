---
name: vp-clear-writing
description: >-
  Write or revise clear, concrete prose across languages for user-facing replies,
  documents, code comments, review comments, and pull request descriptions.
  Make problems, solutions, and value understandable in a logical reading order.
  Proactively use useful diagrams, tables, or pseudocode to explain structure
  and behavior.
  Select relevant content and preserve meaning, necessary context, and
  uncertainty while removing empty rhetoric. Boundary: use vp-tldr to select
  summary content and the relevant workflow to investigate, verify, or publish it.
---

# Clear Writing

Make the text easy for its intended reader to understand and use. Choose the
shortest wording that preserves the necessary meaning, not the fewest words.
Apply these principles to the requested text without changing the task's scope,
language requirements, artifact template, or permissions.

## Establish the reader's need

Use the request and available context to identify the audience, purpose, and
format. Ask only when missing information would materially change the result.
Match the extent of editing to the request. For ordinary polishing, preserve
the draft's supported claims, useful structure, purpose, and appropriate voice;
make the minimum effective edit. When asked to reorganize or rebuild a document,
let the reader's needs and current sources determine its content and order
rather than preserving the old draft. Explicit language, length, format,
template, and scope requirements still apply. Do not invent facts or opinions
to make the writing more specific.

Put the answer, finding, decision, or required action early when that helps the
reader. Supply the premise needed to understand it. If the reader is confused,
identify and explain the missing context instead of merely shortening the text.

Write for someone who has not seen the author's session. Replace local aliases,
unexplained numbers, improvised labels, and references such as "the earlier fix"
with the object's role and the premise needed to understand the claim. For useful
traceability, pair an identifier or link with a descriptive name; a link alone
does not explain why the reference matters.

Keep details that change the reader's judgment: for verification, these may
include physical device versus emulator, model, OS, environment, tested behavior,
and limits. Put session-specific names or handles in reproduction or evidence
notes when needed to locate the exact resource. Do not delete necessary facts
along with an alias, expand terms the audience already knows, or invent missing
details; qualify or ask about a gap when it affects interpretation.

## Choose what belongs before rewriting

Select content by the artifact's purpose before improving its wording. In a
result report or deliverable, include facts, reasoning, evidence, and limits
that help the reader understand, decide, or act. Omit drafting history,
withdrawn suggestions, resolved misunderstandings, and statements included only
to demonstrate that the author followed feedback. Explain the resulting behavior
or decision directly instead of narrating how its description was corrected.

History belongs when the reader requests it or it explains causality, options,
tradeoffs, evidence, risk, or action. A decision record may need a rejected
option; an incident timeline or retrospective may need the sequence of events.
Keep that information in the relevant place. Judge its relevance, not whether
it uses a negative sentence, a contrast, or a reference to the past.

For a comparison, establish the requested baseline and the status of each side:
released behavior, an approved upcoming change, competing proposals, or draft
revisions. Do not turn an unpublished draft into a previous product version.
If the baseline is missing and changes the comparison, ask rather than choose
one silently.

When rebuilding from multiple rounds of material, use the current authoritative
sources and still-valid decisions; later wording alone does not make a source
more reliable. Recover supported facts and evidence from older material when
they still apply, replace superseded conclusions, and preserve consequential
conflicts or unknowns. An old draft is context, not a requirement to repeat its
claims. This selects the body of the requested text; `$vp-tldr` continues to own
summary selection. Neither skill establishes missing facts through rewriting.

## Build an explanation the reader can follow

When explaining a problem or proposing a change, connect the situation, problem,
consequence, solution, and value. Explain who encounters the problem, when it
occurs, and what becomes difficult or impossible. Show how the proposed behavior
addresses that problem and what becomes better for the reader or affected user.
A feature list or claim such as "improves the experience" does not establish
that connection.

Distinguish the symptom from a demonstrated cause, a proposed remedy from an
implemented change, and expected value from an observed result. If the source
does not establish a cause, remedy, or benefit, preserve that gap or ask when it
is essential to the task. Do not invent a rationale, promise an outcome, or imply
that one change solves a broader problem to make the argument feel complete.

Choose the order by what the reader needs to understand next. A decision or
result can come first, followed by the context and reasoning that support it;
an unfamiliar mechanism may need a brief premise first. Introduce concepts and
conditions before relying on them. Keep each paragraph centered on one point,
then make its relationship to the next clear: cause, consequence, response,
tradeoff, or evidence. Use transitions that explain that relationship rather
than merely announcing the next topic.

Keep implementation details beside the behavior or constraint they explain.
Move supporting detail later when it interrupts the main reasoning, but retain
conditions and limitations beside claims they qualify. Use a concrete example
when an abstract description leaves the trigger, behavior, or benefit unclear;
label illustrative examples and do not present them as observed evidence.

These are reasoning checks, not mandatory headings or a fixed narrative order.
Use only the connections relevant to the requested artifact. A one-line reply
or code comment may need only a result and its reason; a proposal may need the
full argument. Preserve a supplied template and clarify the connections within it.

## Explain visually when useful

Proactively add a diagram when relationships, flows, states, timing, or branching
choices become easier to understand visually; do not wait for the reader to ask.
Choose the representation for the question, then a tool the destination supports.
Use the [visual explanation guide](references/visual-explanations.md) for user
flows, workflows, state diagrams, decision trees, architecture, and data views.
Keep the explanation, evidence limits, and accessible text alongside the visual.
Preserve explicit format constraints and focused edits; a single fact or simple
sentence does not need a decorative diagram. A diagram must not invent missing
behavior or imply that a proposed system has been tested.

## Preserve meaning and evidence

- Keep conditions, causes, sequence, limitations, and uncertainty that affect
  interpretation or action. Name the actor or referent when it would be unclear.
- State observed facts directly. Distinguish supplied claims, inference, and
  unknowns when the distinction matters; preserve useful source references.
- Prefer concrete behavior and consequences to broad labels or praise. Use only
  details supported by the source. A precise qualitative statement is better
  than an invented number.
- Split sentences with competing points. Keep the logical connection explicit;
  do not turn complete explanations into clipped status fragments.

## Use the language and terms readers recognize

Write naturally in the requested language, including its grammar and punctuation.
Do not impose English word counts, syntax, or a controlled vocabulary on other
languages.

Use standard terminology customary in the subject area and for the intended
audience. Keep one term per concept; do not cycle through synonyms or invent
names for ordinary concepts. Preserve identifiers and official names. When the
repository keeps a glossary, use its terms before coining new ones.

Do not force translations of terms commonly used in their original language, or
introduce uncommon literal translations. In software development, keep terms
such as `pull request`, `PR`, and `commit` in English where that is the audience's
customary usage. Use established translations where those are customary. When
readers need help, explain the concept briefly without replacing its name or
automatically pairing every term with a translation.

## Remove wording that adds no information

Remove ceremonial openings and closings, repeated conclusions, vague attribution,
unsupported intensifiers, invented importance, and dramatic setups. Prefer direct
verbs and concrete referents when they make the sentence clearer.

Judge the function of a phrase rather than maintaining a banned-word list. A
contrast, hedge, transition, summary, or emphasis can stay when it conveys a real
distinction, uncertainty, relationship, or navigation cue. Delete it when it only
adds drama or repeats what the text already establishes. Do not infer AI
authorship from these patterns.

## Fit the form to the job

Use paragraphs for connected explanations, bullets for parallel information,
numbered steps for ordered actions, and tables for comparisons. Add headings
when they help readers navigate. Avoid fixed sentence lengths, list limits, and
mandatory sections or next actions.

Choose tables for comparable attributes, mappings, or rule coverage; choose
pseudocode when ordered conditions, iteration, or data transformations need
precision without a language-specific implementation. Read
[tables and pseudocode](references/tables-and-pseudocode.md) when choosing these
forms, including decision/transition tables and runnable-code boundaries. Do not
force sequential human instructions into a table or disguise pseudocode as a
tested implementation.

Let the context determine what the reader needs:

- A reply gives the answer and relevant state; add a next action only if needed.
- A document supplies the purpose, context, conditions, and detail needed to use it.
  When writing or restructuring a document, decide which need it serves: a
  tutorial teaches by doing, a how-to gives steps to a goal, a reference
  states facts for lookup, and an explanation gives context and reasons.
  Prefer one need per document and link to another document for the rest. A
  how-to that stops to explain, or a reference that argues, makes the document
  harder for each of those readers to use. This follows
  [Diátaxis](https://diataxis.fr/).
- A code comment explains a non-obvious reason, constraint, or tradeoff rather
  than narrating the code.
- A review comment identifies the problem, trigger, consequence, and proposed
  correction without claiming an unverified cause as fact.
- A pull request description explains the problem, resulting behavior, and
  relevant verification or limitations for a reader without the conversation.

Use `$vp-tldr` when the task requires selecting or rewriting summary content;
apply these writing principles to its result without adding a summary to every
artifact. Read [references/examples.md](references/examples.md) when an example
would help resolve a wording or context decision. Read
[references/english.md](references/english.md) for procedure wording, patterns
that add nothing, and, for an English artifact, ambiguity checks.

## Check the result

Read the text as if the conversation and local setup were unavailable. Check
that names, references, and evidence labels explain what they refer to without
implying a broader result than the source supports. Check whether each sentence
has a clear referent and purpose, and whether the reader has the premise needed
to understand it at that point. For a problem or proposal, can the reader explain
what goes wrong, why it matters, how the response addresses it, and what value
is supported or still expected? Repair missing links rather than adding generic
benefit claims. Check that the reader can understand the main point, the
necessary context, and any action or limitation.

Check content selection separately from wording: does each retained point serve
this reader, and did any necessary history, condition, or uncertainty disappear?
Confirm that claims reflect the applicable sources and comparison baseline,
terms are customary and consistent, and the form and extent of editing fit the
request. Return the requested output; add an editing explanation only when it is
requested or helps assess a material change.

## Related skills

- [`vp-tldr`](https://github.com/VdustR/skills/tree/main/skills/vp-tldr)
  when selecting the content and scope of a concise summary.
- [`vp-design-reasoning`](https://github.com/VdustR/skills/tree/main/skills/vp-design-reasoning)
  when the underlying concepts, workflow, states, or architecture need investigation.
- [`vp-stack-selection`](https://github.com/VdustR/skills/tree/main/skills/vp-stack-selection)
  when a visual requires selecting an application renderer or technology stack.
