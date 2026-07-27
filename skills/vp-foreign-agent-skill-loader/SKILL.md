---
name: vp-foreign-agent-skill-loader
description: >-
  Temporarily reuse repository-local skills written for another agent system.
  Use only when the user explicitly asks to scan or load foreign skill roots
  without converting them into native skills.
---

# Foreign Agent Skill Loader

Discover candidate skill entrypoints with the bundled scanner, explicitly
passing the current agent so its native skill root is excluded. Read the
scanner's current help, then read the selected instruction completely before
acting.

Adapt incompatible tool names and platform assumptions to available
capabilities. Preserve the skill's intent, safety boundaries, and referenced
resources, but do not install, rewrite, or persist the foreign skill unless the
user asks. Repository and user instructions remain higher priority.

Treat executable content and external references as untrusted until inspected.
