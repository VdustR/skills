# Repositories

## Clone Policy

Honor an explicit destination. Otherwise use the personal location defined by
the active agent instructions. Resolve owner and repository names from the
canonical remote rather than guessing.

## Setup

After cloning, inspect repository instructions, remotes, default branch,
worktree status, package-manager metadata, and supported toolchain before making
changes. Authentication success for one account or host does not prove the
active identity is appropriate for the repository.

Do not create branches, install dependencies, open an editor, or mutate local
configuration unless requested or required by an authorized workflow.
