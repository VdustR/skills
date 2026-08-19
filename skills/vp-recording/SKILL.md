---
name: vp-recording
description: >-
  Produce a video of software: a scripted browser walkthrough with a visible
  cursor and subtitles, a frame-accurate render of generated or mathematical
  motion, or a macOS window capture. Use for demo videos, screencasts,
  walkthroughs, bug reproductions on video, animated GIFs, and any request to
  record, film, or show something moving rather than a screenshot. The browser and
  render paths are cross-platform; the window-capture path is macOS only.
  Boundary: use vp-github to attach the result to an issue or pull request.
---

# Recording

Pick the producer by what is being filmed. All three produce comparable output;
they differ in where the pixels come from, and only the first two run unattended.

| Filming | Path | Unattended |
|---|---|---|
| A web app being used | Headless browser driven by a script. Read `references/web-demo.md`. | Yes |
| Generated or mathematical motion, no interaction | Deterministic frame render. Read `references/generated-video.md`. | Yes |
| A native app or anything outside a browser, on macOS | Window-scoped screen capture. Read `references/macos-window-capture.md`. | Capture yes, driving no |

Then read `references/encoding.md` before delivering the file. Default output
settings decide whether the video plays inline or downloads as a blob.

## Check the environment before recording

Every path has dependencies, and a missing one fails late, after a long render.
Confirm what the chosen path needs is present and working first, and install or
ask about anything missing before starting.

| Path | Depends on |
|---|---|
| Browser walkthrough | Node, Playwright with a browser binary, ffmpeg with H.264 |
| Generated render | Node, Playwright with a browser binary, ffmpeg with H.264 |
| macOS window capture | Screen Recording permission for the calling process, and ffmpeg for verifying and converting the `.mov`. Window-id lookup needs either Swift for the bundled script or a desktop automation tool. An input tool as well, but only if the app has to do something on camera |

The first two run on any platform and inside a container. The third depends on
macOS system tools and has no equivalent here for Linux or Windows.

## Prefer the browser path

If the subject runs in a browser, use the browser path even when a desktop
recorder is already open. It is fully headless, so it never takes window focus or
moves the real pointer, and it survives being run from a scheduled job.

A tool that drives the local machine cannot show a visible cursor without
interfering, because the machine has one system cursor and drawing it in the
frame means moving it away from whoever is at the keyboard. Driving the app in
the background through accessibility actions leaves no cursor in the frame at
all. A tool with its own virtual display escapes both, but then that display is
what you record, and the user's own window never appears.

## Pick the input tool by session, not by habit

Recording a macOS window needs no automation tool. Driving the app on camera
does, and which one depends on the agent. Prefer the first:

1. The session's own computer-use tool, when the agent has one. Codex computer
   use is an example.
2. Peekaboo, which any macOS session can install.

With neither available, use the browser path, or ask the user to drive while the
recorder runs.

Read the tool's own skill or `--help` for current syntax. This skill names no
input commands, because flags get renamed and a copied invocation goes stale.

## Check what you produced

Never hand over a video you have not looked at. Rendering silently produces
plausible garbage: a blank first frame, a cursor parked off-target, a click that
missed.

Derive the sampling rate from the duration so the sheet spans the whole file. A
fixed `fps=2` into a 4x2 tile covers the first four seconds and nothing else,
which reads as a failed recording when the action starts at ten seconds.

```bash
# Twelve moments spread across the whole file
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/demo.mp4)
ffmpeg -y -i out/demo.mp4 -vf "fps=12/$DUR,scale=420:-1,tile=4x3" -frames:v 1 /tmp/grid.png

# A specific moment at full resolution
ffmpeg -y -i out/demo.mp4 -ss 12.5 -frames:v 1 /tmp/frame.png
```

Crop to the region that changes before scaling. A full application window at
420 pixels wide is too small to read the text that proves the action worked.

Confirm the file holds real frames rather than samples.

```
nb_frames / duration
```

A frame-rendered file lands on its target rate almost exactly, so anything under
it means dropped frames. Real-time recorders are variable rate and legitimately
land well below their timebase: `screencapture` averaged 38 fps against a 60 fps
timebase in one measurement. Watch instead for change-aware sampling, which drops
much further. Peekaboo's live capture kept 1 frame across 4 seconds on a static
region. Treat single-digit effective fps as a sampled file rather than a rate
below the timebase.

```bash
ffprobe -v error -show_entries stream=width,height,r_frame_rate,nb_frames \
  -show_entries format=duration,size -of default=noprint_wrappers=1 out/demo.mp4
```

## Never record the wrong pixels

Screen capture by rectangle records whatever is composited on top of that
rectangle, which is not necessarily the target window. Capture by window id
instead. `references/macos-window-capture.md` has the rule and the command; treat
it as mandatory when anyone else's content could be on screen. The same hazard
applies to any platform's rectangle-based recorder.
