# Metadata Decision Tree

Use this tree for metadata management. Apply it separately to each requested
operation; unsupported grouping does not block independently supported renaming.
The metadata procedure defines identity, evidence, concurrency, and readback.
Standing auto-naming policy can trigger this tree when discussion first resolves
the objective; the user need not explicitly ask to rename before implementation.

```mermaid
flowchart TD
    A[Session naming or organization] --> B{Title suggestions only?}
    B -->|Yes| C[Return title; no metadata operations]
    B -->|No| D{Targets and operations authorized?}
    D -->|No| E[Prepare proposal; obtain necessary decision]
    D -->|Yes| F{Exact target and required relationship verified?}
    F -->|No| G[Resolve missing evidence; defer affected mutation]
    F -->|Yes| H{Already suitable or protected user choice?}
    H -->|Yes| I[Keep current state; continue original work]
    H -->|No| J[Discover capability for this operation and target]
    J --> K{Complete eligible semantic interface?}
    K -->|Yes| L[Recheck relevant state; apply smallest change]
    K -->|No| M[Use interaction routing to assess UI]
    M --> N{Eligible UI with exact targeting and readback?}
    N -->|Yes| L
    N -->|No| O[Skip operation; optional verified manual action; continue task]
    L --> P[Read back title or membership]
    P --> Q{Intended state confirmed?}
    Q -->|Yes| R[Record verified result; continue original work]
    Q -->|No or uncertain| S[Use a cheap read-only check if available]
    S --> T{State now confirms success?}
    T -->|Yes| R
    T -->|No| U{Control denial or intervening user change?}
    U -->|Yes| V[Stop affected mutation; preserve controls; continue task]
    U -->|No| X[Leave result unverified; skip operation; continue task]
```

- Each route retains the original authorization and interface constraints. A
  denial at discovery also stops that affected action; it is not a missing API.
- An explicit request to replace a user-selected name can authorize a change;
  routine auto-management cannot. Unknown name ownership favors preservation.
- Readback must establish the intended session metadata, not a terminal title,
  generated summary, or task-progress label.
- Failed or inconclusive harness operations end the affected attempt. Do not
  turn them into task blockers or BYE TODOs, or require harness repair. Retry
  only with new evidence, a relevant capability change, or a user request.
- For routine auto-management, avoid disruptive capability exploration. Continue
  the original task when no eligible low-cost route is currently available.
