# macOS Window Capture

Record one native window with `screencapture`, the macOS system recorder.
Recording needs no automation tool. Making the app do something on camera does,
and which tool that is depends on the session.

**macOS workstation only.** A hosted macOS CI runner has no interactive session
in which to grant Screen Recording permission and no on-screen application to
capture, so treat this path as unavailable in CI. That reasoning has not been
tested against a hosted runner; the browser paths are the ones verified to run
unattended. There is no Linux or Windows equivalent here. `ffmpeg` can grab a
screen through `x11grab`, `gdigrab`, or `kmsgrab`, and OBS is the usual GUI
answer, but neither has been verified in this skill. If the subject runs in a
browser, `web-demo.md` is cross-platform and is the better answer anyway.

## Quick path

Paths below are relative to the skill directory.

```bash
# 1. Resolve the window id.
./scripts/window-id.swift "Claude"
# 37528	Claude	Claude	1556x785

# 2. Start recording in the background. -V is a ceiling, not the plan.
screencapture -v -o -k -C -x -l37528 -V 120 out/window.mov &
SC=$!

# 3. Wait out the startup delay, then drive the app.

# 4. Stop when the action is finished.
kill -INT $SC

# 5. Confirm the file holds real frames.
ffprobe -v error -show_entries stream=width,height,nb_frames \
  -show_entries format=duration -of default=noprint_wrappers=1 out/window.mov
```

## Flags

| Flag | Effect |
|---|---|
| `-v` | Record video instead of a still |
| `-l<id>` | Capture one window by CGWindowID |
| `-o` | Omit the window shadow |
| `-C` | Composite the real cursor into the frame |
| `-k` | Draw the click highlight |
| `-x` | Suppress the shutter sound |
| `-V<sec>` | Stop after this many seconds |
| `-D<n>` | Choose a display |
| `-g` / `-G<id>` | Record audio |

The real cursor does appear in window-scoped capture, confirmed frame by frame.
The click highlight is documented but was not visually confirmed.

## Capture by window id, never by rectangle

`screencapture -R<x,y,w,h>` records whatever is composited on top of that screen
rectangle. If the target window is behind another app, the file contains the
other app. This is how an unrelated chat window ends up in a recording that was
supposed to show a test page.

`screencapture -l<windowid>` records only the target window's own pixels.
Anything in front of it, behind it, or beside it is absent. Use it whenever
anyone else's content could be on screen, which on a shared workstation is
always.

`scripts/window-id.swift` reads `CGWindowListCopyWindowInfo` directly and needs
nothing but Swift from Xcode or the Command Line Tools. It filters to layer 0, so
menu bar items and other chrome stay out of the list. If the session already has
a desktop automation tool, its own window listing works too and agrees on the id.

## Stop on a signal, not on a timer

`-V<sec>` is the wrong primary stop when an agent drives the action, because tool
round-trips make the duration unpredictable. One 22-second recording in a live
session ended before the agent could press Enter.

`SIGINT` finalizes a playable file. Measured: a run interrupted mid-capture wrote
98 frames over 2.59 seconds and played back normally. Keep `-V` as a ceiling so a
crashed driver cannot leave the recorder running.

`screencapture -v` takes about **1.4 seconds** to start recording. The same run
slept 4 seconds before the interrupt and captured 2.59 seconds of video. Give it
that lead-in before the first action, and expect the file to open on whatever was
already on screen.

## Use `-o`, then map coordinates by halves

With `-o`, the file is exactly twice the window's point size on a 2x display: a
1556x785 window records as 3112x1570. Without it, the same window records as
3336x1794, adding a 112-pixel shadow margin on each side and breaking the
arithmetic.

To derive a click point, take a still first and measure on it:

```bash
screencapture -x -o -l37528 shot.png
```

Then `screen point = window origin + pixel / 2`. The window origin comes from the
bounds that `scripts/window-id.swift` prints.

Frame rate is variable. A 5.23-second file held 201 frames, about 38 fps against
a 60 fps timebase.

## Driving the app: pick the tool the session already has

This skill names no input commands, because command surfaces move and a copied
invocation goes stale. Resolve the tool in this order:

1. The session's own computer-use tool, when it has one.
2. Peekaboo, which any macOS session can install.
3. Neither: record the browser path instead, or ask the user to drive while the
   recorder runs.

Read that tool's own skill or `--help` for current syntax before the first call.

Three constraints hold whichever tool wins:

- **One system cursor.** Drawing the pointer in the frame means moving the real
  pointer, which takes it away from whoever is at the keyboard. Tools ask for
  explicit consent before doing that.
- **Background input leaves no cursor.** Driving through accessibility actions
  moves no pointer, so the recording shows changes with nothing visible causing
  them.
- **Background input cannot always target one window.** Peekaboo refuses a
  window-scoped background keystroke outright, and background binary paste
  reports `effect: unverifiable` while the target receives nothing. Check the
  equivalent limits on whichever tool you use.

Getting a visible cursor and no interference at the same time means recording in
the background and compositing a synthetic cursor afterward, which is what
`web-demo.md` does inside the browser.

## Peekaboo's own recorder samples on change

If Peekaboo is the tool at hand, its live capture writes a real H.264 file but
keeps only frames that changed: a static 320x240 region over 4 seconds kept 1
frame and dropped 11. It caps at 180 seconds and 15 active fps. Use it to prove
what an automation run did. Use `screencapture` for anything a person will watch.
