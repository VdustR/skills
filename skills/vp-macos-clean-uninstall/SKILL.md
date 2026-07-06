---
name: vp-macos-clean-uninstall
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

Research-driven workflow for completely removing applications and all
associated data from macOS. Not for SIP-protected system apps (Safari, Mail,
Finder) or macOS system updates.

## Workflow

Execute these phases in order. Never skip the research and review phases.

**Prerequisite**: If the app name cannot be determined unambiguously, ask the
user to clarify. Never substitute an empty or whitespace-only string into any
command.

Define these variables once and use throughout:

- `APP_NAME` — CLI/short name (e.g., `docker`, `slack`)
- `APP_DISPLAY` — display name for `.app` bundle (e.g., `Docker`, `Slack`)
- `BUNDLE_ID` — bundle identifier (e.g., `com.docker.docker`), resolved by
  Phase 1

Resolve `scripts/detect-app.sh` and `scripts/scan-residue.sh` from this skill
directory. Both are read-only evidence collectors; run them instead of
hand-writing detection shell.

### Phase 1: Identify Installation Method

Determine how the app was installed — this dictates the correct removal
procedure.

```bash
scripts/detect-app.sh "$APP_NAME" "$APP_DISPLAY"
```

One run prints every labeled evidence section: Homebrew formula/cask,
Caskroom, `.app` bundles in `/Applications` and `~/Applications`, bundle ID
(mdls with Info.plist fallback), PKG receipts, Mac App Store receipt, bundled
and sibling uninstallers, CLI in PATH (with symlink target), and npm/pip/cargo
global installs (probed only when every earlier section missed — they print
`(skipped: ...)` otherwise).

**Gate before Phase 2** — explicitly declare in your response:

```
Installation method: <homebrew-cask | homebrew-formula | pkg | mas | direct-download | cli-pkgmgr | not-found>
Evidence: <the exact labeled section output line(s) that support this>
```

If evidence shows more than one method (e.g., formula and cask both
matched), list every method that applies and plan removal for each.

Do not state a negative ("not Homebrew", "no bundle ID") without quoting the
`(none)` line from the labeled output. If evidence is ambiguous or empty,
rerun the script — never proceed on assumption.

**Symlink handling**: If the `CLI in PATH` section reports a symlink,
determine the relationship first; ask the user only when the target is not
the app being uninstalled:

| Scenario | Action |
|----------|--------|
| Symlink into the app being uninstalled (e.g., Homebrew cask `binary` stanza) | No question needed — removed with the app (cask uninstall handles it) |
| Symlink to a package manager binary (e.g., `npx` → npm) | Only remove the symlink |
| Symlink to another app (e.g., `code` → VS Code) | Ask: remove alias only, or uninstall parent app + all aliases? |
| Multiple symlinks to same app | List all; if uninstalling, remove all |

**Bundled uninstaller**: If found, it takes priority over manual removal in
Phase 6. Only use uninstallers from within the installed app bundle or the
vendor's verified domain.

### Phase 2: Research Official Uninstall Method

**Mandatory**: Understand the correct uninstall procedure before building a
plan.

**Shortcut for Homebrew casks**: if Phase 1 identified a cask,
`brew info --cask <token>` reveals the `zap` stanza (which lists the paths
`--zap` will clean). Reviewing this output satisfies Phase 2 for standard
casks. Web search is only additionally required when the app:

- installs kernel extensions, system extensions, or launch daemons (e.g.,
  `docker`, `karabiner-elements`, `fuse`, VPN clients)
- modifies system configuration (`/etc/hosts`, `/etc/shells`, PATH, shell
  integrations)
- manages credentials or keychains at the system level (e.g., `1password`)

If unsure whether these conditions apply, proceed and revisit this phase after
the Phase 3 scan reveals launch agents, daemons, or system-level files.

**For non-Homebrew apps, or when the above conditions apply**:

1. **First search**: `"<app name>" official uninstall macOS site:<vendor-domain>`
2. **Second search**: `"<app name>" uninstall macOS`
3. **Evaluate sources** — prioritize: official vendor docs > vendor GitHub >
   Apple Support > community forums
4. **Reject** blog spam, SEO-farm "cleaner" app promotions, and unverified
   guides

**Critical**: Some apps have dedicated uninstallers or CLI commands. Missing
these can leave kernel extensions, daemons, or system modifications behind.

### Phase 3: Scan Associated Data

```bash
scripts/scan-residue.sh "$APP_NAME" <bundle-id> [bundle-id...]
```

Pass every bundle ID Phase 1 emitted — multi-bundle apps (e.g., Docker) are
scanned in a single walk. The script enforces the safety rules, refusing to
run instead of producing a match-everything or false-positive-flooded scan:

- An empty bundle ID is refused — resolve it first (Phase 1 output, or
  `defaults read <app>/Contents/Info CFBundleIdentifier`).
- Ambiguous names (too short or too common — see the script's usage output)
  are matched by bundle ID only.
- For CLI-only installs with no bundle ID at all, use
  `scripts/scan-residue.sh --name-only "$APP_NAME"` — refused for ambiguous
  names.

Require manual verification of every name-based match before including it in
the removal plan.

### Phase 4: Subagent Review of Removal Plan

**Mandatory**: Before presenting the plan to the user, launch a read-only
review subagent (no file modifications) to review the entire removal plan.

**Red flags that mean you are rationalizing skipping this phase** — if you
catch yourself thinking any of these, stop and invoke the subagent:

- "This is a simple cask uninstall, review is overkill"
- "All paths look safe, nothing under `/System` or `/usr`"
- "`--zap` handles everything, there is nothing to review"
- "I already ran Phase 1 myself, a second read adds nothing"

The subagent's primary job is **not** catching dangerous paths — those are
easy to spot. Its primary job is catching **misread evidence from Phase 1**
(e.g., declaring "not Homebrew" when `brew list` actually matched the name, or
missing a bundled uninstaller that was buried in a multi-section output).

Subagent prompt must include: app name, bundle ID, installation method, full
file list, uninstall steps in order, the raw Phase 1 detection output, and
research sources.

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

**Default recommendation: remove everything** (clean uninstall). Flag items
containing potentially irreplaceable user data (configuration, databases,
project files) and ask explicitly.

**Recovery approach**: Move user data directories (Application Support,
Preferences) to Trash instead of `rm -rf`. Use `rm -rf` only for caches and
temporary files. To avoid name collisions in Trash, append a timestamp:
`mv "<path>" ~/.Trash/"$(basename "<path>")_$(date +%s)"`.

Warn about: login items, browser extensions, privacy permissions, kernel
extensions requiring reboot.

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

   **Note:** If a launch agent has `KeepAlive` enabled, the process will
   respawn after quit/kill. In that case, fall back to the "Remove
   auto-launch first" option.
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
4. **Use Homebrew** if applicable — use the **exact cask/formula token** from
   Phase 1 `brew list` output (not the user-provided name):
   - Cask: `brew uninstall --zap --cask "<exact-token>"` (`--zap` removes all associated files)
   - Formula: `brew uninstall "<exact-token>"`
   If multiple tokens matched `grep -i` in Phase 1, list all matches and ask
   the user to select the correct one.
   Zap stanzas may `delete:` rather than `trash:` — before running `--zap`,
   move any user-data paths the Phase 5 plan promised to Trash into the Trash
   yourself
5. **Use vendor uninstaller** if one was found in Phase 1
6. **Remove associated data** — Trash for user data, `rm -rf` for caches.
   Explicit paths only
7. **Forget PKG receipts** — **ALWAYS after removing files** (once forgotten,
   file list is unrecoverable): `sudo pkgutil --forget <pkg-id>`

### Phase 7: Post-Removal Verification

**Targeted verification** — check only the specific paths from the removal
plan:

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
