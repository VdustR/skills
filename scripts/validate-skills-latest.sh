#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT"

npm exec --yes --ignore-scripts --package skills@latest -- skills add . --list >/dev/null
printf 'Validated skills parser compatibility with skills@latest.\n'
