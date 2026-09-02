---
name: vp-issue-investigator
description: >-
  Investigate a suspected software problem, decide whether it is real and still
  relevant, find related issues, and prepare or file an evidence-backed issue.
  Use for findings from repository scans, bug reports, regressions, or problems
  discovered during development. Boundary: establishes and records the problem;
  use an implementation workflow to fix it.
---

# Issue Investigator

Decide whether a suspected problem is real, then record a conclusion or file an
issue when requested. Follow repository instructions and the user's preferred
research, writing, and GitHub skills.

## Investigation

1. Establish the observed behavior, expected behavior, affected scope, and
   current relevance from primary evidence. Separate verified facts, reported
   claims, inference, and unknowns.
2. Decide whether the finding is a real problem. Check for intended behavior,
   stale assumptions, environmental causes, duplicates, prior fixes, and a
   reasonable explanation that makes the report invalid.
3. Search open and closed issues, pull requests, releases, and relevant history.
   Identify duplicates and related work without treating a similar title as the
   same cause.
4. Reach one explicit disposition: confirmed, likely, invalid, already fixed,
   duplicate, or blocked by missing evidence. Record what would change an
   uncertain disposition.

Do not require a root cause before recording a confirmed user-visible problem.
Do not claim severity, production impact, affected versions, or causality beyond
the evidence.

## Issue

When filing is requested and permitted, open the issue in the repository that
owns the affected code or in the user's chosen internal tracker. For a
third-party problem, record it on the user's side first; do not post to the
third-party tracker without separate authorization.

Write for a maintainer who needs to decide or act quickly:

- Open with a concise TL;DR stating the problem, impact, evidence status, and
  next action.
- Use short sections and bullets where they improve scanning. Include only the
  context, evidence or reproduction, expected and actual behavior, scope, and
  links needed to decide or implement.
- Link duplicates and related work, and explain the relationship briefly.
- Preserve uncertainty and name missing verification instead of filling gaps.

Before writing externally, show or verify the final target and content when the
host's authorization rules require it. Read the created issue back and report
its URL and any gap between the intended and rendered result.

When a local screenshot, recording, diagram, or other file is material evidence
for the issue, route its publication through `vp-github` even if the filing
request did not separately say to upload it.

## Related skills

- [`vp-tldr`](https://github.com/VdustR/skills/tree/main/skills/vp-tldr) for the
  opening summary.
- [`no-ai-slop`](https://github.com/petergyang/no-ai-slop/tree/main/skills/no-ai-slop)
  for editing the issue body.
- [`vp-minimal-repro`](https://github.com/VdustR/skills/tree/main/skills/vp-minimal-repro)
  when a repeatable reproduction would materially improve the evidence.
- [`vp-github`](https://github.com/VdustR/skills/tree/main/skills/vp-github) when
  local evidence should be attached to the issue.
- [`vp-autodev`](https://github.com/VdustR/skills/tree/main/skills/vp-autodev)
  when the confirmed issue should proceed through implementation and delivery.
