---
name: vp-long-running-processes
description: >-
  Safely reuse, start, inspect, stop, or restart persistent processes such as
  servers, watchers, browsers, and background agents. Boundary: not for one-shot
  commands that naturally exit.
---

# Long-Running Processes

Identify processes by command, working directory, ownership, and purpose—not by
port alone.

Before starting, look for a healthy reusable instance for the same project.
Before stopping or restarting, establish the exact process tree, dependents,
logs, and user impact, then obtain authorization unless the user already
requested that exact action.

Keep persistent commands detached from the task's blocking execution path and
record where their output can be inspected. Verify service readiness rather than
assuming a live process is healthy. Report conflicts instead of killing unknown
processes.
