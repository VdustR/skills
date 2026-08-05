---
name: vp-session-wrapup
description: >-
  Close out an agent session before archiving it: summarize what happened and
  what remains, then find and clear leftover state such as scratch files,
  uncommitted or unpushed Git work, running services, staged credentials, and
  temporary configuration. Use when the user says goodbye, wraps up, ends,
  hands off, or archives a session, including conditional requests such as
  clean up anything with no risk. Boundary: use vp-retro for workflow
  improvement analysis.
---

# Session Wrap-Up

Produce a closing report that lets the user archive the session without losing
context or leaving hidden state behind.

## Summary

Cover the outcome, not the transcript: what changed, what is verified and what
is only assumed, decisions worth remembering with their reasons, where the work
lives, and the next action for a session that resumes this work. Keep it short
enough to read at the end of a session.

## Sweep

Derive the inventory from what this session actually did rather than from a
fixed list. Common sources of leftovers:

- Git state: uncommitted, staged, or untracked changes, stashes, temporary
  branches or worktrees, unpushed commits, draft pull requests.
- Files created for the task: scratch and temp directories, logs, dumps,
  backups, downloaded artifacts, generated fixtures, one-off scripts.
- Running things: dev servers, watchers, tunnels, containers, browser
  instances, background agents, scheduled or repeating jobs.
- Sensitive material: exported or staged secrets, temporary tokens,
  authenticated profiles and sessions.
- External or shared state: pushed branches, opened pull requests, issues,
  comments, uploaded artifacts, modified remote resources.
- Temporary configuration: packages installed to unblock the task, toolchain
  pins, agent or editor settings, host and network overrides.

## Judgment

Classify each item, then act:

- Created by this session, reproducible, holds no unique work: remove it when
  the user has authorized risk-free cleanup, and report what was removed.
- Holds unfinished or unique work, is hard to reverse, or predates the session:
  report it with a recommended action and let the user decide.
- Pre-existing, shared, remote, or unclear in ownership: report only.

Uncertainty is a reason to report, not to remove. Verify the result of each
cleanup step instead of assuming it succeeded, and say plainly when something
was intentionally left in place.

Wrap-up closes work; it does not start new work. Record a newly discovered
problem as a follow-up instead of fixing it now.

## Route

Use vp-git for Git and pull request state, vp-long-running-processes for
stopping or restarting services, vp-env-secrets for secret material, and
vp-chrome-profiles for managed browser profiles.
