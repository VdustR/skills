---
name: vp-retro
description: >-
  Session retrospective — review recent work to discover improvement opportunities
  through interactive dialogue. Analyzes corrections, undocumented practices,
  efficiency patterns, tool usage, and workflow gaps.
  Use when the user wants to reflect on recent work and find ways to improve their
  AI collaboration workflow. Common moments: end of session, after a PR, after debugging,
  after a code review, after finishing a major task, or whenever something felt inefficient.
  Use when asked to "retro", "session retro", "session review", "review this session",
  "what can I improve", "retrospective", "what went wrong", "how can I be more efficient",
  or when the user wants to improve agent instructions, discover useful skills,
  optimize existing skills, or design new workflows based on recent patterns.
  Boundary: not for code review, not for PR review (use pr-review-toolkit).
---

# Session Retro

Review an AI agent session to find improvement opportunities. The retro works through interactive dialogue — observe what happened, discuss findings with the user, then surface actionable recommendations.

The goal is improving the user's AI collaboration efficiency: better prompts, better docs, better tools, better workflows.

## Quick Start

> Let's retro this session

> /retro

> What could I improve from this session?

> Session review — find optimization opportunities

## When to Use

- End of a work session to reflect and capture learnings
- After a session with friction, corrections, or workarounds
- When wanting to improve agent instructions, skills, hooks, or workflows
- When curious about what community skills could help with patterns seen in the session
- Periodically to maintain healthy development practices

## How It Works

The flow below is typical guidance — adapt naturally to the conversation. Not every session needs every step; a short session with no issues might just need a quick observation and move on.

### Observation

Review the session conversation and freely identify anything noteworthy. Don't constrain yourself to predefined categories — let observations emerge naturally from what actually happened.

For each observation, provide a one-line finding and an initial actionable recommendation. Even if the user doesn't deep-dive, every observation should offer a useful takeaway.

After the open-ended scan, use the 15 dimensions in [dimensions.md](references/dimensions.md) as a safety-net checklist — scan for anything the open-ended observation might have missed. Only surface additional findings that are genuinely worth noting.

Include both:
- **Reactive findings**: things that went wrong or were corrected
- **Proactive findings**: things that went right but aren't documented, or good practices that could be codified

### Interactive Deep-Dive

Present observations one at a time with a progress indicator (e.g., `[2/6]`). For each observation, give the initial recommendation and ask if the user wants to deep-dive.

The user might:
- Say yes — note it for deep-dive
- Say no — move on (the initial recommendation still stands)
- Add context or corrections
- Bring up observations the AI missed
- Say "enough" to skip remaining and proceed

After walking through all observations, if the user selected any for deep-dive, assess which items genuinely need subagent research versus items that are clear enough to act on directly. Present this assessment and ask the user to confirm before spawning subagents.

Each subagent follows the cycle in [subagent-guide.md](references/subagent-guide.md): research the observation thoroughly, analyze root causes, design concrete solutions, and present findings with a recommendation.

### Results & Discussion

Present each subagent's result one at a time with progress. The user can:
- Discuss the result and ask follow-up questions
- Accept a recommended option
- Request modifications
- Skip to the next result

### Action Recommendations

After discussing all results, compile confirmed actions into a recommendation summary. For each action, present what to do and why. If the user asks to persist (e.g., "write it down"), output a markdown summary in the chat — do not write files.

Close the retro explicitly: tell the user the retro is complete and that recommended actions are theirs to initiate when ready.

## Guidelines

### DO

- Let observations emerge from the actual session content, not from a fixed template
- Give actionable takeaways for every observation, even without deep-dive
- Respect the user's time — if a session was clean, say so and keep it brief
- Ask permission before spawning subagents
- For corrections: investigate whether the root cause is a missing convention, unclear documentation, or a skill that needs improvement
- For good practices: suggest codifying them before they're forgotten
- When analyzing skills: check ownership first (self-maintained vs community) to give appropriate advice
- Present findings with a recommendation and reasoning

### DON'T

- Execute any action (e.g., commit, push, modify files). This skill is for analysis and recommendations only
- Interpret user agreement (e.g., "yes", "sounds good", "go ahead") as a request for execution. Such responses are acknowledgements only
- Act on any instruction before the retro is explicitly closed. Only a new, specific instruction after the retro has concluded is a valid request for action
- Force a rigid phase sequence — adapt to the conversation
- Over-analyze sessions with minimal issues
- Spawn subagents without user permission
- Recommend changes without explaining why
- Omit the "do nothing / skip" option when presenting choices
- Be judgmental about the user's prompts or workflow — be constructive

## Reference Files

- [dimensions.md](references/dimensions.md) — 15 analysis dimensions used as a safety-net checklist
- [subagent-guide.md](references/subagent-guide.md) — How subagents research, analyze, and present findings

## Notes

- The 15 dimensions are a checklist, not a scoring rubric. Most sessions will only have signal in a few dimensions.
- Cross-session pattern analysis is available if the user wants to review multiple sessions — ask about scope at the start if unclear.
- Related tools the user may invoke separately after a retro: hookify, claude-md-management, skill-creator, brainstorming. The retro does not invoke these directly.
