# English Mechanics and Prose Checks

The main skill is language-neutral. The ambiguity checks below concern
English grammar and do not transfer to other languages. The procedure,
pattern, and glossary sections apply in any language. These are checks of
what a sentence can mean, not a controlled vocabulary, and the main skill's
rule still holds: judge the function of a phrase, and do not infer AI
authorship from a pattern.

## Leave no English sentence open to two readings

- Keep "only", "not", and "also" next to the word they change. "Only fails on
  growth" and "fails only on growth" say different things.
- Make every "it", "they", "this", and "which" point at one noun. Repeat the
  noun when in doubt. Do not use "this" or "which" to point at a whole clause.
- Break up a long noun string. "The proto import budget check script" becomes
  "the script that checks the proto-import budget".
- Keep the articles and small structural words. "Remove backup file" reads
  two ways; "Remove the backup file" reads one. Keep "that" in "Ensure that
  the switch is off". Repeat the article in a series when the items are
  separate things: "the client and the host".
- Say which parts "and" or "or" joins when a sentence can group two ways.
  "Both... and", "either... or", and "if... then" are free disambiguators.
- Give each word one meaning and one job in the document. If "check" means
  inspect, do not also use it for restrain. Call each thing by one name.
- Do not drop a verb from the second half of a parallel sentence. "Phase 1
  moves the converters and Phase 2 the runtime" leaves Phase 2 without one.
- Prefer periods to semicolons. Replace a dash used as a connector with a new
  sentence. Make text in parentheses a full grammatical unit or its own
  sentence. Write "a, b, or both" instead of "a/b".
- Delete a trailing "-ing" clause that pretends to explain meaning, such as
  "highlighting the team's commitment", or replace it with the concrete
  consequence.

## Write procedures as instructions

For a how-to step, a runbook, or a command the reader will follow:

- One instruction per sentence. Write it as a command: "Install the
  component", not "the component must be installed".
- Put the condition or warning before the step it guards: "To delete the
  document, click Delete." "If hot oil touches your skin, injuries can occur."
- Use the active voice and name the actor. Passive is acceptable only when
  the actor is unknown or does not matter.
- Put the common case first and the exception after it.
- Do not call a step simple, easy, or quick. If it were, the reader would not
  need the instruction.

Split a sentence that carries two thoughts. Keep a longer sentence that
carries one thought with its condition or consequence. A document in which
every sentence is clipped to the same length hides the relationships between
facts.

## Patterns that add nothing, by what they do to the reader

Each pattern is named by its function. Keep an instance when it carries a real
distinction, uncertainty, or navigation cue; delete it when it only adds drama
or repeats what the text already established.

| Pattern | What it does | Fix |
| --- | --- | --- |
| Binary contrast: "It's not X. It's Y." | Sets up a strawman to make Y land | State Y directly |
| Throat-clearing opener: "Here's the thing", "Let me be clear" | Delays the point | Delete and state the point |
| Faux-insight setup: "What nobody tells you" | Flatters the writer as the lone expert | Let the claim stand alone |
| Colon reveal: "The best part: it learns." | Manufactures drama from a plain fact | Write a plain sentence. Keep a colon that introduces a list, label, quote, or elaboration |
| Importance puffery: "marks a pivotal moment" | Tells the reader how to feel | State the fact and let the reader judge |
| Interpretive metadiscourse: "This distinction matters" | Steps outside the subject to grade it | Show why with support, or delete |
| Weasel attribution: "experts agree", "studies show" | Borrows authority without a source | Name the source or cut the claim |
| Synonym cycling | Makes one thing read as three | Repeat the clear word |
| Dramatic fragmentation: "X. And Y. And Z." | Mimics emphasis | Use complete sentences |
| Fake-profound kicker | Ends on a metaphor instead of the point | End on the last concrete sentence or the next action |
| Summary-recap ending | Restates what the reader just read | Delete |
| Portability failure | A sentence that could move unchanged to another project says nothing about this one | Replace with a fact, mechanism, number, or consequence specific to this subject |

## Settle a term in the project's glossary

When a term is unsettled and the artifact will outlive the conversation,
propose it in the repository's glossary, such as a `GLOSSARY.md` or a terms
section in its documentation, rather than defining it inline in several
places.

## Sources and limits

Reviewed October 27, 2026. These sources supplied specific checks. This
reference selects from them and does not adopt any of them whole.

- [ASD-STE100 Simplified Technical English](https://www.asd-europe.org/standards-specifications/simplified-technical-english/)
  (ASD, Issue 9, 2025, free of charge) supplied the rules on one instruction
  per sentence, the condition before the step, keeping the articles, and one
  meaning per word.
  Its controlled dictionary and fixed sentence-length limits are not adopted.
  The standard was written for aerospace and defence maintenance
  documentation, and this reference takes checks from it rather than
  complying with it.
- [Google developer documentation style guide](https://developers.google.com/style)
  supplied the imperative, active-voice, and condition-first conventions
  for procedures.
- [Peter Yang's no-ai-slop](https://github.com/petergyang/no-ai-slop) (MIT)
  supplied the function-described pattern catalog and the portability test.
  Its list of banned words is not adopted; the main skill judges a phrase by
  its function.
- [Matt Pocock's wait-what](https://github.com/mattpocock/skills/blob/main/docs/productivity/wait-what.md)
  supplied the project-glossary pointer and the observation that naming the
  reader's state ("you lost me") asks for context, while naming the output
  ("be concise") produces clipped text that is shorter and no clearer.
- [pstack `technical-writing`](https://github.com/cursor/plugins/blob/main/pstack/skills/technical-writing/SKILL.md)
  supplied the Global English ambiguity checks.
