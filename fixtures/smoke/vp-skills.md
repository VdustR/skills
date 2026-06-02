# vp-skills Smoke Fixture

## Prompt

Use `$vp-skills` to manage these skill tasks:

- install `vp-skills` from `VdustR/skills`
- update global installed skills
- remove `agent-browser` and `portless`
- inspect what is installed for Codex
- show a table of installed skills and their linked agents
- repair `impeccable` after `update impeccable` fails because the old lock
  points at `skill/SKILL.md`, while fresh discovery shows the skill now lives
  under `.agents/skills/impeccable/SKILL.md`

Assume the user wants the default personal setup unless they say otherwise.

## Expected Behavior

- Use pinned `npx -y skills@1.5.3`.
- Default to global installs with all supported agents: `-g --agent '*'`.
- Preview source contents with `add VdustR/skills --list` when discovery is
  useful.
- Install selected skills with explicit `--skill`, not by relying on prompts.
- Treat `check`, `update`, and `upgrade` as write-capable; do not describe
  `check` as a dry-run.
- Query installed skills with `list -g --json` or `list -g --agent codex`.
- For strict agent inventory, use `list -g --json` or
  `scripts/skill-agent-table.mjs`; do not rely on human `list --agent` output
  as the only filter.
- Remove only the requested skills:
  `remove agent-browser portless -g --agent '*' -y`.
- Avoid `remove --all` unless the user explicitly asks to remove everything.
- Repair the stale `impeccable` lock by fresh discovery and reinstall:
  `add pbakaus/impeccable --list`, then
  `add pbakaus/impeccable --skill impeccable -g --agent '*' -y`, then
  `update impeccable -g`.

## Regression Coverage

- all-agent default uses quoted `--agent '*'`
- `check` is not treated as a dry-run
- stale lock path failures are repaired by rediscovery and reinstall
- removal avoids destructive `--all`
- query workflows prefer `list --json`, `list --agent`, `find`, or `add --list`
- agent inventory tables are based on JSON `agents` data
- skill-specific installs use explicit `--skill`
