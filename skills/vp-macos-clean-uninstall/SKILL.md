---
name: vp-macos-clean-uninstall
description: >-
  Research, plan, and perform a clean macOS application or CLI uninstall,
  including optional residue review. Boundary: macOS only; do not remove
  SIP-protected system components or unrelated browser data.
---

# Clean Uninstall On macOS

An uninstall is destructive. Identify ownership first, prefer the official
uninstaller, and separate application removal from optional user-data cleanup.

## Workflow

1. Resolve the exact product, installation method, active processes, services,
   extensions, and user or system scope.
2. Consult current official uninstall guidance.
3. Scan likely residue and classify each path by confidence, ownership,
   recoverability, and user-data risk.
4. Present an exact removal plan. Require approval before deletion or package
   manager writes.
5. Use recoverable removal where practical and execute only approved targets.
6. Verify absence without treating unrelated same-name files as residue.

Use the bundled detection scripts as evidence helpers, not deletion authority.
Stop when ownership is ambiguous, the product protects its own data, or removal
would affect other applications or accounts.

## Related skills

- [`vp-long-running-processes`](https://github.com/VdustR/skills/tree/main/skills/vp-long-running-processes)
  for identifying or stopping application-owned processes before removal.
