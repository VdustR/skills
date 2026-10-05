# Still Capture

Produce one image file of a running interface. The job ends at a file path, which
is where vp-github's attachment path begins.

| Subject | Producer |
|---|---|
| Already authorized session with supported original export | Lossless original file export, then the artifact validation gate |
| A web app, any platform, export unavailable | Playwright `page.screenshot({ path })` |
| A web app behind a login, export unavailable | The same, against an isolated persistent profile |
| A native window, macOS | `screencapture -x -o -l<id>`, or a desktop tool given a window id |

## Choose an authorized file producer

Prefer a supported original image export from the already authorized browser or
computer-use session when its documented capability writes or returns the
original bytes as a file. Request lossless PNG explicitly. Inspect the current
tool documentation and result; an inline preview alone does not establish that
original export exists or that the preview is lossless. Preserve any tool the
user explicitly requires.

| Session capability | Action |
|---|---|
| Supported original export, permitted by the host | Export in that session, then validate the saved artifact below. No additional login is needed. |
| Inline preview only, or no supported original export | Use the existing Playwright or window-id producer below, if authorized and compatible with the user's tool constraint. |
| Export denied by security policy or permission | Stop and report the blocked export. Do not switch tools to bypass the denial. |

Do not move a session token, cookie jar, or profile out of the authorized browser
into another producer. An unavailable export capability permits a safe fallback;
a security-blocked export does not. If a separately authorized capture can proceed
without bypassing that restriction, establish that scope first. Otherwise request
the missing permission or a user-provided file. For a fallback that needs login,
use the isolated-profile sequence below or the managed-profile handoff; never
extract credentials to avoid signing in.

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
  // Wait for the thing the screenshot is evidence for, not just for load.
  await page.getByRole("tab", { name: "Overview" }).waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode()));
  });
  // Also wait for app-specific data and material transitions to settle.
  await page.screenshot({ path: "out/before.png", type: "png", scale: "device" });
} finally {
  await browser.close();
}
```

Close the browser in a `finally`. A navigation or screenshot that throws
otherwise leaves Chromium running and the script alive with it.

Set `deviceScaleFactor: 2` and request PNG with device-scale pixels. Measured:
a 900x300 viewport wrote 1800x600 at
`deviceScaleFactor: 2` and 900x300 at the default `1`. A 1x image of a real
interface is too small for a reviewer to read the text that proves the claim.

## Wait for the state you are claiming, not for load

`waitUntil: "load"` reports that the document loaded. It says nothing about
whether the interface rendered, so an app that paints after load gets
photographed mid-load. Measured on a page that fills its container 700 ms after
the load event:

| Sequence | What the image contained |
|---|---|
| `goto({waitUntil:"load"})`, then screenshot | `Loading…` |
| `goto`, then `locator.waitFor({state:"visible"})`, then screenshot | The interface |

The first row is a screenshot of a spinner presented as evidence of a feature.

It also breaks the pairing below. In the same measurement, the text read after
the unwaited screenshot returned `[]`, because `allInnerTexts()` on a list
locator resolves immediately rather than waiting for matches. A single-element
locator auto-waits; a list does not. So the caption and the image can disagree,
or the caption can come back empty, and neither failure announces itself.

Wait on the specific element that carries the claim, loaded fonts and relevant
images, and any material animation or transition. Use an application readiness
signal or a settled-state assertion rather than a fixed delay. Image decoding
errors must be resolved or explicitly excluded from the claim before capture.
Then screenshot and read the assertion from that same settled state; if the state
changes between those operations, repeat the pair.

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
   user must answer. This is the only step that needs the user, and it is not the
   only step that needs the display: the context stays visible until step 4, so
   the display has to remain available through the capture. Releasing it after
   the sign-in fails the run.
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

This sequence is for a login that begins and ends inside one capture. Route to
vp-agent-browser-session instead when the profile has to survive the task, or when
the login needs complete Chrome state such as IndexedDB, service workers, or SSO.
That skill owns managed profile identity, permissions, and deletion; do not
reimplement its lifecycle here.

### A later capture can go headless, conditionally

Closing the context and relaunching the same profile with `headless: true` gets a
headless capture of the signed-in view, but only when the site's login left a
cookie with an expiry. Measured across a close and relaunch of one profile:

| Login cookie | Same profile relaunched headless |
|---|---|
| Carries an `expires` | Still signed in |
| No `expires`, a session cookie | Signed out |

A session cookie is discarded when the browser closes, so the relaunch lands on
the login page and the screenshot captures that instead.

Order this so a signed-out relaunch costs nothing. Take every image the task
needs in the headed context first, while the session is certainly there. Only
then close and relaunch headless, and treat that as an addition for further
captures rather than as the way to get the ones already taken.

Closing first and planning to fall back does not work. The fallback would be the
headed context, and closing it is what destroyed the session; relaunching headed
lands on the login page too, so the only route back is asking the user to sign in
again. Check the signed-in state after relaunching rather than assuming it carried
over, and when it did not, either accept the images already captured or ask for
another sign-in. Do not delete the profile between the two launches.

## Pair the image with a text assertion

Read the same claim out of the same page state, in the same run, and put the text
next to the image. A reviewer can then check the claim without reading pixels, and
a wrong or stale image stops matching its own caption.

In a browser, read it from the page:

```js
await page.getByRole("tab", { name: "Overview" }).waitFor({ state: "visible" });
const tabs = await page.getByRole("tab").allInnerTexts();
// ["Overview", "Activity", "Settings"]
```

Verified in the same run as the screenshot above: the returned strings matched the
labels visible in the image. Wait first, for the reason in the section above.

For a native window there is no page, so read the window's accessibility tree
instead. It is scoped by the same window id as the capture, and it produces text
without producing a second image:

```bash
peekaboo see --window-id 592 --tree --no-screenshot
#   elem_9  [button] Percent
#   elem_11 [button] 7
```

Measured: 41 elements with roles and labels for one id-scoped window, no image
written. Flags change, so read the tool's own `--help`; what stays is that the
accessibility tree is the native equivalent of reading the page.

This needs an accessibility-capable automation tool, which `screencapture` and
the bundled Swift script do not require. On a machine without one, write the claim
out by hand from what the image shows. That is weaker evidence than a read value,
and it is still better than an image with no stated claim beside it.

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

screencapture -x -o -t png -l37528 out/before.png
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

## Validate the saved artifact

Apply this gate to every producer, including original exports and crops. Keep
machine-checkable properties separate from visual readability.

1. Verify the actual file signature/type with `file --mime-type` or an available
   image decoder, and successfully decode the image with an image tool. PNG starts
   with the bytes `89 50 4e 47 0d 0a 1a 0a`; a `.png` extension is insufficient.
   Reject a JPEG named `.png` and recapture as lossless PNG. Renaming or converting
   that JPEG to PNG cannot restore detail lost to compression.
2. Read decoded pixel width and height. Record the capture scale, captured region
   in CSS pixels or window points, and intended rendered width and height in CSS
   pixels or points. At the baseline 2x scale, require source width and height to
   be at least twice the intended display width and height. Verify both axes after
   cropping. For an export with unknown scale, record it as unknown and establish
   a fresh 2x capture if its source scale cannot be verified; dimensions alone do
   not establish capture scale.
3. If source pixels are inadequate, capture again at sufficient native/device
   resolution, or reduce the intended display size only if that still communicates
   the claim. Do not upscale an existing low-resolution preview to pass the gate.
4. Inspect the original file at native resolution and inspect it rendered at the
   intended display size. Verify small text, controls, and the claimed state are
   readable. Passing type and dimension checks does not establish readability.
   Crop to the relevant region while preserving labels and context needed to
   understand the claim. Repeat the checks on the final crop.
5. Confirm the target, claimed state, paired text assertion, and absence of
   unrelated or sensitive content before delivery. Record the validated type,
   decoded dimensions, scale, intended display size, and visual inspection result.
   Keep this evidence generalized when publication requires de-identification.

For example, a synthetic region intended to render at 480 by 240 CSS pixels needs
at least 960 by 480 source pixels at 2x. A genuine 480 by 240 PNG fails that size
check even though its format is correct. A larger upscaled copy still fails the
capture-provenance requirement.

This gate is mandatory before a GitHub attachment. An upload has
no documented deletion path; access depends on repository visibility and whether posted content
references the asset, and later changes can expand access. Discarding a draft
does not reliably recall an image. See vp-github for filename rules and size
ceilings. Successful Markdown rendering does not establish image clarity.

## Synthetic regression exercise

With this skill's existing Node and Playwright dependencies, run
`scripts/still-capture-poc.cjs <output-directory>`. It uses a synthetic local page,
small text, controls, and generated illustrations only. It writes a 1x JPEG named
`.png`, a genuine insufficient 1x PNG, a 2x PNG, and a local intended-size preview.
It checks signatures and decoded dimensions, rejects the first two artifacts,
and accepts the 2x artifact's machine-checkable properties. It waits for the
claimed interface state, fonts, and images before capture and pairs a text
assertion with that state.

Inspect the original 2x PNG and the intended-size preview separately. The
executable test cannot establish visual readability or agent routing. Exercise
the original-export, unavailable-export fallback, and security-blocked stop
scenarios in `fixtures/smoke/vp-recording.md` at the repository root as manual
walkthroughs or independent trials, and label the evidence type accurately.
