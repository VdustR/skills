# macOS Window Capture

**macOS workstation only.** Everything here depends on `screencapture`, a macOS
system binary, and on Peekaboo for window and pointer control. macOS alone is not
enough: a hosted macOS CI runner has no interactive session in which to grant
Screen Recording permission and no on-screen application to capture, so treat this
path as unavailable in CI. That reasoning has not been tested against a hosted
runner; the browser paths are the ones verified to work unattended. There is no Linux or Windows
equivalent in this skill: `ffmpeg` can grab a screen through `x11grab`, `gdigrab`,
or `kmsgrab` on those platforms, and OBS is the usual GUI answer, but neither has
been verified here. If the subject runs in a browser, `web-demo.md` is
cross-platform and is the better answer anyway.

Record a native macOS window with the built-in recorder. `screencapture` ships
with macOS, but two things around it do not come free: Peekaboo has to be
installed to resolve window ids and drive the pointer, and the calling process
needs Screen Recording permission. Check both before recording, and guide the user
through granting permission rather than retrying a capture that returns empty
frames.

## Capture by window id, never by rectangle

`screencapture -R<x,y,w,h>` records whatever is composited on top of that screen
rectangle. If the target window is behind another app, the file contains the other
app. This is how an unrelated chat window ends up in a recording that was supposed
to show a test page.

`screencapture -l<windowid>` records only the target window's own pixels. Anything
in front of it, behind it, or beside it is absent. Use it whenever anyone else's
content could be on screen, which on a shared workstation is always.

```bash
# Resolve the window id, then record it
peekaboo window list --app "Google Chrome" --json \
  | python3 -c 'import json,sys
windows = (json.load(sys.stdin).get("data") or {}).get("windows") or []
match = next((w for w in windows if "Target" in (w.get("window_title") or "")), None)
sys.exit("no window title matched; titles seen: %s" % [w.get("window_title") for w in windows]) if not match else print(match["window_id"])'

screencapture -v -k -C -x -l<windowid> -V 20 out/window.mov
```

| Flag | Effect |
|---|---|
| `-v` | Record video instead of a still |
| `-l<id>` | Capture one window by CGWindowID |
| `-C` | Composite the real cursor into the frame |
| `-k` | Draw the click highlight |
| `-x` | Suppress the shutter sound |
| `-V<sec>` | Stop after this many seconds |
| `-D<n>` | Choose a display |
| `-g` / `-G<id>` | Record audio |

The real cursor does appear in window-scoped capture, confirmed frame by frame.
The click highlight is documented but was not visually confirmed.

Output is H.264 with a 60 fps timebase at native 2x scale: a 760x520 window
records as 1744x1264, including its shadow margin. Frame rate is variable, so a
5.23-second file held 201 frames, about 38 fps average.

If `peekaboo window list --app <name>` returns nothing, resolve the process first
and select by pid. A Playwright-managed Chromium, for example, reports its process
name as `Google Chrome`:

```bash
PID=$(ps ax -o pid=,command= | grep "<binary-path-fragment>" | grep -v "type=" | awk '{print $1}' | head -1)
peekaboo window list --pid "$PID" --json
```

## Driving the app is the hard part

Recording a desktop app is easy. Making it do something on camera is where the
tradeoff bites, and it cannot be avoided:

- **Visible cursor** requires moving the real pointer, for example
  `peekaboo move --at x,y --global --smooth --profile human --duration 800`. That
  takes the pointer away from whoever is at the keyboard.
- **Background operation** means driving through accessibility actions, which move
  no pointer, so the recording has no cursor in it.

Getting both means recording in the background and compositing a synthetic cursor
afterward, which is the browser path's technique moved to post-production. If the
subject runs in a browser, use `web-demo.md` instead.

Peekaboo's own background input limits, all confirmed:

- Background text delivery works through the accessibility path.
- Background binary paste does not. Pasting an image file to an unfocused app
  returns `effect: unverifiable` with "Cmd+V may have pasted; do not retry", and
  the target receives nothing. Image and video payloads need `--foreground`.
- Background keystrokes cannot target one window. Adding `--window-title` is
  refused: "Background keyboard delivery cannot safely target a specific window."
- `--long-press` requires `--foreground`.

## Peekaboo's own recorder is for evidence, not demos

`peekaboo capture live --video-out out.mp4` writes a real H.264 file in background
focus mode, but it samples on change rather than recording every frame. A static
320x240 region over 4 seconds kept 1 frame and dropped 11. It caps at 180 seconds
and 15 active fps, and `capture live` has no flag to force every frame.

Use it to prove what an automation run did. Do not use it to produce something a
person will watch.
