# Subtitles

Use subtitles when the viewer needs an explanation of intent, a step boundary,
or an accessible text track. A keycast says what input occurred; a subtitle says
why the step matters or what changed.

## Produce two outputs from one cue list

Keep one cue list as the source of truth. Render it into the captured frame for a
self-contained demo and write a WebVTT sidecar for accessibility, editing, and
later restyling. Subtract any trimmed lead-in from both outputs.

For a browser walkthrough, render the visible subtitle in an injected DOM layer.
This works even when ffmpeg lacks `drawtext`, `subtitles`, and `ass`. With a
capable ffmpeg build, the WebVTT sidecar can instead be burned in after recording;
see `encoding.md`.

```js
async function say(text, holdMs = 2400) {
  const start = Date.now() - videoStart;
  await page.evaluate((value) => window.__demo.caption(value), text);
  await sleep(holdMs);
  cues.push({ start, end: Date.now() - videoStart, text });
}
```

At 1280 pixels wide, start around 20-24 px with a high-contrast backing plate.
Keep a cue to one short line when possible, place it consistently near the lower
edge, and keep it clear of the focused control, pointer target, and keycast.
Reserve the lower center for subtitles and a lower corner for keycast.

Escape WebVTT text independently from DOM text. Verify the first cue, the final
cue, a cue adjacent to a cut, and a frame where subtitles and keycast overlap.
