# Still Capture

Produce one image file of a running interface. The job ends at a file path, which
is where vp-github's attachment path begins.

| Subject | Producer |
|---|---|
| A web app, any platform | Playwright `page.screenshot({ path })` |
| A web app behind a login | The same, against an isolated persistent profile |
| A native window, macOS | `screencapture -x -o -l<id>`, or a desktop tool given a window id |

## An inline screenshot is not a file

An agent's own browser or computer-use tool usually returns pixels to the model
and writes nothing to disk. There is no path to upload and no second look at the
image later. When the destination is an attachment, run one of the producers
above instead of reusing what a viewing tool already showed you.

Do not solve this by moving a session token or cookie jar out of the viewing
browser into a scriptable one. A permission classifier that blocks the transfer
is correct: the credential leaves the process that was granted it. Log in once in
a throwaway profile instead, as below.

## Web app: Playwright writes the file

A page that needs no session needs no profile.

```js
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.screenshot({ path: "out/before.png" });
} finally {
  await browser.close();
}
```

Close the browser in a `finally`. A navigation or screenshot that throws
otherwise leaves Chromium running and the script alive with it.

Set `deviceScaleFactor: 2`. Measured: a 900x300 viewport wrote 1800x600 at
`deviceScaleFactor: 2` and 900x300 at the default `1`. A 1x image of a real
interface is too small for a reviewer to read the text that proves the claim.

## A UI behind a login

Here the profile is the point, so switch to `launchPersistentContext`, which is
the only mode that keeps a session across launches.

This context stays visible from launch until it is closed. Playwright cannot
switch a running context to headless, so the capture happens in the window the
user signed in through. Plan for a display for the whole sequence, not just the
sign-in.

```js
const context = await chromium.launchPersistentContext(profileDir, {
  headless: false, // the user has to see the login window
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
```

One interactive login into a profile the run owns:

1. Create an empty profile directory the run can delete.
2. Launch with `headless: false` and hand the window to the user to sign in. A
   visible window is required for a real credential entry and for challenges the
   user must answer. This is the one step that needs a display and takes focus.
3. Screenshot from the same context, now that the session lives in the profile.
4. Close the context, which closes Chromium.
5. Delete the profile directory, then confirm it is gone.

Step 4 is not optional. Chromium holds the profile open and keeps writing to it,
so a delete while it is running can fail on a platform that locks the files, or
succeed and then be undone when the browser flushes its state back. Either way the
throwaway profile and the session material inside it survive the run.

```js
try {
  try {
    // steps 2 and 3
  } finally {
    await context.close();
  }
} finally {
  rmSync(profileDir, { recursive: true, force: true });
  if (existsSync(profileDir)) throw new Error(`profile survived: ${profileDir}`);
}
```

Two nested `finally` blocks, not one. Removal has to sit outside the block that
closes the context, because `context.close()` can itself reject after Chromium
crashes or disconnects, and a single `finally` would let that rejection skip the
removal and leave the signed-in profile on disk. The inner block still runs the
close first, so the normal path closes before deleting.

Verified in this sequence: session state carried by the profile changed the
rendered page, the screenshot captured the signed-in view, and the profile
directory was created and confirmed removed in the same run.

### A later capture can go headless, conditionally

Closing the context and relaunching the same profile with `headless: true` gets a
headless capture of the signed-in view, but only when the site's login left a
cookie with an expiry. Measured across a close and relaunch of one profile:

| Login cookie | Same profile relaunched headless |
|---|---|
| Carries an `expires` | Still signed in |
| No `expires`, a session cookie | Signed out |

A session cookie is discarded when the browser closes, so the relaunch lands on
the login page and the screenshot captures that instead. Check the signed-in
state after relaunching rather than assuming it carried over, and fall back to
capturing in the headed context when it did not. This also means the profile
cannot be deleted between the two launches.

Route to vp-agent-browser-session when the profile has to survive the task rather
than be discarded, or when the login needs full Chrome state such as IndexedDB,
service workers, or SSO. That skill owns managed profile identity, permissions,
and deletion; do not reimplement its lifecycle here.

## Pair the image with a text assertion

Read the same claim out of the same page state, in the same run, and put the text
next to the image. A reviewer can then check the claim without reading pixels, and
a wrong or stale image stops matching its own caption.

```js
const tabs = await page.getByRole("tab").allInnerTexts();
// ["Overview", "Activity", "Settings"]
```

Verified in the same run as the screenshot above: the returned strings matched the
labels visible in the image.

## Native window: name the window

Paths below are relative to the skill directory.

`window-id.swift` filters on the owning application's name, not the window title.
Measured: passing a real window title exits with `no on-screen window found`,
while passing that window's owner name resolves it. A request that names a window
by title, which is the usual way a person describes one, therefore has to select
the title from the rows.

```bash
# The argument is the owner name. Column 3 is the title.
./scripts/window-id.swift "Inventory" \
  | awk -F'\t' '$3 == "Inventory Editor" { print $1 }'
# Owner unknown? List every on-screen window and match on the title.
./scripts/window-id.swift | awk -F'\t' '$3 == "Inventory Editor" { print $1, $2, $4 }'

screencapture -x -o -l37528 out/before.png
```

Print the owner and size alongside the id and check them before capturing. Two
windows of one application can carry the same title.

`macos-window-capture.md` has the id lookup, the `-o` rule, and the point-to-pixel
mapping. All three apply unchanged to a still.

A desktop automation tool works too, but check its scale. Measured on a 2x display
against a 954x492-point window:

| Command | Output | Ratio to points |
|---|---|---|
| `screencapture -x -o -l94` | 1908x984 | 2x |
| `peekaboo see --window-id 94 --retina` | 1908x984 | 2x |
| `peekaboo see --window-id 94` | 477x246 | 0.5x |

Peekaboo's default is half the window's point size, a quarter of the pixels
`screencapture` writes. Ask for native resolution explicitly. The flag name can
change; the measured default cannot, so read the tool's own `--help` and then
check the output dimensions against the window's point size.

## Which targeting modes let the capturer choose

Only a window id names one window. Every other mode leaves the selection to the
tool, and the tool's selection can differ from the window you meant.

| Targeting | Who picks the pixels |
|---|---|
| Window id | You |
| Screen rectangle | Whatever is composited on top of it |
| Display, or frontmost | The window stack |
| Application name, or process id | The tool, among that application's windows |

Measured: `peekaboo see --app Finder` with three on-screen Finder windows, ids 92,
93, and 94, captured id 94 at `window_index: 0`. Its `--window-title`,
`--window-index`, and `--window-id` selectors are all optional, so the bare
`--app` form is a silent choice rather than an error.

The choice is recoverable when the tool reports it. The same run printed
`"window_id": 94` under `--json`, while the plain output printed only a window
title. Ask for the machine-readable result and compare the reported id against the
id you intended.

## Confirm the file before it leaves the machine

Open the image and check three things: it is the window you meant, it shows the
state you are claiming, and nothing else is in the frame.

This is mandatory when the image is bound for a GitHub attachment, because the
upload publishes. vp-github records that an `/assets/` URL is downloadable without
authentication as soon as it is uploaded, before any comment is posted, so
discarding the draft does not recall the image. There is no step after this one at
which a wrong window can be caught.

PNG is the format to write. It is on the eight content types the media upload
endpoint accepts, and the endpoint also validates the filename extension against
the declared type. See vp-github for the whitelist and the size ceilings.
