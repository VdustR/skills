# Defensive CSS by demonstrated failure

Prefer a remedy with a reproduced failure and an explicit tradeoff. Keep controls
and information available when content, preferences, or layout constraints change.

For size bounds, line-height/glyph clipping, text-policy selection, full-content
access, and scroll ownership, use `content-and-overflow.md` before this remedy table.

| Failure / trigger | Scoped remedy | Tradeoff and meaningful verification |
| --- | --- | --- |
| Long flex child refuses to shrink | Set `min-inline-size: 0` on the shrinking item; for a column scroll region inspect `min-block-size: 0`. Pair with an appropriate wrapping/overflow policy. | Zero minimum sizes permit shrinking; they do not wrap text. Check long IDs, URLs, translated labels, and nested flex children. |
| `1fr` grid track expands to min-content width | Use `minmax(0, 1fr)` where the track must shrink, and handle item content. | Do not erase useful intrinsic minimums everywhere. Verify both track geometry and visible content. |
| Card minimum is wider than its container | Consider `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`. | Choose auto-fit to expand occupied tracks, auto-fill to reserve empty tracks. Test empty, one, many, and a container narrower than the nominal minimum. |
| Unbroken tokens overflow | Consider `overflow-wrap: anywhere` for prose/IDs; preserve appropriate code/table scrolling and copyability. | `break-word` differs in min-content sizing; `word-break: break-all` can harm reading. Test actual scripts, emoji, and direction. |
| Fixed height clips enlarged/localized text | Use intrinsic size and `min-block-size` when possible; allow wrapping. | Match intended density. Test 200% text resizing, user spacing overrides, and real content. |
| Unavailable/full content is only visually hidden | Use semantic disclosure behavior and appropriate `hidden`, `inert`, or DOM removal for the intended state. | `opacity: 0`, zero-height grids, and offscreen positioning do not automatically remove focus or semantics. `display: none` also removes content from the accessibility tree; visually hidden text has a different purpose. |
| Overflow fix clips focus or changes sticky positioning | Find the overflowing child. Distinguish `overflow: hidden` (scroll container, including programmatic scroll) from `clip` (no scrolling). | Cross-axis values can compute differently. `clip` does not establish a formatting context by itself; use `flow-root` only when needed. Test focus, sticky descendants, anchor navigation, and both axes. |
| Scrollbars cause layout movement | Consider `scrollbar-gutter: stable` on the actual scroller. | Overlay scrollbars reserve no gutter. Modal/body scroll-lock behavior and OS settings differ; measure actual layout shift before declaring a fix. |
| Missing custom property breaks a declaration | Use a meaningful `var(--token, fallback)` or define the required token contract. | A present value invalid for the consuming property does not select the fallback. Earlier declarations may not rescue invalid-at-computed-value-time values. Test missing and malformed tokens separately; typed `@property` is an optional contract with its own inheritance/support implications. |
| Image distorts or dominates a narrow layout | Preserve ratio with scoped max inline size and automatic block size; choose `object-fit: contain` to preserve the whole image or `cover` only when cropping is intended. Reserve intrinsic dimensions/aspect ratio where known. | Check meaningful crop boundaries, missing images, and flex shrink behavior. Do not stretch logos or hide informative image content. |
| Border introduced on interaction moves layout | Reserve border width in default state or use an appropriate outline. | Shadows can disappear in forced colors. Check real outlines, contrast, clipping, and hit geometry. |
| Optional animation conflicts with preferences | Scope transitions to intended properties and supply a reduced-motion path. | Avoid `transition: all`; do not globally reduce duration to a magic value when events/behavior depend on animation. Verify final state and recovery without motion. |
| New feature absent or partially implemented | Provide a usable default; enhance with `@supports` and the actual browser target matrix. | Parse support does not prove bug-free behavior. Native CSS-only carousels, scroll animations, anchor positioning, and intrinsic-size transitions still require interaction and assistive-technology checks. |
| Global reset removes useful defaults | Inspect the existing reset and add only needed rules; preserve focus, form, list, and hidden semantics. | `all: unset`, blanket `appearance: none`, and global list removal can remove affordances or semantics. Browser/AT behavior needs verification. |
| RTL or alternate writing mode breaks placement | Prefer logical dimensions, spacing, inset, and borders when the intent follows text direction. | Some artwork/physical placement is intentionally fixed. Test actual RTL and writing mode; do not mirror everything mechanically. |
| `100vh` content hides behind mobile browser UI | Choose `svh`, `dvh`, or content sizing according to stability and available-space needs, with the supported fallback. | Dynamic units can cause resizing during scroll. Real mobile keyboard/safe-area behavior needs device evidence. |
| Truncation removes decision-critical information | Wrap or provide an accessible way to inspect full content. | A `title` tooltip alone is unreliable for touch/keyboard. Test actual user paths, not just whether an ellipsis appears. |
| Performance hint changes rendering/containment | Measure before and after; scope `content-visibility`, containment, or `will-change` to the demonstrated bottleneck. | They may affect layout, paint, stacking, resource use, find-in-page, or focus. A theoretical speedup is not observed performance. |

The behavior lab includes deliberate negative controls for intrinsic sizing,
variable fallback, and scroll containers. It is a small mechanism experiment,
not a replacement for the product's content, zoom, responsive, or device matrix.
