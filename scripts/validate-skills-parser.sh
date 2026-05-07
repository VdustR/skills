#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT"

SKILLS_CLI="${SKILLS_CLI:-skills}"

if ! command -v "$SKILLS_CLI" >/dev/null 2>&1; then
  printf 'Error: missing skills CLI. Run npm ci first, or set SKILLS_CLI.\n' >&2
  exit 1
fi

"$SKILLS_CLI" add . --list >/dev/null
printf 'Validated skills parser compatibility with %s.\n' "$("$SKILLS_CLI" --version 2>/dev/null || printf 'local skills CLI')"
