# Cleanup

Audit branches, worktrees, stashes, and remote-tracking refs as separate risk
classes. Present exact candidates before deleting anything.

## Protect

Never remove the current or default branch; current, dirty, locked, or otherwise
active worktrees; uninspected stashes; open-PR branches; or user-protected
patterns. A clean, unlocked, inactive worktree with a safely merged branch may
be removed only after exact approval.

## Evidence

- Ancestry proves regular merge history but may not recognize squash merges.
- A deleted upstream is not proof that work was merged.
- Hosting-platform merge state can establish a squash or rebase merge, but does
  not make a force deletion harmless.
- Age is a review signal, never sufficient deletion evidence.

Use safe deletion for ancestry-proven local branches. Force deletion, remote
branch deletion, stash dropping, and worktree removal each require explicit
approval. Execute destructive steps sequentially and verify after each risk
class.
