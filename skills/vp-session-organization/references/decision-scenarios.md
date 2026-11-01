# Decision Scenarios

Use these cases for a manual walkthrough after editing the skill. They define
decisions to exercise, not results of an executable test or independent agent
evaluation. Adapt illustrative titles to the user's language and context.

| Request and available evidence | Required decision |
| --- | --- |
| "Give this checkout-timeout investigation a title." A standing auto-naming policy also exists. | Return only a title such as `Checkout timeout investigation`; make no metadata calls. |
| "Automatically manage this chat's name." The durable checkout-repair goal is clear, and rename plus readback APIs exist. | Inspect the current title; apply a concise name only if needed and authorized, then read it back. Resume the original work. |
| A new session starts as `Discuss checkout options`. Discussion settles on implementing payment retries; the user says "Go ahead and implement it." Standing auto-naming policy and an eligible rename/readback route exist. | Proactively check the name as implementation begins, replace the vague automatic title with `Implement payment retries`, and read it back without waiting for another naming request. Initial clarification counts even though the topic remains checkout. |
| The same discussion resolves to payment retries, but the existing title already says `Implement payment retries`, or the user explicitly chose `Payment notebook`. | Keep the accurate or protected title. A decision to implement does not by itself require a new name. |
| The user explicitly selected `Payment notebook`; routine auto-management would prefer `Checkout timeout repair`. | Preserve `Payment notebook`. An explicit request to replace it with `Checkout timeout repair` permits that exact change and readback. |
| An automatically named checkout-repair session is reassigned to migrate payment providers. | The durable objective materially changed; update the name if authorized and supported. |
| The checkout-repair session temporarily profiles database queries, fixes a test, or enters review. | Keep the title; these steps serve the same durable objective. Do not rename after every phase. |
| The user identifies a coordinator and two child chats for one checkout-reliability objective, across repositories; group tools and authorization exist. | Verify identities and existing organization, reuse a suitable group, and keep each title understandable outside it. Grouping does not authorize messages, new chats, or execution migration. |
| The known family already occupies an appropriate user-created group with descriptive titles. | Make no changes. Shared context does not justify replacing the user's organization. |
| A harness documents user `/rename` but exposes no self-rename tool; an authorized external operator has an eligible owned interactive client and readback. | Distinguish the operator route from self-renaming. Use interaction routing to assess it; do not claim that the target agent can invoke the slash command as a tool. |
| No callable rename operation or eligible UI route exists. | Continue the original task without invented commands or storage edits. If management was requested, provide a verified manual action or explain the missing prerequisite. |
| Rename and readback are available, but grouping is not. | Apply only the authorized, necessary name change and verify it; leave grouping unsupported. |
| Two historical chats contain "checkout" but have no verified shared objective or ancestry. | Do not infer a family or reorganize them. |
| A title write times out; subsequent readback already shows the intended title. | Treat the readback as confirmation; do not repeat the write. An unavailable readback leaves the outcome unverified. |
| A generic coding request has no naming request, standing naming policy, or relevant objective change. | Do not activate session management merely because this skill exists; continue the requested work. |
| A headless client exits 0, reports a permission auto-denial on stderr, and produces no state readback. | Mark the affected action blocked, not complete. Do not enable bypass mode or substitute another interface to defeat the denial. |
| A terminal title changes, or the product generates a summary different from the requested name. | Do not treat it as the requested metadata change; read the actual session title. |
| Two sessions share a title on different hosts. | Resolve the exact host-qualified target before writing; title matching alone is insufficient. |
| The user changes a title while capability discovery is in progress. | Recheck before writing and preserve the intervening change unless replacement is authorized. |
| A title remains after leaving and reopening a conversation, but no app restart occurred. | Report navigation persistence only; application-restart and cross-device persistence remain unverified. |
| A grouping-looking control moves a conversation into another execution project. | Do not use it under routine naming/grouping authorization. Verify semantics and obtain authorization for any context change. |
| Interactive startup requires first-run preferences or extension migration. | Stop at that prerequisite without changing persistent settings merely to discover metadata support. |
| A routine naming policy applies, but the only speculative route would repeatedly launch clients or interrupt foreground work. | Preserve the current state and continue the original task; do not turn routine metadata upkeep into disruptive exploration. |
| The user says to keep the current name; only keyword overlap is known for requested grouping, and no manual group feature is verified. | Report the name as kept. Defer grouping for missing relationship evidence before tool exploration; do not suggest an invented picker grouping action. |
