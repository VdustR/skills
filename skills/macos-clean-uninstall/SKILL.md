---
name: macos-clean-uninstall
description: >-
  Cleanly uninstall applications on macOS with thorough research and cleanup.
  Use when the user asks to "uninstall", "remove", "delete", or "clean up"
  an application, program, CLI tool, or package on macOS. Also trigger when
  the user wants to check what residual data an app has left behind, asks to
  "check leftover files", or mentions cleaning up after an app removal.
  Boundary: macOS only. Not for Linux/Windows, removing SIP-protected system
  apps, or clearing browser data.
---

# Clean Uninstall (macOS)

Research-driven workflow for completely removing applications and all associated data from macOS.

## Quick Start

> Uninstall Docker from my Mac

> Remove Slack and all its data

> What files did Zoom leave behind?

> Clean uninstall 1Password

## When to Use

- User asks to uninstall, remove, or delete a macOS application
- User wants to check for residual data left by an app
- User wants to free disk space by cleaning up after a removed app

**When NOT to use:**
- Linux or Windows uninstalls — this skill is macOS-only
- Removing system-bundled apps (Safari, Mail, Finder) — these are SIP-protected
- Clearing browser data or cookies only — not an app uninstall
- Removing macOS system updates

## Workflow

Execute these phases in order. Never skip the research and review phases.

**Prerequisite**: If the app name cannot be determined unambiguously, ask the user to clarify. Never substitute an empty or whitespace-only string into any command.

Define these variables once and use throughout:
- `APP_NAME` — CLI/short name (e.g., `docker`, `slack`)
- `APP_DISPLAY` — display name for `.app` bundle (e.g., `Docker`, `Slack`)
- `BUNDLE_ID` — bundle identifier (e.g., `com.docker.docker`)

### Phase 1: Identify Installation Method

Determine how the app was installed — this dictates the correct removal procedure.

**Run detection as a single consolidated script** — not as parallel sub-calls. One shell call with labeled sections prevents (a) short/empty outputs being misattributed across sections, and (b) a single failure (e.g., zsh `NOMATCH` glob) cancelling the rest of the batch.

```bash
# Phase 1 consolidated detection — run as a single Bash tool call
set +e  # never abort; every section must print
A="${APP_NAME:?APP_NAME required}"
D="${APP_DISPLAY:-$A}"

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
# Symmetrical with the bundled-uninstaller scan: check both system and user app dirs.
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
exit 0  # explicit clean exit so the consolidated script returns 0 regardless of individual section find/grep misses
```

**If every primary section above prints `(none)`/`(not ...)`**, also check CLI package managers:

```bash
echo "=== command path ==="; command -v -- "${APP_NAME}" 2>/dev/null || echo "(none)"
echo "=== npm global ==="; npm list -g "${APP_NAME}" 2>/dev/null | grep -i "${APP_NAME}" || echo "(none)"
echo "=== pip ==="; pip3 show "${APP_NAME}" 2>/dev/null || echo "(none)"
echo "=== cargo ==="; command -v -- cargo >/dev/null && cargo install --list 2>/dev/null | grep -i "${APP_NAME}" || echo "(none)"
```

**Gate before Phase 2** — explicitly declare in your response:

```
Installation method: <homebrew-cask | homebrew-formula | pkg | mas | direct-download | cli-pkgmgr | not-found>
Evidence: <the exact labeled section output line(s) that support this>
```

Do not state a negative ("not Homebrew", "no bundle ID") without quoting the `(none)` line from the labeled output. If evidence is ambiguous or empty, rerun the script — never proceed on assumption.

**Symlink handling**: If the `CLI in PATH` section reports a symlink, determine the relationship and ask the user:

| Scenario | Action |
|----------|--------|
| Symlink to a package manager binary (e.g., `npx` → npm) | Only remove the symlink |
| Symlink to another app (e.g., `code` → VS Code) | Ask: remove alias only, or uninstall parent app + all aliases? |
| Multiple symlinks to same app | List all; if uninstalling, remove all |

**Bundled uninstaller**: If found, it takes priority over manual removal in Phase 6. Only use uninstallers from within the installed app bundle or the vendor's verified domain.

### Phase 2: Research Official Uninstall Method

**Mandatory**: Understand the correct uninstall procedure before building a plan.

**Shortcut for Homebrew casks**: if Phase 1 identified a cask, `brew info --cask <token>` reveals the `zap` stanza (which lists the paths `--zap` will clean). Reviewing this output satisfies Phase 2 for standard casks. Web search is only additionally required when the app:

- installs kernel extensions, system extensions, or launch daemons (e.g., `docker`, `karabiner-elements`, `fuse`, VPN clients)
- modifies system configuration (`/etc/hosts`, `/etc/shells`, PATH, shell integrations)
- manages credentials or keychains at the system level (e.g., `1password`)

**For non-Homebrew apps, or when the above conditions apply**:

1. **First search**: `"<app name>" official uninstall macOS site:<vendor-domain>`
2. **Second search**: `"<app name>" uninstall macOS`
3. **Evaluate sources** — prioritize: official vendor docs > vendor GitHub > Apple Support > community forums
4. **Reject** blog spam, SEO-farm "cleaner" app promotions, and unverified guides

**Critical**: Some apps have dedicated uninstallers or CLI commands. Missing these can leave kernel extensions, daemons, or system modifications behind.

### Phase 3: Scan Associated Data

**Safety preamble (always prepend to any Phase 3 script)** — an empty `BUNDLE_ID` would make `find -iname "*${BUNDLE_ID}*"` expand to `**` and match every file on disk. Guard against it:

```bash
# Guard: block empty BUNDLE_ID from cascading into a match-everything scan
: "${BUNDLE_ID:?BUNDLE_ID required for Phase 3. If Phase 1 could not resolve it (e.g., CLI-only install, no .app bundle, Spotlight disabled), either resolve it manually (defaults read <app>/Contents/Info CFBundleIdentifier) or remove BUNDLE_ID branches from the find expressions below and rely on APP_NAME + extra manual verification.}"
```

**If the app name is ambiguous** (shorter than 4 characters or a common word like `go`, `pro`, `mail`, `code`, `sync`, `file`, `app`), use bundle ID only:

```bash
find ~/Library /Library -maxdepth 3 -iname "*${BUNDLE_ID}*" 2>/dev/null
find ~/.config ~/.local -maxdepth 2 -iname "*${BUNDLE_ID}*" 2>/dev/null
```

**Otherwise**, scan with both app name and bundle ID:

```bash
echo "=== User Library ==="
find ~/Library -maxdepth 3 \( -iname "*${APP_NAME}*" -o -iname "*${BUNDLE_ID}*" \) 2>/dev/null

echo "=== System Library ==="
find /Library -maxdepth 3 \( -iname "*${APP_NAME}*" -o -iname "*${BUNDLE_ID}*" \) 2>/dev/null

echo "=== XDG Config ==="
find ~/.config ~/.local -maxdepth 2 \( -iname "*${APP_NAME}*" -o -iname "*${BUNDLE_ID}*" \) 2>/dev/null

echo "=== Dotfiles ==="
ls -d ~/."${APP_NAME}" ~/."${APP_NAME}"rc 2>/dev/null
```

In both cases, require manual verification of every name-based match before including in the removal plan.

### Phase 4: Subagent Review of Removal Plan

**Mandatory**: Before presenting the plan to the user, launch a subagent to review the entire removal plan.

**Red flags that mean you are rationalizing skipping this phase** — if you catch yourself thinking any of these, stop and invoke the subagent:

- "This is a simple cask uninstall, review is overkill"
- "All paths look safe, nothing under `/System` or `/usr`"
- "`--zap` handles everything, there is nothing to review"
- "I already ran Phase 1 myself, a second read adds nothing"

The subagent's primary job is **not** catching dangerous paths — those are easy to spot. Its primary job is catching **misread evidence from Phase 1** (e.g., declaring "not Homebrew" when `brew list` actually matched the name, or missing a bundled uninstaller that was buried in a multi-section output).

Subagent prompt must include: app name, bundle ID, installation method, full file list, uninstall steps in order, the raw Phase 1 detection output, and research sources.

**Subagent review checklist:**
- [ ] Uninstall steps match official documentation
- [ ] No vendor-provided uninstaller is being skipped
- [ ] PKG apps: `pkgutil --files <pkg-id>` output reviewed for system-level files
- [ ] No paths under `/System/`, `/usr/bin/`, `/usr/lib/`, `/bin/`, `/sbin/`, `/etc/`, `/var/`, `/tmp/`, `/private/`, or `~/` alone. Paths under `/usr/local/lib/`, `/usr/local/share/`, `/opt/homebrew/lib/`, `/opt/homebrew/share/` require explicit user confirmation
- [ ] No overly broad glob patterns; ambiguous names (short or common words) use bundle ID matching only
- [ ] Launch agents/daemons identified and will be unloaded before deletion
- [ ] Kernel extensions or system extensions identified if applicable
- [ ] PKG receipt files list reviewed — no shared components being removed
- [ ] Homebrew apps: `brew uses --installed <name>` checked for reverse dependencies
- [ ] Execution order is safe (check/stop processes → unload services → remove app → remove data → forget receipts)
- [ ] All paths are absolute and explicitly listed
- [ ] Each scan match cross-referenced against bundle ID, not just app name

If the subagent raises any concern, resolve it before proceeding.

### Phase 5: Present Removal Plan

Present a categorized table to the user:

| Category | Path | Size | Action |
|----------|------|------|--------|
| App binary | `/Applications/Foo.app` | 150 MB | Remove |
| Preferences | `~/Library/Preferences/com.foo.plist` | 4 KB | Trash |
| Cache | `~/Library/Caches/com.foo` | 23 MB | Remove |

**Default recommendation: remove everything** (clean uninstall). Flag items containing potentially irreplaceable user data (configuration, databases, project files) and ask explicitly.

**Recovery approach**: Move user data directories (Application Support, Preferences) to Trash instead of `rm -rf`. Use `rm -rf` only for caches and temporary files. To avoid name collisions in Trash, append a timestamp: `mv "<path>" ~/.Trash/"$(basename "<path>")_$(date +%s)"`.

Warn about: login items, browser extensions, privacy permissions, kernel extensions requiring reboot.

### Phase 6: Execute with Confirmation

1. **Ask for confirmation** before any deletion
2. **Check for running processes** before removal:
   ```bash
   pgrep -il "${APP_NAME}"
   ```
   If processes are found, present options to the user:
   | Option | Action |
   |--------|--------|
   | Quit gracefully | `osascript -e "tell application \"${APP_DISPLAY}\" to quit"` then recheck after 5s (max 3 retries, then offer force kill) |
   | Force kill | `killall "${APP_DISPLAY}"` (warn: may lose unsaved data) |
   | Remove auto-launch first, reboot later | Unload launch agents/daemons (step 3) + remove login items, then ask user to reboot and re-run removal |

   **Note:** If a launch agent has `KeepAlive` enabled, the process will respawn after quit/kill. In that case, fall back to the "Remove auto-launch first" option.
3. **Unload launch agents/daemons**:
   ```bash
   LABEL=$(/usr/libexec/PlistBuddy -c "Print :Label" "<plist-path>")
   # User agent (~/Library/LaunchAgents/)
   launchctl bootout "gui/$(id -u)/${LABEL}"
   launchctl print "gui/$(id -u)/${LABEL}" 2>&1 | grep -q "Could not find" && echo "User agent unloaded"
   # System daemon (/Library/LaunchDaemons/) — requires sudo
   sudo launchctl bootout "system/${LABEL}"
   sudo launchctl print "system/${LABEL}" 2>&1 | grep -q "Could not find" && echo "System daemon unloaded"
   ```
4. **Use Homebrew** if applicable — use the **exact cask/formula token** from Phase 1 `brew list` output (not the user-provided name):
   - Cask: `brew uninstall --zap --cask "<exact-token>"` (`--zap` removes all associated files)
   - Formula: `brew uninstall "<exact-token>"`
   If multiple tokens matched `grep -i` in Phase 1, list all matches and ask the user to select the correct one
5. **Use vendor uninstaller** if one was found in Phase 1
6. **Remove associated data** — Trash for user data, `rm -rf` for caches. Explicit paths only
7. **Forget PKG receipts** — **ALWAYS after removing files** (once forgotten, file list is unrecoverable): `sudo pkgutil --forget <pkg-id>`

### Phase 7: Post-Removal Verification

**Targeted verification** — check only the specific paths from the removal plan:

```bash
# Check each removed path still exists
ls -d <path1> <path2> ... 2>/dev/null

# Check for residual processes
pgrep -il "${APP_NAME}"

# Check for residual login items
osascript -e 'tell application "System Events" to get the name of every login item'
```

**Follow-up reminder checklist** — inform the user about any applicable items:

| Condition | Reminder |
|-----------|----------|
| Kernel extension, system extension, or system daemon removed | Reboot required/recommended |
| App had privacy permissions (Accessibility, Full Disk Access, etc.) | Remove in System Settings → Privacy & Security |
| App had Login Items entries | Remove in System Settings → General → Login Items |
| App installed browser extensions | Remove from browser(s) |
| App used network configuration (VPN, proxy, DNS) | Verify System Settings → Network |
| App installed shell integrations (PATH, completions, aliases) | Check `~/.zshrc`, `~/.bashrc`, `~/.zprofile`, `/etc/paths.d/` |
| Homebrew dependencies no longer needed | Suggest `brew autoremove` |
| App stored data in iCloud / cloud sync | Data may still exist in cloud |
| App modified `/etc/hosts`, `/etc/shells`, or similar | Verify restored |

Always present applicable reminders — err on the side of informing.
