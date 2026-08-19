# Generated Video

Render motion that has no interaction: a canvas animation, a data visualization
over time, a mathematical construction. Stepping an exact timeline gives a true
constant frame rate and reproducible pixels, which real-time recording cannot.

Needs Playwright with a browser binary and ffmpeg with H.264. Confirm both before
starting. The ffmpeg process launches only once the first frame is ready, so a
missing binary or codec surfaces well into a long render.

## Make the page a pure function of time

The page exposes one entry point and reads no clock:

```js
window.renderFrame = function (timeSeconds) { /* draw */ };
window.ANIM_DURATION = 12;
```

No `requestAnimationFrame`, no `Date.now()`, no CSS transitions or animations. Any
state carried between calls, such as a trail of previous positions, must be rebuilt
from `timeSeconds` inside the call. Otherwise the output depends on which order the
frames were requested in, and a resumed or reordered render produces different
pixels.

This is also why the browser path in `web-demo.md` cannot use this technique: CSS
transitions advance on the compositor's own timeline, which a mocked clock does not
control.

## Step the timeline and pipe to ffmpeg

Write PNGs straight into ffmpeg's stdin rather than to disk.

```js
const ff = spawn(FFMPEG, [
  "-y", "-loglevel", "error",
  "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-preset", X264_PRESET, "-crf", "20",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", outPath,
], { stdio: ["pipe", "inherit", "inherit"] });

for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.renderFrame(t), i / FPS);
  await write(await page.screenshot({ type: "png" }));
}
ff.stdin.end();
```

Respect backpressure on `ff.stdin.write`; wait for `drain` when it returns false.
Attach the `drain` and `error` listeners with `once` per write, or Node warns about
leaked listeners after a few hundred frames.

## Budget the cost before running it

This path is CPU-bound and scales badly on small machines. Measured: 720 frames at
1280x720, 60 fps, `-preset slow` took **31 seconds** on an M-series laptop and ran
past **20 minutes** on a 2-core CI runner before being cancelled.

Make three things tunable and dial them down anywhere but a workstation:

| Knob | Workstation | Constrained runner |
|---|---|---|
| Frame rate | 60 | 24 |
| Duration | full | a few seconds |
| x264 preset | `slow` | `veryfast` |

Also make the ffmpeg binary itself overridable via an environment variable. CI
images and local installs disagree about both the path and the compiled-in
filters.
