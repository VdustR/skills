---
name: vp-long-running-processes
description: >-
  Manage long-running processes safely: find reusable instances before starting
  new ones and decide carefully before stopping anything. Use when about to
  start a dev server, watcher, preview server, browser session, or background
  agent; when a port is already in use or EADDRINUSE appears; when checking
  whether a server is already running; or when asked to stop, kill, or restart
  a process. Boundary: not for one-shot commands that exit on their own.
---

# Long-Running Processes

Reuse before spawning; confirm before killing.

## Find Existing Instances

Find processes by project path instead of guessing ports. On macOS, use
full-width process output so long commands are not truncated:

```bash
ps -ewwo pid,args 2>/dev/null | grep -F "/current/project" | grep -v grep
```

If a matching process is found, inspect its listening ports:

```bash
lsof -p <PID> -a -iTCP -sTCP:LISTEN -Fn -P 2>/dev/null | grep '^n'
```

## Detection Rules

- Use port-based detection only when the port is read from config or process
  output, not guessed.
- For watchers that do not listen on a port, search by process name and
  project path.
- For browser sessions, check existing pages or tabs before opening a new one
  when the platform exposes browser state.
- For background agents or asynchronous jobs, check whether related work is
  already running before starting another instance.

## Stopping And Restarting

- Do not stop, kill, or restart a long-running process without user
  confirmation unless the user explicitly requested shutdown or restart.
- If an existing process belongs to another project, report its command,
  path, and port (if known) before deciding what to do.
