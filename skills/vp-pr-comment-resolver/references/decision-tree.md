# Decision Tree

For each feedback item:

1. Does it still apply to the current head?
   - If not, identify whether it was already handled or became obsolete.
2. Is the underlying claim correct?
   - If uncertain, gather evidence or ask before replying.
3. Is a change required and within scope?
   - If yes, implement and verify the smallest coherent fix.
   - If no, prepare a concise evidence-backed explanation.
4. Is the author a bot, human, or ambiguous?
   - Resolve handled bot review threads. Human threads require explicit user
     direction.
5. Is this a review thread, submitted-review body, or PR conversation issue
   comment?
   - Reply to a review thread or PR conversation issue comment directly.
   - For a submitted-review body, reply in the PR conversation and identify and
     link the review because GitHub has no top-level review reply mutation.
   - Submitted reviews and PR conversation issue comments cannot be resolved.

Pause for disagreement, multiple valid product interpretations, architectural
scope expansion, or history rewriting.
