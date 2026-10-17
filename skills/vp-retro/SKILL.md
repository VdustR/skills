---
name: vp-retro
description: >-
  Reflect on a recent agent session to find evidence-backed improvements to
  collaboration, instructions, skills, or workflow. Classify recurrence, reuse
  value, audience, and lifetime before recommending where a fix belongs.
  Boundary: not a code or PR review.
---

# Session Retrospective

Start from observed friction, corrections, repeated work, uncertainty, and
successful shortcuts. Distinguish a one-off event from a reusable pattern.

Use available evidence first; ask only questions that change the recommendation.
Do not infer a recurring failure from one incident or describe a suspected cause
as established. A single event can expose a reusable defect in an instruction;
explain that distinction rather than requiring repeated harm before fixing it.

## Classify before recommending

For each candidate, establish:

- **Recurrence:** one-off mistake, demonstrated recurring pattern, or unknown.
  Cite the observed event or repeated examples.
- **Reuse value and lifetime:** whether the correction helps future tasks and
  whether it is temporary or durable. Keep temporary recovery steps with the
  current task rather than turning them into permanent rules.
- **Scope and audience:** this task, this repository, this user across projects,
  or a reusable workflow. For repository guidance, distinguish a personal repo,
  a team repo, and a community or public repo. Ownership alone does not make a
  personal preference useful to every contributor.
- **Destination:** choose the narrowest effective location using
  [references/dimensions.md](references/dimensions.md). Check the current source
  for an existing rule, stale information, or an incorrect instruction before
  proposing another rule.

## Separate the outcomes

**User actions:** recommend only feasible actions with a supported path to the
desired result. State what the user can do, what it improves, and any missing
prerequisite. A problem statement or vague instruction to "be more careful" is
not an actionable recommendation. Omit ineffective advice; label unresolved
diagnosis as an evidence gap instead of presenting it as a solution.

**Agent improvements:** identify outdated or incorrect skills and AGENTS.md
guidance, then strongly recommend correction when evidence, impact, reuse value,
and feasibility justify it. Name the exact target, proposed correction, expected
benefit, and a representative check. For private or user-specific learning that
does not belong in shared guidance, prefer the agent's own local memory over
AGENTS.md or CLAUDE.md. Memory is still persistent state, requires authorization,
and must follow the client's supported write mechanism.

Keep observations with no worthwhile action separate from recommendations. It
is valid to conclude that no persistent enhancement is warranted. Present strong
recommendations first and distinguish proposals, authorized changes, and verified
results. Approval to analyze a session does not itself authorize applying its
findings. Preserve existing authorization, including an applicable
auto-development request; do not ask again for changes it already covers.

Recommend changes only when the expected benefit exceeds the added context and
maintenance cost. Prefer deleting or narrowing guidance over adding another
duplicate rule. Do not update instructions, skills, or memory without explicit
authorization.

Read `references/dimensions.md` for placement criteria and analysis lenses, and
`references/subagent-guide.md` only when delegated evidence gathering is useful
and permitted.

## Related skills

- [`vp-session-wrapup`](https://github.com/VdustR/skills/tree/main/skills/vp-session-wrapup)
  when the session needs operational closeout in addition to reflection.
