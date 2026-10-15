# Accessible CSS verification

CSS is one part of accessibility. Preserve semantic HTML, accessible names,
relationships, keyboard behavior, and source order. Color simulations and visual
review help find problems but cannot establish usability for every disability.

## Quantitative baseline

Use the final [WCAG 2.2](https://www.w3.org/TR/WCAG22/), not criterion numbering
copied from an old draft. Understanding documents explain the criteria; the
Recommendation defines conformance.

| Concern | Baseline and limits | Verification |
| --- | --- | --- |
| [Text contrast, 1.4.3 AA](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | At least 4.5:1 for ordinary text; 3:1 for large text, at least 18pt regular or 14pt bold (24 or about 18.67 CSS px). Exceptions include incidental/inactive text and logotypes. | Measure actual foreground and background for default, hover, active, focus, selected, error, and applicable themes. Placeholder text is not automatically exempt. |
| [Non-text contrast, 1.4.11 AA](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | Required component/state cues and meaningful graphics need 3:1 against adjacent colors, with criterion exceptions. Not every decorative border or state-to-state color difference has this requirement. | Identify the cue that conveys the control/state; measure its adjacent colors. Include focus and selected indicators. |
| [Focus visible, 2.4.7 AA](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | Keyboard focus must be visible. | Tab/Shift+Tab through the real flow and inspect focus, including while hovered or pressed. Never remove an outline without a working replacement. |
| [Focus not obscured, 2.4.11 AA](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Author-created content must not entirely hide the focused component. | Inspect focused controls under sticky headers, overlays, and scroll containers. Full visibility is a stronger target. |
| [Focus appearance, 2.4.13 AAA](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) | With its exceptions, indicator area must meet a 2 CSS px perimeter equivalent and change contrast by 3:1 between the same pixels in focused/unfocused states. | A 2px declaration alone proves neither geometry nor contrast. A 3px outline is a useful team starting point, not certification. |
| [Target size, 2.5.8 AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | At least 24 by 24 CSS px or a documented criterion exception, including spacing or inline targets. | Measure actual hit areas and surrounding targets. 44 by 44 is a stronger touch-friendly team target; do not call 44 or 48 the AA minimum. |
| [Resize text, 1.4.4 AA](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) | Support 200% text resizing without loss, subject to criterion exceptions. | Check real browser zoom/text settings, clipped labels, and available actions. |
| [Reflow, 1.4.10 AA](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | For horizontal writing, support a 320 CSS px equivalent width without losing content/functions or requiring two-axis scrolling, except content that needs two dimensions. | Test browser zoom to an equivalent viewport as well as narrow layout. A resized screenshot alone is not a zoom test. |
| [Text spacing, 1.4.12 AA](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) | User overrides must not lose content/functions: line height 1.5, paragraph spacing 2em, letter spacing .12em, word spacing .16em, with script-specific applicability. | Apply overrides to representative content, including inputs, labels, and errors. These values are override tests, not required default typography. |

Disabled text contrast exceptions do not make illegible unavailable controls a
good design. Keep the action and reason understandable. Do not apply an inactive
exception to loading, read-only, or merely low-priority content automatically.

## Measure colors honestly

For opaque sRGB pairs, normalize channels to 0..1, then linearize each channel:

```text
linear(c) = c / 12.92                       if c <= 0.04045
            ((c + 0.055) / 1.055) ** 2.4    otherwise
L = .2126 * linear(R) + .7152 * linear(G) + .0722 * linear(B)
ratio = (max(L1, L2) + .05) / (min(L1, L2) + .05)
```

Use [WCAG relative luminance](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance)
and [contrast ratio](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio). Do not round
a failing raw ratio up to the threshold. Validate a calculator against black/white
(21:1) and identical colors (1:1).

Read computed styles but resolve transparent ancestor backgrounds, group opacity,
overlays, gradients, images, blending, and filters before selecting the pair.
For translucent simple layers, composite the actual paint layers first. A basic
RGB helper must reject unsupported color spaces instead of parsing OKLCH/P3 as RGB.
For wide-gamut/gamut-mapped or complex backgrounds, use a verified browser/tool
pipeline and record its method; unresolved cases remain unverified. Check the
worst relevant area and content variations; one sampled screenshot is insufficient.

OKLCH and relative colors help author palettes; equal lightness is not a WCAG
contrast guarantee. APCA can provide additional analysis, but do not substitute
it for the WCAG 2.2 calculation or invent a universal APCA passing threshold.
Contrast formulas are a testable baseline, not a complete model of human vision.

## Visual and interaction evidence

- Capture and inspect the actual element in context, at native screenshot scale.
  Check focus clipping, outlines against each adjacent surface, text on imagery,
  text rasterization, overlap, and whether states remain understandable without hue.
  [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
  requires information beyond color where color carries meaning.
- Test keyboard access and activation, not just `element.focus()`. Keep visual
  reading order aligned with meaningful DOM order. Tooltips shown on hover/focus
  need the applicable [1.4.13 behavior](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).
- Test forced colors: shadows and background images may disappear. Use real
  borders/outlines and system colors where needed; avoid global
  `forced-color-adjust: none`. Emulation is not actual Windows High Contrast Mode.
- Respect `prefers-reduced-motion`. Remove optional travel/scale/scroll animation
  while preserving state information. Scope changes so JS transition listeners
  and progress indicators still work. Check flash and automatically moving
  content against their applicable criteria; reduced motion is not a substitute.
- Use automated audits to find supported violations, then review manual checks.
  A score, zero reported violations, or a screenshot cannot establish conformance.
  Test with assistive technology when semantic or hidden-content changes matter;
  report unavailable screen-reader/device checks explicitly.

Record: component/state, browser and version, theme/preferences, relevant CSS
colors or geometry, criterion/level, threshold, raw measurement, outcome,
screenshot, manual observation, and remaining uncertainty.
