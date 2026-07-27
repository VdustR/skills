# Unions And Exhaustiveness

Use a stable discriminant when behavior depends on a closed set of variants.
Keep variant-specific fields on their variant instead of making every field
optional.

Exhaustive handling should fail visibly when a new variant is added. Match the
repository's preferred assertion or control-flow pattern and ensure the fallback
does not silently accept unknown runtime data.

For open external values, validate and map them into a closed internal union
before relying on exhaustive logic.
