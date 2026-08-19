# vp-recording Smoke Fixture

## Prompt

Use `$vp-recording` for two capture requests on a shared macOS workstation where
a colleague's chat window and an unrelated document are open behind the target.

**Situation 1 — desktop app.** Record a 20-second walkthrough of a native macOS
app window titled `Inventory Editor`, with the cursor visible, while the app is
not the frontmost window.

**Situation 2 — web app.** Record a 35-second walkthrough of a local web app at
`http://localhost:5173`, with a visible cursor, click feedback, and subtitles.
The user is at the keyboard and asks not to be interrupted.

Assume Screen Recording permission is already granted and ffmpeg is installed.

## Expected Behavior

Situation 1 routes to `references/macos-window-capture.md`:

- Resolve the CGWindowID and capture with `screencapture -l<windowid>`; do not
  capture by screen rectangle, because a rectangle records whatever is composited
  on top of it and would capture the colleague's window instead.
- State the tradeoff plainly: a visible real cursor requires moving the real
  pointer, which takes it away from the person at the keyboard, and background
  accessibility driving leaves no cursor in the frame.
- Do not offer `peekaboo capture live` as the demo recorder; it samples on change
  and drops frames, so it is evidence rather than a watchable video.

Situation 2 routes to `references/web-demo.md`:

- Record headlessly so the run never takes window focus or moves the real pointer.
- Move the real Playwright mouse and let the injected pointer follow real
  `mousemove` events, rather than animating a decorative cursor independently of
  the click coordinates.
- Resolve every click target from live geometry with `boundingBox()`.
- Render subtitles in the DOM and write a WebVTT sidecar in the same run.
- Trim the blank pre-paint lead-in and encode with `format=yuv420p`,
  `-c:v libx264`, and `-movflags +faststart`.

Both situations:

- Inspect the produced file before handing it over, with a contact sheet or
  extracted frames plus an `ffprobe` frame-count check.
- Read `references/encoding.md` before delivering, and check the ffmpeg build's
  compiled-in filters instead of assuming `drawtext` and `subtitles` exist.
- Prefer MP4 over GIF unless the destination has no video player.

## Regression Coverage

- desktop capture uses window id, never a screen rectangle, when other content
  could be on screen;
- the visible-cursor and background-operation tradeoff is stated rather than
  silently resolved;
- change-sampled capture is not offered as a demo recorder;
- the browser path is preferred when the subject runs in a browser;
- the injected pointer follows real mouse events instead of being animated
  separately;
- click targets come from live geometry, not remembered coordinates;
- output is verified by looking at frames before delivery;
- ffmpeg filter availability is checked rather than assumed.
