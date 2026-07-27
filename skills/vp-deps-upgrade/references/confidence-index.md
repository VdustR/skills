# Confidence

Use high, medium, or low confidence when it materially helps review.

Consider primary-source coverage, semver distance, peer and runtime
compatibility, lockfile churn, source migrations, test coverage, deployment
impact, and rollback cost. State the strongest evidence and the largest remaining
unknown.

Do not convert a green dependency-bot check or a patch version label into high
confidence without inspecting the actual diff and current head.
