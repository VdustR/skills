---
name: vp-checklist-runner
description: >-
  Verify and update checklist items in GitHub PRs or issues. Use when asked to
  run, verify, or check off an existing checklist. Boundary: not for authoring a
  checklist or resolving review comments.
---

# Checklist Runner

Treat every checkbox as a claim that needs evidence, not as a task label that can
be accepted at face value.

## Workflow

1. Resolve the exact PR or issue and confirm the current checklist text.
2. Classify items by verification method and identify ambiguous or manual-only
   requirements.
3. Run the narrowest reliable verification for each item.
4. Update only items with current, reproducible evidence and preserve surrounding
   markdown exactly.
5. Re-fetch the source and report passed, failed, skipped, and blocked items.

Do not infer permission to change checkboxes from a request to inspect them.
Never mark subjective, external, or environment-specific claims as passed
without the required evidence.

Read `references/classification-patterns.md` for item classification,
`references/verification-recipes.md` for evidence patterns, and
`references/checkbox-update-rules.md` before writing checkbox state.
