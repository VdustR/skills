# Author Classification

Use the hosting platform's author type first. A `Bot` node is strong evidence; a
`User` node is not proof of a human because some automation uses user accounts.

When resolution behavior depends on the distinction, inspect only enough public
profile or activity evidence to classify confidently. Signals can include an
automation-oriented profile, machine-generated activity patterns, or an
organization-managed reviewer identity. Do not maintain a hardcoded service-name
list.

Classify as:

- **Bot:** platform type or consistent automation evidence.
- **Human:** user type with ordinary human profile and activity signals.
- **Ambiguous:** conflicting, thin, organizational, or unavailable evidence.

Ask before resolving an ambiguous author's thread. Classification affects
resolution policy, not whether the technical feedback is valid.
