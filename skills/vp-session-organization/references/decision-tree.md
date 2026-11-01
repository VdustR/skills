# Management Decision Tree

Use this tree for management mode. Apply it separately to each requested
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
    N -->|No| O[Report limitation if requested; offer verified manual action]
    L --> P[Read back title or membership]
    P --> Q{Intended state confirmed?}
    Q -->|Yes| R[Record verified result; continue original work]
    Q -->|No or uncertain| S[Refresh current state without another write]
    S --> T{State now confirms success?}
    T -->|Yes| R
    T -->|No| U{Control denial or intervening user change?}
    U -->|Yes| V[Stop affected mutation; follow applicable policy]
    U -->|No| W{Evidence supports safe recovery?}
    W -->|Yes| J
    W -->|No| X[Report unresolved result; retain independent progress]
```

- Each route retains the original authorization and interface constraints. A
  denial at discovery also stops that affected action; it is not a missing API.
- An explicit request to replace a user-selected name can authorize a change;
  routine auto-management cannot. Unknown name ownership favors preservation.
- Readback must establish the intended session metadata, not a terminal title,
  generated summary, or task-progress label.
- Safe recovery needs new evidence or a known correction. A loop without either
  ends unresolved; it does not justify repeated writes or permission changes.
- For routine auto-management, avoid disruptive capability exploration. Continue
  the original task when no eligible low-cost route is currently available.
