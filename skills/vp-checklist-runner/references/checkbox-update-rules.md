# Checkbox Updates

Editing checklist state is an external write. Require authorization, fetch the
latest source immediately before editing, and preserve all non-checkbox
markdown.

## Rules

- Change only the marker of items with passing evidence.
- Do not reorder, rewrite, normalize, or reformat the surrounding document.
- Preserve indentation, nested lists, line endings, and unrelated checkbox
  states.
- If the source changed after verification, reconcile or re-verify instead of
  overwriting.
- Do not uncheck an item merely because local evidence is unavailable; report
  the uncertainty unless the user explicitly requests correction.
- Use stable source identifiers when the platform supports them.

After writing, re-fetch and compare the intended checklist region. Report every
changed item and leave failed, blocked, manual, and ambiguous items untouched.
