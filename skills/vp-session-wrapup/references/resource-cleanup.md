# Resource Cleanup

Leave no session-owned resource consuming storage, compute, connections, or
ongoing cost without a remaining purpose. Preserve required results and protect
other work. This is a scoped closeout, not a machine-wide purge or a promise of
zero total resource use. Authorization comes from the user; BYE does not grant
unrelated deletion, external writes, or broader access.

## Identify the resources

Derive the inventory from the session's actions, including paths outside the
working directory. Use existing resource records; where possible, record exact
identity, ownership, prior state, purpose, dependents, and release method when
acquiring a resource rather than reconstructing everything at closeout.

- Files and data generated or acquired for the task: build and package output,
  installers, exports, downloads, extracted files, conversions, test results,
  screenshots, recordings, logs, scratch notes, session caches, and duplicates.
  Include intermediate and final artifacts, regardless of name or location.
- Execution and allocation: servers, watchers, background jobs, child processes,
  browser sessions, containers, emulators, virtual machines, tunnels, ports,
  mounts, networks, and temporary remote resources when within scope.
- Persistent supporting state: container volumes, emulator disks and snapshots,
  test databases, images, dependencies, and caches. Inspect separately from
  the running instance; stopping execution does not remove stored data.
- Temporary changes: environment and application settings, proxy routes,
  project overrides, and tools installed only to unblock the task.

Do not scan or clear unrelated user data. A cache or ignored-file designation
does not prove session ownership or disposability. Shared package caches,
SDKs, system images, and global tools are not session trash just because the
session used them. Platform-managed internal state without a supported inspection
or cleanup interface must be reported as unverified when relevant, never claimed
cleared.

## Decide by purpose and ownership

Apply these distinctions to each resource, including parts of the same directory:

| Situation | Disposition |
| --- | --- |
| A session-owned temporary resource has served its purpose, has no remaining consumer, and holds no required unique state | Reclaim under the cleanup authorization; reproducible output needs retained inputs and a usable recreation method. Truly disposable scratch data need not be recreated. |
| An artifact contains required work, evidence, or recovery information | Preserve and verify a usable destination before removing the session copy. Meet the requested delivery endpoint separately. |
| The exact required artifact is published in an external release and verified retrievable by the intended recipient | Remove redundant local copies and intermediate output unless a separate local use remains. A release title or a successful upload alone is insufficient. |
| An app or tool is permanently installed or designated for continued local use | Retain the installation and its runtime dependencies as ongoing-use resources. Assess the installer, staging directory, and unused build output separately. |
| A pre-existing resource was started or temporarily modified for this session | Restore only the session's known change when authorized, no other consumer depends on it, and intervening work is protected; do not delete the underlying resource. |
| A resource is shared, remotely hosted, sensitive, difficult to recover, or of uncertain ownership | Preserve and report unless the exact operation has sufficient authority and evidence. Reclaim verified independent parts when safe. |

Keep source changes, issues, release assets, decisions, and necessary evidence
at their intended destinations. Creating an issue does not make unfinished
in-scope work disposable. Reproducibility alone is insufficient: an artifact may
still be needed for delivery, verification, or ongoing local operation. Conversely,
having once been a final or verified artifact does not require keeping every
local copy after verified external delivery.

Retained resources need a concrete purpose and retrieval location, plus an owner
and stop/removal condition for temporary continued use. Preserve unknown items
while establishing those facts; do not invent a retention reason to hide an
unresolved cleanup obligation. For credential files, prefer unstaging and
reporting; do not delete them as ordinary cleanup.

## Reclaim and verify

1. Establish the inventory and intended disposition. Name exact targets and
   operations before acting; batch low-risk targets with the same rationale.
   Confirm ownership, dependencies, preservation, and authority immediately
   before mutation. Do not select targets by broad name, port, age, or ignore
   pattern alone.
2. Preserve required results and verify access outside the temporary workspace.
   Retain necessary diagnostics before stopping producers that could lose them.
3. Stop task-only producers before deleting their output. Use the owning
   lifecycle tool and dependency order; route persistent process operations
   through `vp-long-running-processes`. Graceful shutdown, removal of a runtime
   instance, and deletion of its persistent data are separate decisions. Protect
   shared daemons and base images; do not use global prune or reset commands.
4. Remove disposable session-owned data and restore authorized temporary changes
   without overwriting intervening work. Do not uninstall permanent local tools
   or remove runtime files that a retained installation still needs.
5. Read back the actual state: exact jobs or instances stopped, relevant
   allocations released, selected files gone, temporary changes restored, and
   required results still accessible. A successful cleanup command is not proof
   of all these outcomes. On interruption or uncertain results, inspect current
   state before retrying and recheck consumers and preservation.

Report reclaimed resources, intentionally retained resources with reasons and
locations, and failed or unverified actions. Distinguish storage reclaimed from
execution stopped; do not invent byte counts or claim deletion of inaccessible
platform caches. A remaining session cleanup obligation or preservation risk
blocks BYE completion; safely retained ongoing-use or shared resources do not.
