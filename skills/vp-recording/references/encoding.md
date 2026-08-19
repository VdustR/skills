# Encoding And Delivery

## Settings that decide whether it plays

```bash
ffmpeg -y -i input.webm \
  -vf "fps=30,scale=1280:800:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 22 -movflags +faststart out/demo.mp4
```

Three of these are not stylistic:

- `format=yuv420p` (or `-pix_fmt yuv420p`). Other pixel formats decode to a black
  frame or nothing in browser and platform players.
- `-c:v libx264`. H.264 is the format every target plays. Playwright records VP8
  WebM, so a conversion pass is required rather than optional.
- `-movflags +faststart`. Moves the index to the front so playback starts before
  the whole file arrives.

`-crf 22` for a screen recording and `-crf 20` for generated motion both hold up.
`-preset slow` is worth the time on a workstation; see the CI numbers in
`generated-video.md`.

## Check the ffmpeg build, not just the version

Compiled-in filters vary by build, and the difference is silent until a filter is
missing. Measured on one machine:

| Build | `drawtext` | `subtitles` / `ass` |
|---|---|---|
| macOS Homebrew ffmpeg 8.1.1 | absent | absent |
| BtbN static `linux64-gpl` | present | present |

Check the installed build's filter list before depending on any of them.

Without libfreetype and libass there is no text or subtitle filter at all, which
is why `web-demo.md` renders captions in the DOM. With a capable build, a WebVTT
sidecar can be burned in afterward, so captions can be restyled without
re-recording:

```bash
ffmpeg -i out/demo.mp4 -vf "subtitles=out/demo.vtt" out/demo-subbed.mp4
```

Do not install a different ffmpeg without asking. On a runner, fetch a static
build rather than using the package manager: `apt-get` after
`playwright install --with-deps` waits behind the dpkg lock that step still holds,
which stalled past seven minutes in one run.

## MP4 or GIF

Measured on the same 35-second walkthrough:

| Format | Settings | Size |
|---|---|---|
| MP4 | 1280x800, 30 fps, H.264 crf 22 | 948 KB |
| GIF | 900 px wide, 12 fps, 128-color palette | 4.65 MB |

The GIF is 4.9x larger at lower resolution and a third of the frame rate. Choose it
only for a surface with no video player, or when a frame has to move without a
click.

```bash
ffmpeg -y -i out/demo.mp4 \
  -vf "fps=12,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  out/demo.gif
```

## Size ceilings at the destination

Check the target's limit before encoding, not after. For GitHub issue and pull
request attachments the ceilings are 10 MB for images and GIFs, 10 MB for video on
a free plan and 100 MB on a paid plan. A 35-second H.264 walkthrough fits with
room to spare; the same content as a GIF is already halfway to the limit. See
vp-github for the upload itself.
