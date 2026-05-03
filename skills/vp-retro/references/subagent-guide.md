# Subagent Deep-Dive Guide

When the user selects an observation for deep-dive, spawn a subagent to research it thoroughly. This guide defines the universal behavior for all subagents, plus dimension-specific guidance where relevant.

## Universal: Research → Analyze → Design → Present

Every deep-dive follows this cycle:

### 1. Research

Investigate the observation concretely:
- Scan relevant files, conventions, documentation in the repo
- Check if the repo already has rules, patterns, or agent instruction entries that relate
- Search community for related skills, tools, or known solutions if relevant
- Read actual code and config, don't guess

### 2. Analyze

Identify root cause and context:
- Why did this happen? (missing docs, unclear convention, tool limitation, knowledge gap)
- Is this repo-specific or a personal preference?
- Is there existing documentation that was missed or is unclear?
- How often is this likely to recur?

### 3. Design Solutions

Propose concrete, actionable options:
- Each option must be something the user can do right now, not "consider doing X someday"
- Always include a "skip / do nothing" option with honest reasoning for when that's appropriate
- Consider the effort-to-value ratio of each option

### 4. Present to User

Use the standard option format:

```
**Option A: [Name]**
- Description: What this option does
- Difference: How it differs from other options
- Example: Concrete example of what the change looks like
- Recommendation: [Weak / Moderate / Strong] — reasoning
```

Always include a recommendation with reasoning. The user makes the final call. After presenting, your task is complete.

## Dimension-Specific: Correction Analysis Chain

Applies to **correction-analyzer** and **practice-discoverer** observations.

When analyzing a correction or undocumented good practice:

1. **Determine type** — naming convention, architecture pattern, tool usage, workflow preference, etc.
2. **Scan the repo** — does a consistent convention already exist in the codebase?
   - **Convention exists + documented** → Why wasn't it followed? Check if the documentation is unclear, the skill description doesn't trigger properly, or examples are insufficient
   - **Convention exists + not documented** → Suggest where to document it: repo `AGENTS.md`, the agent-specific adapter file, or as a skill improvement
   - **No consistent convention** → Suggest establishing one, and whether it belongs in the repo (team convention) or personal config (individual preference)
3. **For positive discoveries** (practice-discoverer): same chain — the practice worked well but isn't documented, suggest codifying it before the next session forgets

## Dimension-Specific: Skill Ownership Detection

Applies to **skill-auditor** observations.

Before suggesting changes to a skill, determine who maintains it:

- **Self-maintained**: Skill path is under the user's own skills repository or personal skills directory, or the skill metadata lists the user as author → suggest direct improvements (better description, add checklist, improve examples)
- **Organization-maintained**: Same org but different author → suggest internal issue or PR, coordinate with the team
- **Community-maintained**: External author → suggest filing an issue, submitting a PR, or finding an alternative; don't suggest editing their files directly
