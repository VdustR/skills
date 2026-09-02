---
name: vp-recording
description: >-
  Capture software as a file: a still screenshot of a running interface, a
  scripted browser walkthrough with a visible cursor and subtitles, a
  frame-accurate render of generated or mathematical motion, or a macOS window
  capture. Use for screenshots, before-and-after images, demo videos, screencasts,
  walkthroughs, animated GIFs, a bug reproduction that has to be delivered as an
  image or a video, and any request to record, film, screenshot, or show what an
  interface is doing, including a UI behind a login. Every path ends at a file on
  disk. The browser paths, still and video, and the render path are
  cross-platform, though a still behind a login needs a display; capturing a
  native window, still or video, is macOS only.
  Boundary: use vp-minimal-repro for a re-runnable reproduction that needs no
  image, and vp-github to attach the result to an issue or pull request.
---

# Capture

Pick the producer by what is being captured and whether it moves. Every path ends
at a file on disk, which is what a destination such as vp-github takes as input.

| Capturing | Path | Unattended |
|---|---|---|
| A still image of a running interface | Screenshot straight to a file. Read `references/still-capture.md`. Native windows are macOS only | Yes, apart from one interactive login |
| A web app being used | Headless browser driven by a script. Read `references/web-demo.md`. | Yes |
| Generated or mathematical motion, no interaction | Deterministic frame render. Read `references/generated-video.md`. | Yes |
| A native app or anything outside a browser, on macOS | Window-scoped screen capture. Read `references/macos-window-capture.md`. | Capture yes, driving no |

Read `references/encoding.md` before delivering a video: default output settings
decide whether it plays inline or downloads as a blob. Its size-ceiling table
applies to a still as well.

## Check the environment before capturing

Every path has dependencies, and a missing one fails late, after a long render.
Confirm what the chosen path needs is present and working first, and install or
ask about anything missing before starting.

| Path | Depends on |
|---|---|
| Still of a web UI | Node and Playwright with a browser binary. No ffmpeg. A display too, but only when the capture needs an interactive login |
| Still of a macOS window | Screen Recording permission for the calling process, and Swift for the bundled window-id script or a desktop automation tool that lists window ids. An accessibility-capable automation tool as well, if the paired text assertion is read from the window rather than written by hand |
| Browser walkthrough | Node, Playwright with a browser binary, ffmpeg with H.264 |
| Generated render | Node, Playwright with a browser binary, ffmpeg with H.264 |
| macOS window capture | Screen Recording permission for the calling process, and ffmpeg for verifying and converting the `.mov`. Window-id lookup needs either Swift for the bundled script or a desktop automation tool. An input tool as well, but only if the app has to do something on camera |

The browser paths, still and video, run on any platform and inside a container,
with one exception: a still that needs an interactive login needs a display for
the whole capture, so it does not run on a displayless runner. That exception is
stated once, under Prefer the browser path, and every platform claim here defers
to it. The macOS window paths depend on macOS system tools and have no equivalent
here for Linux or Windows.

## Prefer the browser path

If the subject runs in a browser, use the browser path for a still or a video,
even when a desktop recorder is already open. Without a login it is fully
headless, so it never takes window focus or moves the real pointer, and it
survives being run from a scheduled job.

Two conditions route a login away from this path before it applies. Use
vp-agent-browser-session when the profile has to survive the task instead of being
discarded, and when the login needs complete Chrome state such as IndexedDB,
service workers, or SSO. It owns managed profile identity, permissions, and
deletion. The throwaway-profile sequence in `references/still-capture.md` is for a
login that begins and ends inside one capture.

A still behind a login is the exception, and it stays the exception through the
whole sequence. The interactive sign-in needs a visible window and a display, and
Playwright cannot switch that running context to headless afterwards, so the
capture happens in the same visible window. Plan for a display for the entire
run, and expect it to take focus. It does not run from a scheduled job or a
headless container. `references/still-capture.md` has the sequence and the one
case where a later capture can go headless.

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

Never hand over a file you have not looked at. Capture silently produces
plausible garbage: a blank first frame, a cursor parked off-target, a click that
missed, a window that was not the one you named.

For a still, open the image and confirm it is the window you meant and the state
you are claiming. That check is mandatory on every path and needs no tool beyond
an image viewer.

Pair the image with a text assertion as well, so the caption and the pixels have
to agree. A browser still reads it from the page. A native window reads it from
that window's accessibility tree, which needs an accessibility-capable automation
tool; without one, write the claim out by hand from what the image shows rather
than skipping the pairing. Take the assertion from the state the image was taken
in, after waiting for the thing the image is evidence for.
`references/still-capture.md` has both producers and the waiting rule. The rest of
this section is the video check.

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

## Never capture the wrong pixels

Only a window id names one window. A screen rectangle, a display, the frontmost
window, an application name, and a process id all leave the selection to the
capturer. A rectangle records whatever is composited on top of it. An application
name or a process id selects one of that application's windows, and the selection
is the tool's. This is how an unrelated conversation ends up in a capture that was
supposed to show a test page.

Name the window by id, then confirm the result before using it. Ask for the
tool's machine-readable output and compare the window id it reports against the
id you intended; a plain success message does not carry that evidence.
`references/macos-window-capture.md` has the lookup and the command,
`references/still-capture.md` has the measured targeting table, and both are
mandatory when anyone else's content could be on screen.

Confirming the file is not optional when it is bound for a GitHub attachment. The
upload has no documented deletion path. vp-github records that access depends on
repository visibility and whether posted content references the asset, and a
later reference or visibility change can expand that access. Discarding a draft
does not provide a reliable way to recall a capture of the wrong window.

## Related skills

- [`vp-github`](https://github.com/VdustR/skills/tree/main/skills/vp-github) when
  the finished image or recording must appear in an issue or pull request.
- [`vp-agent-browser-session`](https://github.com/VdustR/skills/tree/main/skills/vp-agent-browser-session)
  when the login behind a capture needs a managed profile that outlives the task.
- [`vp-minimal-repro`](https://github.com/VdustR/skills/tree/main/skills/vp-minimal-repro)
  when a bug capture also needs a re-runnable reproduction.
