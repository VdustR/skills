# Retrospective Dimensions

Look for evidence in:

- **Intent:** where scope or success criteria were unclear.
- **Evidence:** where claims outran verification or stale state was trusted.
- **Execution:** repeated work, avoidable retries, or poor sequencing.
- **Tools:** missing capability, misuse, or unnecessary ceremony.
- **Context:** duplicated, over-broad, stale, or misplaced instructions.
- **Collaboration:** corrections, interruptions, ownership, and approval timing.
- **Durability:** whether a fix belongs in a prompt, repository rule, skill,
  automation, or nowhere persistent.

Prioritize patterns by recurrence, impact, confidence, and cost of the proposed
change.

## Choose the correction's home

| Evidence and intended use | Preferred location | Placement check |
| --- | --- | --- |
| Isolated execution mistake or temporary workaround | Current task or handoff | Correct the task; persist only if a future decision benefits. Include an expiry or recheck condition for temporary knowledge. |
| Durable repository contract or contributor convention | Repository AGENTS.md or existing repo documentation | Confirm it applies to the repo's audience. Personal repos may carry owner conventions; team and public repos need relevance to their contributors. |
| Reusable procedure or incorrect workflow guidance | The owning skill | Correct the existing source and verify a representative task; avoid copying its procedure into AGENTS.md. |
| Explicit, durable user preference across projects | Personal instructions, if the user wants it enforced there | Confirm cross-project intent. Do not promote an inferred preference into a universal rule. |
| Private context, personal learning, or a narrow agent reminder unsuitable for shared guidance | Local agent memory | Preserve scope, evidence, and freshness limits; follow the operator's memory rules and the client's write mechanism. Do not use AGENTS.md or CLAUDE.md as a private learning log. |
| Uncertain cause, weak benefit, or no feasible effective correction | No persistent change | Report an evidence gap only when it matters; do not invent advice or storage work. |

Repository visibility and ownership inform audience; neither alone determines
placement. A public personal repo can host a reusable skill, while private team
guidance still should not contain one person's incidental preference. Keep
short-lived state out of durable instructions, and keep private evidence out of
shared artifacts even when the correction itself is broadly useful.
