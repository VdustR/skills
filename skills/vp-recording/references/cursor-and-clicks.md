# Cursor And Click Emphasis

Use this layer when the viewer must see where the pointer moves or which control
receives a click. Omit it for keyboard-only flows and generated motion.

## Browser recording

Move the real Playwright mouse. Draw an injected SVG arrow that follows captured
`mousemove` events, and create the click ripple from the captured `mousedown`
event. This keeps hover state, click coordinates, pointer position, and the
visual highlight tied to the same event.

Inject the layer with `page.addInitScript` so it exists from the first paint.
Hide the page cursor, use a familiar arrow silhouette with a contrasting edge,
and set `pointer-events: none` on every overlay element. A decorative cursor with
its own animation timeline can visibly miss the control that receives the click.

An init script runs in every frame, iframes included, and before the document
has a root element. In headless Chromium 156 and Chrome 155,
`document.documentElement` was null at that point even in the top frame, so observing it with a
`MutationObserver` threw `parameter 1 is not of type 'Node'` once per frame. The
exception is uncaught, so the page's own error reporting receives it; in one
staging recording it blanked the app shell and flooded the site's error monitor.
Mount the overlay in the top frame only, once the document exists:

```js
await page.addInitScript(() => {
  if (window.top !== window) return;
  const mount = () => {
    // Create the cursor layer and observe document.documentElement here.
  };
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
});
```

For deliberate motion, resolve the target from its current `boundingBox()`, ease
the pointer toward its center, pause briefly, then split the click into
`mouse.down()`, a visible 70-100 ms pressed state, and `mouse.up()`.

Use a short expanding ring for the click. Keep it under about 450 ms; a persistent
circle covers labels and can be mistaken for a focus indicator. Verify one
full-resolution frame during the pressed state and another during the ripple.

## Native macOS recording

`screencapture -C -k` composites the system cursor and requests a click
highlight. The cursor has been visually confirmed in a window-scoped recording;
the click highlight has not. Verify both in the produced frames before claiming
they are present.

Background accessibility actions move no system pointer. When visible targeting
is required without disturbing the user's pointer, composite a cursor and click
marker in post from an event log. Keep the event timestamps and target positions
as the source of truth; do not animate a guessed path.
