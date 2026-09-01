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
| `-o` | Omit the window shadow, which makes the file exactly 2x the window bounds |
| `-C` | Composite the real cursor into the frame |
| `-k` | Draw the click highlight |
| `-x` | Suppress the shutter sound |
| `-V<sec>` | Stop after this many seconds |
| `-D<n>` | Choose a display |
| `-g` / `-G<id>` | Record audio |

The real cursor does appear in window-scoped capture, confirmed frame by frame.
The click highlight is documented but was not visually confirmed.

## Capture by window id, never by rectangle or by application

`screencapture -R<x,y,w,h>` records whatever is composited on top of that screen
rectangle. If the target window is behind another app, the file contains the
other app. This is how an unrelated chat window ends up in a recording that was
supposed to show a test page.

`screencapture -l<windowid>` records only the target window's own pixels.
Anything in front of it, behind it, or beside it is absent. Use it whenever
anyone else's content could be on screen, which on a shared workstation is
always.

A desktop automation tool usually accepts an application name or a process id as
well, and those carry the same failure mode from the other direction: the tool
selects one of that application's windows, and the more windows the application
has open, the less likely that is the one you meant. Pass the window id there
too, and read back the id the tool reports. `still-capture.md` has the measured
targeting table.

`scripts/window-id.swift` reads `CGWindowListCopyWindowInfo` directly and needs
nothing but Swift from Xcode or the Command Line Tools. Confirm it is there once
with `xcode-select -p`; if it is not, any desktop automation tool's window
listing returns the same id and bounds. It filters to layer 0, so
menu bar items and other chrome stay out of the list. An app with several open
windows prints several rows; the title and size columns are there to tell them
apart. Only genuinely on-screen windows appear, which is narrower than some
automation tools report: Peekaboo listed two hidden 800x600 Electron windows for
the same app that `CGWindowListCopyWindowInfo` returns only under
`.optionAll`. If the session already has a desktop automation tool, its own window
listing works too and agrees on the id.

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

## Record with `-o` and coordinates map by halves

`-o` drops the window shadow, and the file lands at exactly twice the window's
point size on a 2x display: a 1556x785 window records as 3112x1570. Without it
the same window records as 3336x1794, and those extra 224 pixels sit between
every measurement and the screen point it should map to.

`-C` still composites the cursor into a shadowless file. Confirmed against a
pointer parked at the same coordinate for both variants, so record with `-o`
whether or not the cursor matters.

The same command without `-v` writes a still, which is the deliverable in
`still-capture.md` and also how to measure a click target before recording:

```bash
screencapture -x -o -l37528 shot.png
```

Then `screen point = window origin + pixel / 2`. The window origin comes from the
bounds that `scripts/window-id.swift` prints.

Frame rate is variable. A 5.23-second file held 201 frames, about 38 fps against
a 60 fps timebase.

## Driving the app: pick the tool the session already has

Two kinds of tool can drive a native app. Prefer the first:

1. The session's own computer-use tool, when the agent has one. Codex computer
   use is an example.
2. Peekaboo, which any macOS session can install.

With neither of those available, do not drive the app from here. Record the
browser path instead when the subject runs in a browser, or ask the user to
drive while the recorder runs.

Read the tool's own skill or `--help` for current syntax before the first call.
This skill names no input commands, because flags get renamed and a copied
invocation goes stale. Measured behavior is different: it stays true after a
rename, so the limits below name their source and stay.

Three constraints apply whichever tool you use:

- **One system cursor, for tools that drive the local machine.** Drawing the
  pointer in the frame means moving the real pointer, which takes it away from
  whoever is at the keyboard. Peekaboo requires an explicit consent flag before
  it will do this; check whether your tool warns at all. A tool that drives its
  own virtual display carries its own cursor and disturbs nobody, but then it is
  that display you record, not the window on this screen.
- **Background input leaves no cursor.** Driving through accessibility actions
  moves no pointer, so the recording shows changes with nothing visible causing
  them.
- **Background input cannot always target one window.** Peekaboo refuses a
  window-scoped background keystroke outright, and background binary paste
  reports `effect: unverifiable` while the target receives nothing. Check the
  equivalent limits on whichever tool you use.

The browser path escapes this by drawing its own pointer inside the page while
the real one stays put. A native window has no such layer, so getting both a
visible cursor and no interference means recording in the background and
compositing a cursor in post.

## Peekaboo's own recorder samples on change

If Peekaboo is the tool at hand, its live capture writes a real H.264 file but
keeps only frames that changed: a static 320x240 region over 4 seconds kept 1
frame and dropped 11. It caps at 180 seconds and 15 active fps. Use it to prove
what an automation run did. Use `screencapture` for anything a person will watch.
