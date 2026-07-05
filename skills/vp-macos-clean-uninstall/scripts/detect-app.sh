#!/usr/bin/env bash
# Phase 1 detection helper for vp-macos-clean-uninstall.
#
# Read-only: prints labeled evidence sections and never modifies anything.
# Every section always prints a line, so short or empty results cannot be
# misattributed and one failing probe cannot cancel the rest.
#
# Usage:
#   detect-app.sh <app-name> [display-name]
#
#   app-name      CLI/short name, e.g. "docker", "slack"
#   display-name  display name for the .app bundle, defaults to app-name,
#                 e.g. "Docker", "Slack"

set -u  # no -e: every section must print even when individual probes miss

usage() {
  sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 2
}

[ $# -ge 1 ] && [ $# -le 2 ] || usage

A="$1"
D="${2:-$A}"

# Never accept an empty or whitespace-only app name: downstream globs would
# silently match everything.
if [ -z "$(printf '%s' "$A" | tr -d '[:space:]')" ]; then
  printf 'Error: app-name must not be empty or whitespace-only\n' >&2
  exit 2
fi

echo "=== Homebrew formula ==="
brew list --formula 2>/dev/null | grep -i "$A" || echo "(none)"

echo "=== Homebrew cask ==="
brew list --cask 2>/dev/null | grep -i "$A" || echo "(none)"

echo "=== Caskroom (direct, fallback) ==="
found=$(find /opt/homebrew/Caskroom /usr/local/Caskroom -maxdepth 1 -iname "*${A}*" 2>/dev/null)
[ -n "$found" ] && echo "$found" || echo "(none)"

echo "=== /Applications bundle ==="
[ -d "/Applications/${D}.app" ] && echo "/Applications/${D}.app" || echo "(none at /Applications/${D}.app)"

echo "=== ~/Applications bundle (fallback) ==="
found=$(find ~/Applications -maxdepth 2 -iname "*${A}*.app" 2>/dev/null)
[ -n "$found" ] && echo "$found" || echo "(none)"

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
done < <(find ~/Applications -maxdepth 2 -iname "*${A}*.app" 2>/dev/null)
[ $bid_found -eq 0 ] && echo "(no .app found)"

echo "=== PKG receipts ==="
pkgutil --pkgs 2>/dev/null | grep -i "$A" || echo "(none)"

echo "=== Mac App Store receipt ==="
[ -e "/Applications/${D}.app/Contents/_MASReceipt" ] && echo "MAS receipt present" || echo "(not MAS)"

echo "=== Bundled uninstaller (inside .app) ==="
# Scan Contents of every candidate .app (both /Applications and ~/Applications)
contents_list=""
[ -d "/Applications/${D}.app/Contents" ] && contents_list="/Applications/${D}.app/Contents"
while IFS= read -r app; do
  [ -z "$app" ] && continue
  [ -d "$app/Contents" ] && contents_list="${contents_list:+$contents_list
}$app/Contents"
done < <(find ~/Applications -maxdepth 2 -iname "*${A}*.app" 2>/dev/null)
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
else
  echo "(not in PATH)"
fi

echo "=== npm global ==="
npm list -g "$A" 2>/dev/null | grep -i "$A" || echo "(none)"

echo "=== pip ==="
pip3 show "$A" 2>/dev/null || echo "(none)"

echo "=== cargo ==="
{ command -v -- cargo >/dev/null && cargo install --list 2>/dev/null | grep -i "$A"; } || echo "(none)"

exit 0  # explicit clean exit regardless of individual section find/grep misses
