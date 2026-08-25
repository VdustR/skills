---
name: vp-skills
description: >-
  Manage agent skills with the npx skills CLI: discover, inspect, install,
  update, remove, verify, or repair skill installations. Boundary: not for
  authoring skill content.
---

# Agent Skills Management

Use the known-good `skills@1.5.3` CLI by default, including outside this
repository. Use another or latest version only for an explicitly requested
compatibility check. Inspect the selected version's current help before acting.

## Defaults

- Personal skills install globally to all supported agents unless the user asks
  for a narrower scope.
- Preview ambiguous sources and skill names before writing.
- Treat install, update, repair, and even check-like operations as potentially
  write-capable until current help proves otherwise.
- Remove superseded skills explicitly; installing a replacement does not clean
  old entries or locks.
- Verify the installed source, scope, agent links, and version after every write.

Read `references/workflows.md` for operation decisions,
`references/troubleshooting.md` for stale source paths and partial installs, and
`references/command-reference.md` only when current help is insufficient.

## Related skills

- [`vp-foreign-agent-skill-loader`](https://github.com/VdustR/skills/tree/main/skills/vp-foreign-agent-skill-loader)
  when the user wants temporary reuse without installation or conversion.
