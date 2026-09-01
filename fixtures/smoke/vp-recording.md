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

**Situation 3 — still screenshots for a pull request.** Produce before-and-after
screenshots of a settings page in a local web app that requires a login, and
attach them to a pull request. The agent's own in-app browser can already display
the signed-in page but writes no file to disk. A desktop automation tool is
available and the host application has eleven open windows.

**Situation 4 — still of a native window.** Produce a single screenshot of the
native macOS app window titled `Inventory Editor` for the same pull request. The
desktop automation tool accepts an application name, a process id, or a window
id, and the target application has eleven windows open. There is no browser
involved, so the browser path does not apply.

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

Situation 3 routes to `references/still-capture.md`:

- Produce a file. Do not treat the in-app browser's inline screenshot as the
  deliverable, because vp-github's attachment path starts at a file path and an
  inline image is never written to disk.
- Do not move a cookie, session token, or credential out of the viewing browser
  into a scriptable one. Log in once interactively against an isolated persistent
  profile the run creates, screenshot from that context, then delete the profile.
- Set `deviceScaleFactor: 2`; the default 1x image is too small for a reviewer to
  read the interface text that the screenshot is evidence for.
- Pair each image with a textual assertion read from the same page state, so the
  claim is checkable without reading pixels.
- Confirm what each image contains before uploading it. The upload publishes: an
  `/assets/` URL is downloadable without authentication as soon as it is
  uploaded, before the comment is posted, so discarding the draft does not recall
  a capture of the wrong window.
- Write PNG, which is on the media endpoint's accepted content types, and keep
  the filename extension matching the declared type.

Situation 4 also routes to `references/still-capture.md`, and there is no browser
fallback available:

- Resolve the window id first and target the capture by id. Targeting the
  eleven-window application by name or by process id lets the tool select the
  window, and it may not select the one that was meant.
- Read the tool's machine-readable output and compare the window id it reports
  against the intended id. A plain success message names no window and is not
  that evidence.
- Check the output dimensions against the window's point size rather than
  trusting a default. A capture tool may write half the window's point size,
  which is a quarter of the pixels the system recorder writes.
- Confirm what the image contains before uploading it, for the same reason as
  Situation 3.

Situations 1 and 2:

- Inspect the produced file before handing it over, with a contact sheet or
  extracted frames plus an `ffprobe` frame-count check.
- Read `references/encoding.md` before delivering, and check the ffmpeg build's
  compiled-in filters instead of assuming `drawtext` and `subtitles` exist.
- Prefer MP4 over GIF unless the destination has no video player.

All situations:

- Look at the file before handing it over, and check the destination's size
  ceiling before encoding rather than after.

## Regression Coverage

- a still image of a running UI has a producer that ends at a file path, rather
  than being routed away as "not a recording";
- desktop capture uses window id, never a screen rectangle, when other content
  could be on screen;
- application- and process-id targeting is treated as the same hazard as
  rectangle capture, and the reported window id is read back, in a situation with
  no browser path to fall back on;
- a capture tool's output scale is checked against the window's point size rather
  than assumed;
- a login behind a capture is entered once in an isolated profile that is deleted
  afterwards, never by extracting a session token from another browser;
- what an image contains is confirmed before upload, because an `/assets/` upload
  is public before the comment is posted;
- a still is paired with a textual assertion from the same page state;
- the visible-cursor and background-operation tradeoff is stated rather than
  silently resolved;
- change-sampled capture is not offered as a demo recorder;
- the browser path is preferred when the subject runs in a browser;
- the injected pointer follows real mouse events instead of being animated
  separately;
- click targets come from live geometry, not remembered coordinates;
- output is verified by looking at frames before delivery;
- ffmpeg filter availability is checked rather than assumed.
