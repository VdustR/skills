# Content, sizing, clipping, and scroll ownership

Decide how content remains usable before choosing overflow declarations. Each
important region needs a content policy, size constraints, and an owner for any
necessary scrolling. Apply this to the changed surface, not an unrelated audit.

## Establish the content contract

| Decision | Questions that change the implementation |
| --- | --- |
| Information | What must remain visible to identify the object or make the decision? What may be summarized? |
| Inline size | Which container constrains it? May it shrink below min-content? Is a readable measure or viewport-relative ceiling needed? |
| Block size | Should content grow naturally? Is there a target-size minimum or a necessary viewport-bound maximum? |
| Overflow | Choose wrapping, one-line ellipsis, multi-line clamping, or justified scrolling. Do not leave long strings to accidental clipping. |
| Full content | If text is shortened, how can pointer, keyboard, and touch users read the same full value? |
| Scroll ownership | Which region scrolls, on which axis, and how does the user reach it and leave it? |

Preserve established product behavior. Resolve new or ambiguous disclosure and
scroll behavior with the interaction design workflow. Do not invent a details
page or recovery capability that does not exist.

## Size constraints without creating clipping

Review preferred, minimum, and maximum sizes explicitly. An intentional
intrinsic/unbounded dimension is valid: not every element needs all six
width/height/min/max declarations. Prefer logical properties when appropriate.

- Text blocks normally grow in the block direction. Use a minimum for target
  size rather than a fixed height that assumes one font or one line.
- Set `min-inline-size: 0` on a shrinking flex/grid item when needed, not every
  element. Preserve essential icon/control space and define the adjacent text policy.
- Bound panels against the actual container/available viewport. A maximum
  block size needs an intentional scroll owner or disclosure path; otherwise
  content simply escapes or gets clipped.
- Check contradictory bounds: a minimum can override a smaller maximum.
  `min-inline-size: 20rem` can break a narrow parent despite `max-inline-size: 100%`.
- For a fixed shell, model header/body/footer explicitly, for example using
  grid rows `auto minmax(0, 1fr) auto`. Let the bounded body shrink and scroll;
  keep actions reachable without scrolling every nested wrapper.

Illustrative panel bounds, not a universal recipe:

```css
.panel {
  /* The outer container reserves viewport padding and safe areas. */
  inline-size: min(36rem, 100%);
  min-inline-size: 0;
}
.panel__body {
  /* Only scroll inside a genuinely bounded layout. */
  min-block-size: 0;
  overflow: auto;
}
```

Test a narrow parent as well as a narrow viewport. Include browser text
resizing, font fallback/loading, text-spacing overrides, and mobile keyboard
and safe-area conditions when the panel depends on viewport height.

## Choose a long-text policy

| Policy | Use when | Required behavior |
| --- | --- | --- |
| Wrap and grow | Full prose, labels, errors, or identifiers matter in context | Allow available width and block growth; choose word breaking appropriate to the content/script. |
| One-line ellipsis | A compact list/table has a genuine one-line requirement | Constrain inline size, prevent wrapping, and provide a discoverable full-value route. Preserve identity-critical prefixes/suffixes. |
| Wrap then ellipsis | A preview intentionally has a line budget | Use a tested clamp and usable fallback, plus full reading through a real disclosure or destination. |
| Local scrolling | Code, data tables, editors, or another region genuinely need it | Keep scroll in the intended owner/axis with keyboard reachability and visible focus/scroll cues. |

Prefer wrapping for essential instructions, validation errors, destructive-action
targets, and otherwise indistinguishable item names. Compact appearance alone
does not justify hiding information needed for the task.

```css
.full-text {
  min-inline-size: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
.one-line-preview {
  min-inline-size: 0;
  max-inline-size: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.multi-line-preview {
  min-inline-size: 0;
  overflow-wrap: anywhere;
  /* Full wrapping is the fallback when the tested clamp is unsupported. */
  @supports (-webkit-line-clamp: 3) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
}
```

These examples need a constrained containing block. `text-overflow: ellipsis`
alone neither creates overflow nor handles multi-line block-end truncation.
Unprefixed `line-clamp` is not interchangeable with the legacy combination;
verify target browsers. Clamp a text wrapper, not interactive descendants.
Padding can expose extra lines; keep decorative padding outside the clamp
wrapper and inspect actual paint.

### Complete the full-content route

Name the actual action/destination: an inline “Show full name” button, native
details disclosure, or verified details page. A `title` attribute, hover-only
tooltip, accessible name, or copy button alone is not a reliable visual reading
route across input methods. Screen readers reading full DOM text does not solve
access for sighted touch/keyboard users.

The preview and full presentation must refer to the same current value. The
revealed value must also wrap/scroll appropriately. A custom disclosure needs
a real button, accurate expanded state, and a programmatic content relationship;
native `details`/`summary` supplies its own semantics. Keep focus predictable on
open/close; do not hide the focused element without a recovery destination.
Do not show fake ellipses or imply hidden content when a short value fits.

## Avoid line-height and glyph clipping

Use unitless line height appropriate to actual fonts/scripts. Do not center
text by equating line-height to a fixed component height; use layout alignment
and padding. A readable line-height token cannot compensate for a smaller
fixed/max height plus `overflow: hidden`.

Check diacritics, ascenders/descenders, CJK, emoji/fallback fonts, bold text, and
font loading. Glyph ink can exceed a line box: matching height to font-size or
line-height does not prove every glyph fits. Avoid clipping/negative margins
to trim text without testing supported scripts and zoom. One-line truncation
must not shave off the top or bottom of the remaining visible line.

Use `scrollHeight > clientHeight` and text/element rectangles to find likely
clipping, then inspect screenshots at normal scale. Geometry alone cannot
certify glyph-ink visibility, ellipsis paint, or readability. Test WCAG spacing
values as user overrides, not mandatory default typography. Do not shrink the
font to make content fit a fixed box.

## Assign scroll ownership

Reading pages usually let the page own vertical scroll; independent panels
can legitimately have separate owners. Identify intended regions and axes;
reject accidental nested scroll and page-level sideways movement. Do not
enforce “exactly one scrollbar” across all interfaces.

- Prefer `overflow: auto` where scroll is needed only on overflow. Without a
  real block constraint, a region may grow rather than scroll; inspect its tracks/ancestors.
- Check both computed overflow axes; setting one can change the other. Local
  horizontal table/code scroll must not make the page scroll sideways or clip vertical content.
- Compare scroll/client geometry against intentional regions, then inspect
  actual scrollbars/clipping. OS overlay scrollbars may hide until interaction;
  geometry does not establish a visible affordance.
- Test short content (no unnecessary scroll), long content (intended owner
  scrolls), wheel/touch, keyboard traversal/scrolling, and the final content/action.
  Give an independently keyboard-scrollable region a suitable focus target and
  accessible name when needed; do not add every wrapper to the tab order.
- Keep focus and sticky actions visible. Do not hide scrollbars to disguise
  overflow. Scope overscroll containment to deliberate scroll-chaining behavior;
  it can also affect navigation gestures.

## Representative acceptance cases

Exercise empty/short content, long prose, one unbroken token, names differing
only at the hidden end, supported CJK/RTL and emoji, fallback fonts, narrow
parents, and enlarged/user-spaced text. Test each full-content route with
keyboard and pointer, adding actual touch/device and assistive-technology
coverage as needed. Record measurements separately from visual inspection.
A clean screenshot of clipped-away information is a failure, not a layout pass.
