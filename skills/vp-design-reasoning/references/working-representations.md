# Working Representations

Use a table, diagram, or pseudocode to make a design question inspectable while
forming the model. Select the smallest view that exposes the relevant choices
and relationships. Do not wait until a conclusion is settled to draw it, or
require a visual for a question that a sentence answers clearly.

## Choose by the unresolved question

| Question | Useful representation | Inspect for |
| --- | --- | --- |
| How do options compare against the same needs? | Comparison table | Unequal criteria, unsupported benefits, missing evidence, and material trade-offs. |
| Which result follows from these conditions? | Decision table or decision tree | Overlapping rules, uncovered combinations, unclear precedence, and unknown inputs. State whether rules are exclusive, first-match, or cumulative. |
| Which states exist, and what changes them? | State diagram or transition table | Events, guards, side effects, unreachable states, missing exits, and interruption or recovery paths. A state diagram represents a state model; an unlabeled flowchart does not establish one. |
| Who owns the work before and after each handoff? | Workflow with lanes or grouped actors | Inputs, acceptance, waiting, completion, rejected handoffs, and missing owners. |
| How does someone reach their goal? | User flow | Entry points, choices, feedback, prerequisites, dead ends, cancellation, and return paths. Distinguish what the user knows from the system's actual state. |
| In what order do participants interact? | Sequence diagram | Messages, asynchronous boundaries, competing events, retries, and authority over the final outcome. |
| How are concepts, responsibilities, or data related? | Concept map, architecture view, or entity-relationship diagram | Meaning of relationships, ownership, dependencies, consistent abstraction levels, and unsupported contracts. |
| What does an ordered rule or transformation do? | Pseudocode | Branch order, iteration, mutation, and termination. Keep unestablished operations explicit; pseudocode is not an executed implementation. |

These are choices, not a required set. Add a second view only when it answers a
different material question, and reconcile shared names, states, and boundaries.
A user flow can show what someone does while a sequence diagram exposes a race
between the services handling that action.

## Build, trace, and revise

1. State the question and seed the representation from available evidence.
   Label verified behavior, supplied requirements, proposals, and unknowns where
   their distinction affects a decision. Missing information is not an empty
   state or a negative result.
2. Apply the relevant guidance from
   [vp-clear-writing](https://github.com/VdustR/skills/tree/main/skills/vp-clear-writing):
   its `references/visual-explanations.md` covers view selection and presentation;
   `references/tables-and-pseudocode.md` covers comparable columns, rule semantics,
   and ordered logic. Use consistent names and explicit relationship labels so
   the working model can be checked before it becomes a deliverable.
3. Trace a concrete ordinary case and the relevant boundary, failure, or competing
   case. Check what each row or edge assumes, who owns the next step, and what
   evidence establishes the result. For user-facing behavior, check what the
   user can infer and do at that point as well as what the system has done.
4. Turn a contradiction or gap into a specific question or design decision.
   Inspect the owning source or compare viable proposals, then update the model
   and retrace the affected cases. Leave unresolved contracts visible; do not
   complete a diagram by inventing a guarantee.
5. Choose what the requested answer needs. A compact working table may be enough
   for analysis; a final explanation may need a diagram, selected rows, or only
   prose. Keep consequential conditions and unknowns even when omitting a view.

An editable text table or diagram source is sufficient to begin modeling; a
renderer installation is not a prerequisite. Use clear-writing's destination
and rendering guidance when delivering a visual. Syntax or visual polish does
not establish correct behavior, and a walkthrough is not runtime or user evidence.
Modeling grants no authority to execute the represented operations.

## Example: cancellation and completion

Suppose the supplied contract says a running export accepts cancellation requests
and a worker confirms when it stops. It does not define what happens when the
worker completes while cancellation is pending. This illustrative transition
table exposes the missing rule:

| Current state | Event | Result supported by the brief |
| --- | --- | --- |
| Running | Cancellation request accepted | Cancellation pending; stopping is not yet confirmed. |
| Cancellation pending | Worker confirms it stopped | Canceled. |
| Cancellation pending | Worker reports completion | Unknown: the brief does not establish which outcome wins. |

The last row raises a contract question about event ordering and who establishes
the final result. Resolve it against the implementation or propose an explicit
rule when design changes are authorized. Renaming the state or drawing an arrow
to Canceled cannot establish that cancellation won. The table is a working
model of supplied premises, not evidence that an export service was tested.
