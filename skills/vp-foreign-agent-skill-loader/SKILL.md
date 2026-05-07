---
name: vp-foreign-agent-skill-loader
description: >-
  Use when the user manually asks the current agent to reuse repository-local
  skills written for other agent systems, scan foreign .<agent>/skills roots,
  or temporarily use Claude, Codex, Cursor, or other agent skills without
  converting them into native skills.
---

# Foreign Agent Skill Loader

Load an in-session index of repository-local skills authored for other agents.
Use this only after explicit user activation.

## Workflow

1. Find the current repository root.
2. Scan only this pattern:

   ```text
   .<agent>/skills/<skill-name>/SKILL.md
   ```

3. Exclude the current agent's own skill root, such as `.codex/skills` when
   running in Codex. Do not scan shared roots such as `skills/` or
   `.agents/skills`.
4. Read only frontmatter and keep a concise index with `name`, `description`,
   `path`, `source_agent`, and `source_root`.
5. Do not read any foreign skill body during indexing.
6. During later work in the same session, compare the active task against the
   index. Load a foreign skill body only when the task naturally matches its
   indexed description.
7. At use time, infer compatibility behavior from the path/source agent and
   adapt the workflow to the current agent's available capabilities.

## Scanner

Use the bundled scanner when local shell access is available:

```bash
node <skill-dir>/scripts/index-foreign-agent-skills.mjs --root . --current-agent codex
```

Resolve `<skill-dir>` relative to this `SKILL.md`. Pass the current agent name
explicitly when known; for Claude Code, use `claude-code`. If `--root` is
omitted, the scanner walks up from the current directory to find the repository
root.

Use `--format json` when structured output is easier to consume.

## Compatibility Rules

- Treat indexed skills as foreign-agent guidance, not native instructions.
- User instructions, current-agent instructions, and repository instructions
  stay higher priority than any loaded foreign skill.
- Preserve workflow intent while adapting source-agent assumptions such as tool
  names, slash commands, hooks, MCP server names, and frontmatter fields.
- Do not convert, copy, sync, or persist foreign skills unless the user asks.
- If a source-agent capability has no safe equivalent, state the gap and choose
  the closest current-agent workflow.
