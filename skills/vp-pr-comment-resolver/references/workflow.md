# Workflow

## Establish The Review Snapshot

Record the PR, current head commit, base, author, draft state, and retrieval time.
Fetch unresolved review threads and relevant PR discussion comments. Include
author type, body, location, timestamps, outdated state, replies, and resolution
state.

Do not ignore:

- outdated but unresolved threads;
- discussion comments at the bottom of the PR;
- later replies that may already answer an earlier comment;
- reaction-only bot signals when the repository uses them for review state.

## Build A Decision Queue

For each feedback item, record:

- source surface and stable identifier;
- author class and confidence;
- current-code location;
- requested outcome;
- decision and supporting evidence;
- intended change, verification, reply, and resolution action.

Group implementation by coherent change topic, but keep replies mapped to their
original feedback.

## Execute

Before editing, verify the local checkout matches the recorded PR head or create
a safe matching checkout with the required authorization. If the head changed
since retrieval, refresh the queue. Apply focused fixes, run proportionate
verification, inspect the complete diff, and commit only when authorized.

For fixes, push only when authorized and verify the PR's remote head contains the
commit before replying or resolving. If the fix is not on the PR head, leave the
thread open and report the pending push.

Reply after the evidence exists. Resolve handled bot review threads; leave human
threads open for the reviewer unless the user explicitly directs otherwise. PR
discussion comments cannot be resolved.

## Reconcile

Re-fetch the PR after writes. Confirm replies landed on the intended surface,
eligible bot threads are resolved, human threads remain open, checks refer to
the current head, and no new feedback appeared.

Report outcomes by feedback kind and decision, commits and verification,
resolved versus remaining threads, and anything requiring user judgment.
