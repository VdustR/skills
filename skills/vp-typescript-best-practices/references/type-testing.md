# Type Testing

Add type-level tests for exported generics, inference-sensitive helpers,
branded values, overloads, and regressions that ordinary runtime tests cannot
observe.

Cover accepted and rejected examples plus important inference results. Use the
repository's existing type-test framework and compiler configuration. Avoid
tests that merely restate an implementation type or depend on incidental error
wording.
