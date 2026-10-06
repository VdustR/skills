# Decision Tree

For each feedback item:

1. Does it still apply to the current head?
   - If not, identify whether it was already handled or became obsolete.
2. Is the underlying claim correct?
   - If uncertain, gather evidence. Ask before replying when the remaining
     uncertainty prevents a safe decision or requires human judgment.
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

A request to process or resolve the specified PR's feedback authorizes routine
evidence-backed replies to bots and humans and handled bot-thread resolutions.
Send directly without per-message approval when no material risk or human
decision remains. Read-only, draft-only, and explicit approval constraints still
apply. An evidence-backed correction of an incorrect or already-handled claim
can proceed under the same rule. Pause when evidence cannot settle
a decision required for safe delivery, multiple valid material product
interpretations remain, architecture would change substantially, feedback
reveals a severe risk or substantial scope or cost expansion, or history
rewriting is not already authorized.
