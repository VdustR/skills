# Analysis Dimensions

Safety-net checklist for the observation phase. After the open-ended scan, use these dimensions to catch anything that might have been missed. Only surface findings that are genuinely noteworthy — not every dimension will have signal in every session.

## Correction & Discovery

| Dimension | What to look for |
|-----------|-----------------|
| **correction-analyzer** | User corrected AI's output — naming conventions, patterns, approaches, tool choices |
| **practice-discoverer** | AI followed a good practice not documented in agent instructions, rules, or skills |
| **decision-path-analyzer** | Key decisions and trade-offs made during the session; paths explored then abandoned and why |

## Efficiency & Quality

| Dimension | What to look for |
|-----------|-----------------|
| **efficiency-auditor** | Repeated operations, unnecessary file re-reads, wasted back-and-forth, topic switching, session felt too long for what was accomplished |
| **prompt-coach** | Vague prompts causing confusion, missing context that led AI astray, multi-message exchanges that could have been one clear prompt |
| **risk-reviewer** | Near-miss risky operations — force push, secret exposure, skipping hooks, destructive commands without confirmation |
| **git-hygiene-reviewer** | Commit message quality, committing on wrong branch, PR practices, forgotten pushes |

## Tools & Ecosystem

| Dimension | What to look for |
|-----------|-----------------|
| **skill-auditor** | Skills used during the session — trigger accuracy, quality of output, community alternatives that might work better; check ownership before suggesting changes |
| **hook-effectiveness-auditor** | Hooks that fired and helped, hooks that blocked unnecessarily, hooks that should have fired but didn't |
| **orchestration-auditor** | Context window pressure from excessive skill injections, subagent usage effectiveness, tool choice (e.g., using Bash when Grep would suffice) |
| **env-friction-detector** | MCP server timeouts, missing CLI tools, version mismatches, permission errors, environment setup issues |
| **upstream-issue-tracker** | Third-party bugs encountered, documentation that didn't match reality, external service issues |

## Continuous Improvement

| Dimension | What to look for |
|-----------|-----------------|
| **flow-designer** | Repeated manual patterns that could become a skill, command, hook, or automated workflow |
| **knowledge-auditor** | Stale entries in agent instructions or memory files, missing context that should be persisted, handoff gaps for the next session |
| **cross-session-pattern** | Recurring issues seen across multiple sessions — only relevant if the user chose to review multiple sessions |
