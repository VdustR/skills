# Swift and Apple Platforms

Evaluate Swift for Apple SDKs, native UI, extensions, and platform integration.
This reference covers Apple apps; Swift itself is not limited to that use.

```mermaid
flowchart TD
    A[Apple app requirements] --> B{UI and sharing needs}
    B -->|Native Apple experience| C[Evaluate Swift + SwiftUI]
    C --> D{Missing capability or existing native UI?}
    D -->|Yes| E[Evaluate UIKit/AppKit interoperability]
    D -->|No| F[Keep the SwiftUI candidate]
    B -->|Shared logic with native UIs| G[Compare Kotlin Multiplatform or another core]
    B -->|Substantial shared UI| H[Compare Flutter, React Native,<br/>Compose Multiplatform, and native UI]
    E --> I[Check SDK coverage, OS targets,<br/>integration costs, and build compatibility]
    F --> I
    G --> I
    H --> I
```

[SwiftUI](https://developer.apple.com/swiftui/) supports incremental adoption with
UIKit/AppKit. Check actual feature and OS coverage before choosing the boundary.
For multiple platforms, compare required native features and shared-code value;
platform count alone does not determine the UI approach.

## Tooling and adoption checks

Treat [Xcode](https://developer.apple.com/xcode/), Swift, platform SDKs, deployment
targets, and CI hosts as a coupled decision. Prefer mise for independent helpers;
a standalone Swift installation does not establish Apple app-build readiness.
Use Xcode/Swift Package Manager where appropriate.

Plan relevant unit/UI tests, release builds, and platform integration checks.
Distinguish simulator and physical-device results. Signing, archive/export, and
distribution evidence are separate from debug builds and require the applicable
authorization.
