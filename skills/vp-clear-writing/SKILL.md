---
name: vp-clear-writing
description: >-
  Write or revise clear, concrete prose across languages for user-facing replies,
  documents, code comments, review comments, and pull request descriptions.
  Preserve meaning, necessary context, and uncertainty while removing empty
  rhetoric. Boundary: improves expression; use vp-tldr to select summary content
  and the relevant workflow to investigate, verify, or publish it.
---

# Clear Writing

Make the text easy for its intended reader to understand and use. Choose the
shortest wording that preserves the necessary meaning, not the fewest words.
Apply these principles to the requested text without changing the task's scope,
language requirements, artifact template, or permissions.

## Establish the reader's need

Use the request and available context to identify the audience, purpose, and
format. Ask only when missing information would materially change the result.
For an existing draft, preserve its claims, useful structure, and appropriate
voice. Make the minimum effective edit; do not invent facts or opinions to make
the writing more specific.

Put the answer, finding, decision, or required action early when that helps the
reader. Supply the premise needed to understand it. If the reader is confused,
identify and explain the missing context instead of merely shortening the text.

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
names for ordinary concepts. Preserve identifiers and official names.

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

Let the context determine what the reader needs:

- A reply gives the answer and relevant state; add a next action only if needed.
- A document supplies the purpose, context, conditions, and detail needed to use it.
- A code comment explains a non-obvious reason, constraint, or tradeoff rather
  than narrating the code.
- A review comment identifies the problem, trigger, consequence, and proposed
  correction without claiming an unverified cause as fact.
- A pull request description explains the problem, resulting behavior, and
  relevant verification or limitations for a reader without the conversation.

Use `$vp-tldr` when the task requires selecting or rewriting summary content;
apply these writing principles to its result without adding a summary to every
artifact. Read [references/examples.md](references/examples.md) when an example
would help resolve a wording or context decision.

## Check the result

Check that the reader can understand the main point, the necessary context, and
any action or limitation. Confirm that edits preserved the source's meaning and
evidence, that terms are customary and consistent, and that the form fits the
artifact. Return the requested output; add an editing explanation only when it
is requested or helps assess a material change.

## Related skills

- [`vp-tldr`](https://github.com/VdustR/skills/tree/main/skills/vp-tldr)
  when selecting the content and scope of a concise summary.
