# Working Representation Verification

Observed November 2, 2026, Asia/Taipei, against the working-representation change
based on the [main baseline commit](https://github.com/VdustR/skills/commit/005f46b632771a64e2a6e0aeab94004ff7b94106).
Scenario numbers refer to
[the design-reasoning fixture](vp-design-reasoning.md#working-representation-scenarios).

## Independent agent trials

Two agents received separate ordinary design requests, raw briefs, and isolated
copies of the changed design-reasoning and clear-writing skills. Their task
directories contained no evaluation criteria or expected answers. Neither
received the parent discussion, proposed solution, or a request to compare skill
versions. The maintainer inspected the generated artifacts rather than treating
the agents' completion messages as verdicts.

| Request | Observed artifact behavior | Result and limit |
| --- | --- | --- |
| Export policy, case 20 | The review used a scenario/result/consequence table, explicitly stated that rows were not a first-match rule order, and marked grace eligibility and legal-hold precedence unresolved. It distinguished Legal Reviewer capability from ordinary roles and retained the missing authorization rule for queued work. Proposed denials and record scopes were labeled as proposals. | Covered the ambiguous and conflicting rule cases without inventing existing policy. This was a design artifact, not executable authorization or legal validation. |
| Support escalation, cases 22–23 | The design included a gap/consequence/correction table, ownership alternatives, state transitions, customer information by phase, and scenario traces. It retained Support accountability, distinguished sending from acceptance and technical completion from resolution, and labeled new closure rules as proposals. A separate stakeholder note contained 141 words of plain prose, with no table or diagram. | Covered handoffs, rejection, competing closure/acceptance, return visits, and final-format separation. The brief explicitly requested a working model but did not prescribe its form. No implementation or customer comprehension was tested. |

Representative output from the policy review:

> Rows describe scenarios, not a first-match implementation order.
> “Unresolved” is not an authorization grant or an established denial.

Representative output from the escalation design:

> All rules below that fill a gap in the brief are proposed requirements,
> not existing guarantees.

These outputs support the intended decisions in two bounded tasks. They do not
measure improvement over the previous instructions, establish how every model
will select a skill, or prove an internal reasoning sequence from the order of
the final artifact. The representations and their explicit scenario traces are
the observable evidence.

## Maintainer manual walkthroughs

| Case | Decision reached | Evidence limit |
| --- | --- | --- |
| 3: narrow draft-button edit | Use “Save draft” for the local-draft action and preserve the separate Publish action. The simple distinction needs no separate diagram, renderer, or page redesign. | Manual application of the narrow-scope rule, not an independent agent trial. |
| 12 and 18: consequential live operations | Complete the model or controlled-test proposal; defer a real purchase, customer-record deletion, migration, or deployment without authority. Diagramming an operation grants no execution permission. | Authorization decision walkthrough only; no live operation exercised. |
| 21: cancellation race | A transition table distinguishes accepted cancellation from confirmed stopping. Completion while cancellation is pending remains an unknown rule to resolve at the owning boundary. | Supplied premises and illustrative state model, not service behavior. |
| 24: writing exposes a model conflict | Reuse the supplied process and correct the sent-versus-accepted distinction through design reasoning. Leave unsupported acceptance or ownership rules explicit, then continue the explanation without repeating completed discovery. | Manual cross-skill handoff walkthrough; automatic routing was not independently tested. |

## Executable checks

- `npm ci --ignore-scripts` used the repository lock and CI install policy.
- `npm run validate` passed: 51 tests, 34 skills, 17 smoke fixtures, and the
  locked `skills@1.5.3` parser compatibility check.
- The skill-creator quick validator passed for both changed skills using a
  temporary `uv` environment with PyYAML 6.0.3; the default Python lacked PyYAML.
- `git diff --check` passed.

These checks establish repository consistency and parser compatibility, not
the design decisions or live behavior described in the scenarios.
