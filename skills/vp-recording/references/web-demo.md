# Web Demo Recording

Record a scripted walkthrough of a web app in headless Chromium. The browser has
no window, so the run leaves window focus, the real pointer, and the clipboard
alone. A 35-second 1280x800 walkthrough at 30 fps lands around 950 KB as H.264.

## Setup

Needs Playwright with a Chromium binary available, plus ffmpeg with H.264. Verify
both before recording; a missing browser download or codec surfaces only once the
run is already underway.

```js
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  recordVideo: { dir: "out/raw", size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
```

Recording starts when the page is created, before the first paint, so the file
opens on a blank frame. Note the time the page was created, then trim that lead-in
during the ffmpeg pass. Playwright writes WebM; convert it in the same run.

Set the viewport to the size you deliver, at `deviceScaleFactor: 1`. Video
capture does not use the scale factor: a CDP screencast of a 1440x810 viewport
at `deviceScaleFactor: 2` still returned 1440x810 frames with `maxWidth: 2880`,
while `page.screenshot()` from the same context returned 2880x1620. For a sharper
1080p video, record a 1920x1080 viewport instead.

Record with Playwright's bundled Chromium rather than `channel: "chrome"`. With
headless system Chrome 155.0.8059.85 on macOS and Playwright 1.64.1, observed
2026-10-23, every frame lost the bottom 87 px of the viewport, which is where
subtitles sit. Screencast frames came back 1440x723 for a 1440x810 viewport, and
`recordVideo` shrank the page to about half size on a grey canvas.
`--window-size` and the `screen` context option did not change it. The bundled
headless shell, Chromium 151 and 156, returned full frames. Whichever browser
runs, check the first frame's decoded size against the viewport before recording
the walkthrough. `scripts/screencast-poc.cjs` fails on a mismatch, and
`CHANNEL=chrome` reruns it against the system browser.

## Add interaction overlays only when they carry the explanation

For pointer emphasis and click feedback, read `cursor-and-clicks.md`. For shown
shortcuts or typed input, read `keycast.md`. Both overlays must follow the real
Playwright input events so the visual evidence cannot drift from the action.

## Move like a hand

Ease the path and bow it slightly off-axis. Straight-line motion at constant
speed reads as a script even when everything else is right.

```js
const easeInOut = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);

async function glide(to, ms = 620) {
  const from = { ...pos };
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(3, Math.round(ms / (1000 / 60)));
  const bow = Math.min(46, dist * 0.11) * (from.x < to.x ? -1 : 1);
  const nx = -(to.y - from.y) / (dist || 1);
  const ny = (to.x - from.x) / (dist || 1);
  for (let i = 1; i <= steps; i++) {
    const e = easeInOut(i / steps);
    const arc = Math.sin(e * Math.PI) * bow;
    await page.mouse.move(
      from.x + (to.x - from.x) * e + nx * arc,
      from.y + (to.y - from.y) * e + ny * arc,
    );
    await sleep(1000 / 60);
  }
  pos = to;
}
```

Resolve targets from live geometry, never from remembered coordinates:

```js
const box = await page.locator(selector).first().boundingBox();
if (!box) throw new Error(`no box for ${selector}`);
await glide({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
```

`boundingBox()` returns null for a hidden or detached element, so an unguarded
read throws on `box.x` several steps later, with a message that points at the
glide instead of the missing target. Fail on the null with the selector in the
message.

## Add the beats a person has

- Pause about 180 ms after arriving, before pressing. Instant clicks on arrival
  look scripted.
- Split the click so the pointer visibly compresses: `mouse.down()`, 90 ms,
  `mouse.up()`.
- Type with `page.keyboard.type(text, { delay: 62 })` so filtered lists visibly
  narrow as characters land.
- Scroll in increments rather than one jump: `page.mouse.wheel(0, dy / steps)`
  inside a short loop.

## Add explanatory subtitles separately

Read `subtitles.md` when the viewer needs narration, step labels, or an
accessible text track. Subtitles explain intent; keycast reports input. Keep the
two visually and semantically distinct.

## Frame it as a browser window

Wrapping the page in a fake browser chrome bar and insetting it on a dark
background makes the file read as a screen recording instead of a bare viewport.
Do it from the injected script, not by editing the app, so the app stays
reusable:

```js
const content = document.createElement("div");
while (document.body.firstChild) content.appendChild(document.body.firstChild);
shell.append(chromeBar, content);
document.body.appendChild(shell);
```

Give the shell `position: fixed; inset: 26px; border-radius: 12px` with a shadow,
a three-light cluster, and a fake URL pill. Clicks keep working because every
target is resolved from live geometry. The script needs `document.body`, so an
init script has to wait for the document first; `cursor-and-clicks.md` has the
guard.

## Convert and trim

```bash
ffmpeg -y -ss 0.5 -i out/raw/page.webm \
  -vf "fps=30,scale=1280:800:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 22 -movflags +faststart out/demo.mp4
```

Subtract the trim from the recorded cue timings so the sidecar stays aligned.

## Capture sharper frames with a CDP screencast

`recordVideo` writes a lossy WebM that is then encoded a second time. When small
text has to stay sharp, capture PNG frames through the Chrome DevTools Protocol
instead. This works in Chromium only. `scripts/screencast-poc.cjs` implements
and checks every step:

- Call `Page.startScreencast` on a CDP session and answer every
  `Page.screencastFrame` with `Page.screencastFrameAck`. Chrome stops sending
  frames until each one is acknowledged.
- Frames arrive only when the page changes, plus one when the screencast starts.
  `metadata.timestamp` is wall-clock seconds, so hold each frame until the next
  frame's timestamp and hold the last one until the stop time.
- Write the holds as an ffconcat list with one `duration` per frame, and repeat
  the last file, because the concat demuxer ignores the final entry's duration.
  Encode with `fps=30` and cap the output with `-t` at the recorded span. On
  ffmpeg 9.0.2 the repeated entry stretched the final hold, so a 7.3-second span
  encoded to 9.07 seconds without the cap.
- Compare the clip's duration with the wall-clock span. `nb_frames / duration`
  cannot catch a timing error here: a constant-rate encode reports exactly
  30 fps however long its holds are.

## Cut waits instead of speeding them up

When a step waits on something slow, such as an AI reply or a background job,
stop the screencast before the wait and start it again afterwards, so each scene
becomes its own clip. A sped-up wait stays on screen; a cut removes it. Fade each
clip in and out briefly, encode every clip with the same settings, and join them
with the concat demuxer and `-c copy`. Cue times restart in each clip, so offset
a scene's cues by the total duration of the clips before it.
