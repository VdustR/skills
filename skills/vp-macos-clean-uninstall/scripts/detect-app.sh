#!/usr/bin/env bash
# Phase 1 detection helper for vp-macos-clean-uninstall.
#
# Read-only: prints labeled evidence sections and never modifies anything.
# Every section always prints a line, so short or empty results cannot be
# misattributed and one failing probe cannot cancel the rest.

set -u  # no -e: every section must print even when individual probes miss

usage() {
  cat <<'EOF' >&2
Usage: detect-app.sh <app-name> [display-name]

  app-name      CLI/short name, e.g. "docker", "slack"
  display-name  display name for the .app bundle, defaults to app-name,
                e.g. "Docker", "Slack"

Prints labeled evidence sections: Homebrew formula/cask, Caskroom, .app
bundles, bundle ID, PKG/MAS receipts, uninstallers, CLI in PATH, and
npm/pip/cargo (probed only when every primary section misses).
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

case "${1:-}" in
  -h|--help) usage ;;
  -*) fail "app-name must not start with '-'" ;;
esac
[ $# -ge 1 ] && [ $# -le 2 ] || usage

A="$1"
D="${2:-$A}"

# Never accept an empty or whitespace-only app name: downstream globs would
# silently match everything.
nonblank "$A" || fail "app-name must not be empty or whitespace-only"
case "$D" in
  -*) fail "display-name must not start with '-'" ;;
esac

# 1 while any primary section below produced evidence; gates the package
# manager probes at the end (they are slow and only useful when everything
# else missed).
primary_hit=0

# Single walk of ~/Applications, reused by the bundle listing, bundle-ID
# resolution, and bundled-uninstaller sections so they can never disagree.
user_apps=$(find ~/Applications -maxdepth 2 -iname "*${A}*.app" 2>/dev/null)

echo "=== Homebrew formula ==="
found=$(brew list --formula 2>/dev/null | grep -i "$A")
[ -n "$found" ] && { echo "$found"; primary_hit=1; } || echo "(none)"

echo "=== Homebrew cask ==="
found=$(brew list --cask 2>/dev/null | grep -i "$A")
[ -n "$found" ] && { echo "$found"; primary_hit=1; } || echo "(none)"

echo "=== Caskroom (direct, fallback) ==="
found=$(find /opt/homebrew/Caskroom /usr/local/Caskroom -maxdepth 1 -iname "*${A}*" 2>/dev/null)
[ -n "$found" ] && { echo "$found"; primary_hit=1; } || echo "(none)"

echo "=== /Applications bundle ==="
if [ -d "/Applications/${D}.app" ]; then
  echo "/Applications/${D}.app"
  primary_hit=1
else
  echo "(none at /Applications/${D}.app)"
fi

echo "=== ~/Applications bundle (fallback) ==="
[ -n "$user_apps" ] && { echo "$user_apps"; primary_hit=1; } || echo "(none)"

echo "=== Bundle ID (mdls, with defaults fallback) ==="
# Spotlight may be disabled or the app un-indexed, making mdls return empty
# or "(null)". Fall back to reading Info.plist directly so downstream phases
# never see an empty BUNDLE_ID (which would cause `find -iname "*${BUNDLE_ID}*"`
# to match every path).
emit_bid() {
  app="$1"
  raw=$(mdls -raw -name kMDItemCFBundleIdentifier "$app" 2>/dev/null)
  if [ -z "$raw" ] || [ "$raw" = "(null)" ]; then
    raw=$(defaults read "${app%/}/Contents/Info" CFBundleIdentifier 2>/dev/null)
  fi
  if [ -n "$raw" ]; then
    echo "$app: $raw"
  else
    echo "$app: (bundle ID unavailable — Spotlight off or Info.plist unreadable; do NOT proceed with empty BUNDLE_ID to Phase 3)"
  fi
}
bid_found=0
if [ -d "/Applications/${D}.app" ]; then
  emit_bid "/Applications/${D}.app"
  bid_found=1
fi
while IFS= read -r app; do
  [ -z "$app" ] && continue
  emit_bid "$app"
  bid_found=1
done <<< "$user_apps"
[ $bid_found -eq 0 ] && echo "(no .app found)"

echo "=== PKG receipts ==="
found=$(pkgutil --pkgs 2>/dev/null | grep -i "$A")
[ -n "$found" ] && { echo "$found"; primary_hit=1; } || echo "(none)"

echo "=== Mac App Store receipt ==="
if [ -e "/Applications/${D}.app/Contents/_MASReceipt" ]; then
  echo "MAS receipt present"
  primary_hit=1
else
  echo "(not MAS)"
fi

echo "=== Bundled uninstaller (inside .app) ==="
# Scan Contents of every candidate .app (both /Applications and ~/Applications)
contents_list=""
[ -d "/Applications/${D}.app/Contents" ] && contents_list="/Applications/${D}.app/Contents"
while IFS= read -r app; do
  [ -z "$app" ] && continue
  [ -d "$app/Contents" ] && contents_list="${contents_list:+$contents_list
}$app/Contents"
done <<< "$user_apps"
if [ -z "$contents_list" ]; then
  echo "(no .app)"
else
  hits=""
  while IFS= read -r c; do
    [ -z "$c" ] && continue
    more=$(find "$c" -maxdepth 3 \( -iname "*uninstall*" -o -iname "*remove*" \) 2>/dev/null | head -20)
    [ -n "$more" ] && hits="${hits:+$hits
}$more"
  done <<< "$contents_list"
  [ -n "$hits" ] && echo "$hits" || echo "(none)"
fi

echo "=== Sibling uninstaller apps (/Applications and ~/Applications) ==="
# find tolerates a missing ~/Applications via 2>/dev/null.
found=$(find /Applications ~/Applications -maxdepth 1 \( -iname "*${A}*uninstall*" -o -iname "*${A}*remove*" \) 2>/dev/null)
[ -n "$found" ] && echo "$found" || echo "(none)"

echo "=== CLI in PATH ==="
# Use `-- "$A"` so names starting with `-` are not parsed as options
CMD=$(command -v -- "$A" 2>/dev/null || true)
if [ -n "$CMD" ] && [ -x "$CMD" ]; then
  echo "path: $CMD"
  if [ -L "$CMD" ]; then
    echo "symlink -> $(readlink "$CMD")"
  fi
  primary_hit=1
else
  echo "(not in PATH)"
fi

# CLI package manager probes are slow (npm loads node, pip spawns python) and
# only informative when nothing above matched.
if [ "$primary_hit" -eq 1 ]; then
  echo "=== npm global ==="
  echo "(skipped: primary evidence found above)"
  echo "=== pip ==="
  echo "(skipped: primary evidence found above)"
  echo "=== cargo ==="
  echo "(skipped: primary evidence found above)"
else
  echo "=== npm global ==="
  npm list -g "$A" 2>/dev/null | grep -i "$A" || echo "(none)"
  echo "=== pip ==="
  pip3 show "$A" 2>/dev/null || echo "(none)"
  echo "=== cargo ==="
  { command -v -- cargo >/dev/null && cargo install --list 2>/dev/null | grep -i "$A"; } || echo "(none)"
fi

exit 0  # explicit clean exit regardless of individual section find/grep misses
