---
name: vp-guided-focus
description: >-
  Guided focus questioning to align on requirements before planning or complex tasks.
  Use when asked to "focus first", "ask me questions before planning", "guided focus",
  "help me clarify requirements", "let's align before starting",
  or proactively when detecting complex/ambiguous tasks that would benefit from
  requirement clarification before entering plan mode or execution.
  Always ask the user whether to activate before starting proactively.
  Boundary: not for simple, unambiguous tasks with clear requirements.
---

# Guided Focus

Structured, one-at-a-time questioning to converge on requirements and decisions before planning or execution. Each question presents options with descriptions, trade-off differences, and a recommended choice with reasoning.

## Workflow

### Phase 0: Activation

- **Manual**: User invokes the skill or asks to clarify first
- **Proactive**: When detecting a complex/ambiguous task, ask: "This task has multiple valid approaches. Want to run guided focus first to align on direction?" — proceed only if user confirms
- **Do NOT trigger proactively for**: single-file edits, bug fixes with clear reproduction steps, tasks with explicit requirements, or when the user has already described a clear plan

### Phase 1: Configuration

Defaults (user can override via invocation arguments or during the session):

| Parameter | Default | Override Example |
|-----------|---------|------------------|
| Question count | 10 | a bare number argument (`5`) or `--questions 5` |
| Min options per question | 3 | `--min-options 4` |

### Phase 2: Questioning Loop

Ask questions **one at a time**. Wait for user response before proceeding.

**Question format** (use bullet list, not table — safe for narrow terminals):

```
### Question [current]/[total] — [Topic]

[Context sentence explaining why this question matters]

**A. [Option name]**
- Description: [what this option means]
- Difference: [how it differs from other options]
- Recommendation: Weak / Moderate / Strong

**B. [Option name]**
- Description: ...
- Difference: ...
- Recommendation: ...

**C. [Option name]**
- Description: ...
- Difference: ...
- Recommendation: ...

**Recommended: [letter] — [option name]**: [1-2 sentence reasoning]
```

Recommendation scale: Weak = viable but not ideal, Moderate = good fit, Strong = best fit for this context.

**Question behavior rules:**

- **Dependency awareness**: Adapt subsequent questions based on previous answers. Skip questions that become irrelevant, add questions that become necessary. When adjusting, tell the user: "Based on your answer to Q[N], I'm [skipping Q about X / adding a question about Y] because [reason]."
- **Progress indicator**: Always show `[current]/[total]` and update total if it changes
- **Dynamic adjustment**: May increase or decrease question count based on task complexity, but never exceed 15 questions total. Always inform the user: "I'm [adding/reducing] questions because [reason]. New total: [N]."

**User response flexibility:**

- Select an option (A/B/C)
- Combine options (A+B) — if combined options conflict, explain the conflict and ask the user to choose one or describe a reconciliation
- Provide a free-form answer
- Ask a counter-question for clarification
- Skip and defer: "skip" or "later" — mark as deferred, addressed in Phase 3
- Express confidence level: "B, but not sure" → marked as uncertain in summary
- End early: "enough", "done", or "wrap up" → immediately proceed to Phase 3

### Phase 3: Deferred Question Resolution

If any questions were skipped/deferred during Phase 2:

1. Present all deferred questions in a single list
2. Ask once: "Want to revisit these, or proceed with them marked as undecided?"
3. If revisit → ask each deferred question with context from other answers
4. If proceed → mark all as undecided in summary

### Phase 4: Summary

Generate a structured summary of all decisions:

```
## Focus Summary

**1. [Topic]**: [Decision] [confidence]
**2. [Topic]**: [Decision] [confidence]
...

### Uncertain Decisions
- **[Topic]**: [Decision marked as uncertain] — may need revisiting during implementation

### Undecided
- **[Topic]**: Deferred — [reason or context]
```

Confidence markers: `[confirmed]` | `[uncertain]` | `[undecided]`

### Phase 5: Review & Handoff

After presenting the summary:

1. Ask: "Want to modify any decisions, or add more questions?"
2. If yes → allow edits or additional questions, regenerate summary
3. If no → ask: "Ready to proceed? Options: **plan** (enter plan mode), **execute** (start directly)"

## Guidelines

- **Don't ask obvious questions** — skip questions where the answer is clearly
  implied by context; never ask about facts detectable from the project
- **Reorder freely** — if a user's answer makes a later question urgent,
  reorder (and tell the user, as with any adjustment)
- **Wrap up early** — if requirements are clear before reaching the question
  count, propose to end and proceed to summary

## Notes

- Questions should progress from high-level (scope, goals, constraints) to specific (implementation details, trade-offs)
- The first 2-3 questions should establish context and scope; detailed questions come after
- If the user's project already has constraints (existing codebase, tech stack), detect and incorporate them rather than asking about known facts
