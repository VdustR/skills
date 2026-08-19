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

## Make the cursor a follower, not an animation

Move the real Playwright mouse, and let an injected SVG pointer position itself
from real `mousemove` events.

Hover states, `:active`, and every handler fire exactly as they would for a
person, and the drawn pointer cannot drift from where the click actually lands.
Animating a decorative cursor separately from the click coordinates produces
video where the arrow visibly misses the button it is pressing.

Inject through `page.addInitScript` so the layer exists from the first paint:

```css
html, body, * { cursor: none !important; }
#cursor { position: absolute; left: 0; top: 0; transform: translate(-4px, -3px);
          filter: drop-shadow(0 3px 6px rgba(0,0,0,.55)); }
#cursor.is-down { scale: .84; }
```

```js
let x = innerWidth / 2, y = innerHeight / 2;
const place = () => { cursor.style.translate = `${x}px ${y}px`; };
addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; place(); }, true);
addEventListener("mousedown", (e) => { cursor.classList.add("is-down"); ripple(e); }, true);
addEventListener("mouseup", () => cursor.classList.remove("is-down"), true);
```

Use the classic macOS arrow shape rather than a dot. A circle reads as an
automation artifact; an arrow reads as a person.

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
await glide({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
```

## Add the beats a person has

- Pause about 180 ms after arriving, before pressing. Instant clicks on arrival
  look scripted.
- Split the click so the pointer visibly compresses: `mouse.down()`, 90 ms,
  `mouse.up()`.
- Type with `page.keyboard.type(text, { delay: 62 })` so filtered lists visibly
  narrow as characters land.
- Scroll in increments rather than one jump: `page.mouse.wheel(0, dy / steps)`
  inside a short loop.

## Subtitles in the DOM

Render captions as a styled element in the page and record them as part of the
frame. The alternative, burning them in with ffmpeg, needs a build with
libfreetype and libass, which the macOS Homebrew ffmpeg on this machine does not
have. See `encoding.md`.

Write the cue timings to a WebVTT sidecar in the same run so the captions can be
restyled later without re-recording:

```js
async function say(text, holdMs = 2400) {
  const start = Date.now() - videoStart;
  await page.evaluate((t) => window.__demo.caption(t), text);
  await sleep(holdMs);
  cues.push({ start, end: Date.now() - videoStart, text });
}
```

Around 20 px at 1280 wide is readable without covering the interface. Keep each
caption to one line of plain speech.

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
target is resolved from live geometry.

## Convert and trim

```bash
ffmpeg -y -ss 0.5 -i out/raw/page.webm \
  -vf "fps=30,scale=1280:800:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 22 -movflags +faststart out/demo.mp4
```

Subtract the trim from the recorded cue timings so the sidecar stays aligned.
