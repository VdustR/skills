---
name: vp-cspell
description: >-
  Diagnose and fix cspell unknown-word findings or bootstrap repository cspell
  configuration. Boundary: not for other spell checkers or general lint errors.
---

# cspell

Fix the text when it is wrong. Configure cspell only when the spelling is
intentional and the repository owns an appropriate configuration surface.

## Decision Order

1. Correct an actual typo.
2. Reuse an established repository spelling or canonical product name.
3. Add a real reusable term to the narrowest appropriate dictionary.
4. Use a local directive for intentional one-off text.
5. Ignore patterns only for generated, encoded, or structurally noisy content.

Do not add a word globally merely to silence one occurrence, and do not invent
configuration for an IDE-only warning when the repository has no cspell setup.
Run the repository's configured check after changes.

Read `references/decision-tree.md` for ambiguous cases and
`references/config-bootstrapping.md` when introducing configuration.
