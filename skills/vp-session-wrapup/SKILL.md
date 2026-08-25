---
name: vp-session-wrapup
description: >-
  Close out an agent session: summarize the outcome and open items, then find
  leftover state such as scratch files, uncommitted or unpushed Git work,
  running services, staged secrets, and temporary configuration. Use when the
  user ends, wraps up, hands off, or archives a session, including a
  conditional request to clean up whatever carries no risk. Boundary: use
  vp-retro for workflow improvement analysis.
---

# Session Wrap-Up

Leave the session archivable: nothing important unrecorded, and nothing hidden
still running, staged, or half-finished.

## Report

Summarize the outcome, not the transcript: what changed, what is verified and
what is only assumed, decisions worth keeping, where the work lives, and the
next action for whoever resumes it.

Then inventory what this session created or started that outlives it, derived
from the session's own actions rather than a fixed checklist. Common sources:
Git and pull request state, scratch files and logs, processes and background
jobs, secret material, external or shared writes, and configuration changed
only to unblock the task.

## Cleanup

Remove an item only with evidence that this session created it, that it holds
no unique work, and that it can be reproduced. Name what will be removed before
removing it, and verify the result.

Report instead of removing when the item predates the session, holds unfinished
work, is shared or remote, is hard to reverse, or has unclear ownership.
Uncertainty is a reason to report. For secret material, prefer unstaging and
reporting, and leave credential files to the user.

Wrap-up closes work; it does not start new work. Record a newly found problem
as a follow-up.

## Related skills

- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for Git
  and pull-request state found during closeout.
- [`vp-long-running-processes`](https://github.com/VdustR/skills/tree/main/skills/vp-long-running-processes)
  for services that must be stopped or left running intentionally.
- [`vp-env-secrets`](https://github.com/VdustR/skills/tree/main/skills/vp-env-secrets)
  for staged or temporary secret material.
- [`vp-agent-browser-session`](https://github.com/VdustR/skills/tree/main/skills/vp-agent-browser-session)
  for managed browser sessions and profiles.
- [`vp-retro`](https://github.com/VdustR/skills/tree/main/skills/vp-retro) when
  the user also wants workflow improvement analysis.
