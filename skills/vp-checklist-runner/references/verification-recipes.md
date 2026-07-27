# Verification

Choose the narrowest evidence that proves the exact wording, then confirm it is
current for the relevant head, environment, account, and artifact.

## Evidence Quality

- Source presence proves implementation shape, not runtime behavior.
- A passing focused test proves only its covered contract.
- A historical CI run does not prove the current head.
- A successful deployment does not prove user-visible behavior.
- A screenshot or manual report needs provenance and target context.
- Absence claims require searching the complete intended scope.

For commands, use repository-owned scripts and current tool help. Capture the
meaningful result without flooding the report with logs. Do not install missing
tools or mutate environments solely to satisfy verification unless authorized.

Mark an item:

- **Pass** only when all required evidence is current and positive.
- **Fail** when current evidence contradicts it.
- **Blocked** when required evidence cannot be obtained.
- **Manual** when only an authorized human or target environment can decide.
- **Ambiguous** when the item lacks a testable interpretation.
