#!/usr/bin/env bash
# Phase 3 residue scan helper for vp-macos-clean-uninstall.
#
# Read-only: prints labeled candidate paths and never deletes anything.

set -u

usage() {
  cat <<'EOF' >&2
Usage: scan-residue.sh <app-name> <bundle-id> [bundle-id...]
       scan-residue.sh --name-only <app-name>

Pass every bundle ID Phase 1 emitted (multi-bundle apps like Docker have
several); they are OR-ed into a single scan.

Safety rules enforced here instead of trusting the caller:
- An empty bundle id is refused: `find -iname "*<bundle-id>*"` with an empty
  value would match every file on disk.
- Ambiguous app names (shorter than 4 characters, or common words such as
  "mail", "code", "sync", "file") are matched by bundle id only. --name-only
  mode refuses them entirely; resolve the bundle id first
  (defaults read <app>/Contents/Info CFBundleIdentifier).

Every match still requires manual verification before entering the removal
plan.
EOF
  exit 2
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 2
}

nonblank() {
  [ -n "$(printf '%s' "$1" | tr -d '[:space:]')" ]
}

is_ambiguous_name() {
  name_lower="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  if [ "${#name_lower}" -lt 4 ]; then
    return 0
  fi
  case "$name_lower" in
    mail|code|sync|file) return 0 ;;
  esac
  return 1
}

section() {
  # section <label> <command...> — print label, then output or "(none)"
  label="$1"
  shift
  echo "=== $label ==="
  found="$("$@" 2>/dev/null)"
  [ -n "$found" ] && echo "$found" || echo "(none)"
}

APP_NAME=""
NAME_ONLY=0
BUNDLE_IDS=()

case "${1:-}" in
  -h|--help) usage ;;
esac

if [ "${1:-}" = "--name-only" ]; then
  NAME_ONLY=1
  shift
  [ $# -eq 1 ] || usage
  APP_NAME="$1"
else
  [ $# -ge 2 ] || usage
  APP_NAME="$1"
  shift
  BUNDLE_IDS=("$@")
fi

case "$APP_NAME" in
  -*) fail "app-name must not start with '-'" ;;
esac
nonblank "$APP_NAME" || fail "app-name must not be empty or whitespace-only"

if [ "$NAME_ONLY" -eq 1 ]; then
  if is_ambiguous_name "$APP_NAME"; then
    fail "app-name '$APP_NAME' is too short or too common for name-only scanning; resolve the bundle id first"
  fi
  section "User Library (name match)" find "$HOME/Library" -maxdepth 3 -iname "*${APP_NAME}*"
  section "System Library (name match)" find /Library -maxdepth 3 -iname "*${APP_NAME}*"
  section "XDG Config (name match)" find "$HOME/.config" "$HOME/.local" -maxdepth 2 -iname "*${APP_NAME}*"
  section "Dotfiles" ls -d "$HOME/.${APP_NAME}" "$HOME/.${APP_NAME}rc"
  exit 0
fi

for bid in "${BUNDLE_IDS[@]}"; do
  case "$bid" in
    -*) fail "bundle-id must not start with '-'" ;;
  esac
  nonblank "$bid" || fail "bundle-id must not be empty or whitespace-only (use --name-only only when no bundle id exists)"
done

# Build one OR-ed match expression so multi-bundle apps scan in a single walk.
bundle_expr=()
for bid in "${BUNDLE_IDS[@]}"; do
  [ ${#bundle_expr[@]} -gt 0 ] && bundle_expr+=(-o)
  bundle_expr+=(-iname "*${bid}*")
done

if is_ambiguous_name "$APP_NAME"; then
  echo "note: app-name '$APP_NAME' is ambiguous; matching by bundle id only" >&2
  section "User Library (bundle id match)" find "$HOME/Library" -maxdepth 3 \( "${bundle_expr[@]}" \)
  section "System Library (bundle id match)" find /Library -maxdepth 3 \( "${bundle_expr[@]}" \)
  section "XDG Config (bundle id match)" find "$HOME/.config" "$HOME/.local" -maxdepth 2 \( "${bundle_expr[@]}" \)
  exit 0
fi

match_expr=(-iname "*${APP_NAME}*" -o "${bundle_expr[@]}")

section "User Library" find "$HOME/Library" -maxdepth 3 \( "${match_expr[@]}" \)
section "System Library" find /Library -maxdepth 3 \( "${match_expr[@]}" \)
section "XDG Config" find "$HOME/.config" "$HOME/.local" -maxdepth 2 \( "${match_expr[@]}" \)
section "Dotfiles" ls -d "$HOME/.${APP_NAME}" "$HOME/.${APP_NAME}rc"

exit 0
