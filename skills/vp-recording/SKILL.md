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
| macOS window capture | Peekaboo, Screen Recording permission for the calling process, and ffmpeg for verifying and converting the `.mov` |

The first two run on any platform and inside a container. The third depends on
macOS system tools and has no equivalent here for Linux or Windows.

## Prefer the browser path

If the subject runs in a browser, use the browser path even when a desktop
recorder is already open. It is fully headless, so it never takes window focus or
moves the real pointer, and it survives being run from a scheduled job.

The desktop path cannot have both a visible cursor and no interference: drawing
the real cursor requires moving the real pointer, which takes it away from
whoever is using the machine. Driving a native app in the background through
accessibility actions leaves no cursor in the frame at all.

## Check what you produced

Never hand over a video you have not looked at. Rendering silently produces
plausible garbage: a blank first frame, a cursor parked off-target, a click that
missed.

```bash
# Several moments tiled into one image
ffmpeg -y -i out/demo.mp4 -vf "fps=2,scale=420:-1,tile=4x2" -frames:v 1 /tmp/grid.png

# A specific moment at full resolution
ffmpeg -y -i out/demo.mp4 -ss 12.5 -frames:v 1 /tmp/frame.png
```

On macOS, `peekaboo capture video out/demo.mp4 --sample-fps 1 --no-diff --path
/tmp/sheet` writes the same contact sheet in one command.

Confirm the file holds real frames rather than samples.

```
nb_frames / duration
```

A frame-rendered file lands on its target rate almost exactly, so anything under
it means dropped frames. Real-time recorders are variable rate and legitimately
land well below their timebase: `screencapture` averaged 38 fps against a 60 fps
timebase in one measurement. Change-aware sampling is what to watch for, and it is
not subtle: `peekaboo capture live` kept 1 frame across 4 seconds on a static
region. Treat single-digit effective fps as sampled, not a rate merely below the
timebase.

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
