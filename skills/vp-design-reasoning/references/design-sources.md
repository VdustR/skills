# Research and Design Boundaries

Interaction sources reviewed on October 15, 2026; broader modeling sources
reviewed on October 17, 2026. These sources informed the workflow; they are not
additional runtime dependencies. Recheck current upstream guidance before
adopting a later change. Recommendations below are this skill's synthesis,
not a claim of endorsement or universal agreement.

## Existing skills and responsibilities

| Source | Useful contribution | Boundary for this skill |
| --- | --- | --- |
| [Impeccable](https://github.com/pbakaus/impeccable), including the installed 4.5.2 shape and harden references | Product context, surface-specific intent, visual craft, states, edge cases, bounded verification | Compose with it for frontend work; share discovery and evidence instead of duplicating its process or visual rules |
| [Anthropic frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Subject-specific direction, deliberate hierarchy, task-oriented copy, self-critique | Leave aesthetic choices to the brief and visual skill; adopt no fixed palette or typography |
| [Vercel web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) and its [interface guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md) | Semantic controls, focus, forms, navigation, input and content resilience | Use relevant platform checks; avoid blanket URL synchronization, arbitrary dataset thresholds, or universal casing rules |
| [VS Code design philosophy](https://github.com/microsoft/vscode/blob/main/.github/skills/design-philosophy/SKILL.md) | Evaluate hierarchy and consistency with explicit questions and concrete examples | Its product-specific spacing, radii, tokens, and visual preferences are not defaults for other products |

For example, the reviewed Vercel guidelines recommend title case for headings
and buttons, while the reviewed Anthropic and VS Code guidance favors sentence
case. Follow the product's voice, supported language, and conventions. Resolve
conflicts by the requested outcome and applicable instructions, not by merging
every recommendation into one checklist.

## Primary usability and accessibility guidance

- [NN/g: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
  supports familiar language, visible status, consistency, user control, error
  prevention, and recovery. These are evaluation principles, not proof that a
  particular audience understands an interface.
- [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
  distinguishes primary needs from optional detail. Apply it without hiding
  information necessary for an informed decision.
- [GOV.UK: Map and understand a user's whole problem](https://www.gov.uk/service-manual/design/map-a-users-whole-problem)
  informs intent and journey coverage across entry, completion, and return.
  Understanding the wider journey does not authorize rebuilding all of it.
- [W3C: Understanding SC 3.2.2, On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
  addresses unexpected changes of context when a control's setting changes.
  It does not prohibit every automatic content update.
- [W3C: Understanding SC 4.1.3, Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  explains how status messages can be programmatically available without
  receiving focus. Do not announce every update or apply one live-region
  pattern indiscriminately.

## Modeling and scenario sources

- [C4: Abstractions](https://c4model.com/abstractions) and
  [Diagrams](https://c4model.com/diagrams) inform consistent abstraction levels
  and selecting useful views. C4 supports communicating structure; it does not
  establish runtime correctness or require every diagram level.
- [SEI: Scenario-Based Analysis of Software Architecture](https://www.sei.cmu.edu/library/scenario-based-analysis-of-software-architecture/)
  informs exercising architectures against relevant quality goals.
- [SEI: Reasoning About Software Quality Attributes](https://www.sei.cmu.edu/library/reasoning-about-software-quality-attributes/)
  informs making quality requirements concrete through scenarios. This skill
  does not claim to conduct a formal SEI evaluation or impose its workshops.
- The GOV.UK whole-problem guidance above supports examining handoffs across
  organizations. Wider discovery does not authorize changing other teams' work.

## Scope decisions

The common workflow covers concept definitions, process ownership and handoffs,
architecture responsibilities and contracts, and user interaction behavior.
Domain-specific evidence remains necessary: a counterexample can challenge a
concept, but cannot establish a system's performance or an interface's usability.
Concept prompts are this skill's synthesis, not a standardized modeling notation.

Agent tool selection, standalone branding, and static artwork retain separate
workflows. Technology selection hands off to vp-stack-selection. UI reasoning
retains its detailed state, content resilience, and recovery references and
composes with Impeccable for frontend work only.

Keep broad coverage in discovery, then choose risk-relevant verification.
Do not equate exhaustive enumeration with every possible environment
combination, add unsupported capabilities to satisfy a checklist, or let
information completeness turn into excessive on-screen explanation.
