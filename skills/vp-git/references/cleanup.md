# Cleanup

Audit branches, worktrees, stashes, and remote-tracking refs as separate risk
classes. Present exact candidates before deleting anything.

## Protect

Never remove the current branch, the default branch, checked-out or dirty
worktrees, locked worktrees, uninspected stashes, open-PR branches, or user
protected patterns.

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
