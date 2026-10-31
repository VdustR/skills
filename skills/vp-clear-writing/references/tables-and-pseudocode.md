# Tables and Pseudocode

Choose the form by what the reader must compare or trace. A diagram shows
relationships; a table supports lookup across consistent attributes; pseudocode
makes ordered logic explicit. Combine them only when each answers a distinct
question. Prose explains the takeaway, assumptions, and evidence limits.

## Tables

Use a table when rows share meaningful columns: option/capability comparisons,
parameter or field references, mappings, verified/unknown coverage, state
transitions, or combinations of decision conditions. Introduce its purpose,
give columns specific headings, and keep comparable scope and units.

Choose a decision table when combinations or overlapping rules are easier to
audit as rows than as a branching tree. State whether the rules are exclusive,
first-match, or all-match, and preserve unknown outcomes rather than inventing
defaults. A transition table can expose current state, event/guard, next state,
and side effect; a state diagram is often better for seeing reachability.

Prefer a list for one-dimensional items and numbered steps for a human procedure.
Keep long explanations and code outside cells. Do not turn an argument into a
grid merely to shorten it. Split a wide table or use per-item sections when
narrow screens, long content, or uneven attributes make comparison harder.
An empty cell must not ambiguously mean zero, unsupported, or unverified; label
the relevant distinction. Avoid unexplained check marks and invented scores.

Use native Markdown tables for simple supported destinations; use semantic HTML
when the destination and required header associations call for it. Keep tables
as text/data rather than screenshots. For calculations or a requested workbook,
use the spreadsheet workflow and preserve formulas/data. Markdown does not
replace a recalculating workbook. Validate the rendered/exported result when
available, including headings, wrapping, units, and missing-value labels.

The [Google table guide](https://developers.google.com/style/tables) and
[Microsoft table guide](https://learn.microsoft.com/en-us/style-guide/scannable-content/tables)
support choosing tables by related attributes rather than using them as layout.
Follow the destination's style instead of importing every publisher's formatting
rule. For accessible HTML, [W3C guidance](https://www.w3.org/WAI/tutorials/tables/)
requires structural header/data associations; bold styling alone is insufficient.

## Pseudocode

Use pseudocode for language-independent algorithms, validation/routing rules,
loop behavior, ordered precedence, or data transformations when ordinary prose
hides important control flow. Prefer prose for a simple rule, a diagram for
handoffs/relationships, and actual code for a copyable API or executable example.

State inputs, outputs, relevant preconditions, ordering, and mutation/side effects.
Use descriptive names, consistent indentation, and unambiguous conditions.
Clarify iteration bounds, equality, indexing, duplicate handling, termination,
and error behavior where they affect the result. Keep a missing business rule
explicit; notation must not silently decide it. For async/concurrent logic, mark
what is awaited, what runs concurrently, and who owns completion; indentation
alone does not establish atomicity, ordering, retries, or cancellation guarantees.

Label it **Pseudocode** and use a plain `text` fence unless the destination
supports a specified notation. Do not label approximate logic as TypeScript or
Python merely for coloring. Follow a required notation when supplied; the
[Cambridge guide](https://www.cambridgeinternational.org/Images/697401-2026-pseudocode-guide-for-teachers.pdf)
is one institution's explicit convention for selection, iteration, and procedures,
not a requirement to impose exam syntax on product documents. No extra renderer
is needed to present plain-text pseudocode.

Trace a representative input and a relevant boundary/failure by hand. Say that
this is a walkthrough: it does not execute the code, validate an API, establish
complexity bounds, or prove production behavior. If the reader needs runnable
instructions or implementation proof, supply real version-matched code and use
the implementation/test workflow instead. Keep omissions visibly labeled and
explain their effect, consistent with [code-sample guidance](https://developers.google.com/style/code-samples).

Sources reviewed: 2026-10-31. The selection criteria are a writing synthesis,
not a universal requirement to include a table, a diagram, and pseudocode together.
