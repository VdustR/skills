# CSS state and defensive-layout decisions

## Prompt

Use `$vp-css-best-practices` to review the scenarios below.
Keep each review scoped to the supplied behavior. Do not install dependencies,
change a styling framework, or claim browser execution without running it.

## Scenario 1: Discoverable unavailable link

An account action must remain keyboard-discoverable while unavailable:

```html
<a class="action selected" href="/delete-account" aria-disabled="true">Delete account</a>
```

```css
.action {
  --accent: 20px;
  color: #777;
  background: white;
  color: var(--accent, #111);
  .selected { border: 2px solid; }
  &:hover { background: #ccc; }
  &:active { transform: scale(.9); }
  &:focus { outline: none; box-shadow: 0 0 0 2px blue; }
  &[disabled] { opacity: .3; pointer-events: none; }
}
.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  overflow: hidden;
}
```

The container can be 240 CSS px wide. Give the smallest supported corrections
and identify the checks that cannot be completed from this code.

Expected decisions: distinguish the same-element selector from its descendant;
do not mistake a present invalid color token for a missing variable; preserve
focus on the ARIA-disabled link; require behavior-layer activation suppression;
guard its enabled decorations with its actual semantic state; correct the track
minimum without clipping away the evidence. Do not apply native-button disabled
selectors to this link and call it fixed. Do not declare conformance from the
blue shadow or the color literals.

## Scenario 2: Native disabled state

A native button is hovered while its containing fieldset becomes disabled.
The library's default focus styles are already complete. Determine what to
inspect and test before adding duplicate declarations.

Expected decisions: verify native `:disabled`, actual activation suppression,
keyboard traversal, and overlapping states. Cover the four required native
state selectors through authored or verified inherited behavior. Preserve
existing focus; do not add empty rules to satisfy a text shape.

## Scenario 3: Styling migration

A Sass rule `.card, #special { &__label { color: blue; } }` is moved into native
CSS. Someone claims that explicit ampersands make the migration portable.

Expected decisions: reject native suffix concatenation; inspect the intended
targets, selector-list specificity, output order, and actual engine behavior.
Do not silently rewrite it into a descendant with a different contract.

## Scenario 4: Accessible palette claim

A palette uses OKLCH tokens with equal lightness. A screenshot looks readable;
an opaque text/background sample computes to 4.499:1. The team uses 44px targets.

Expected decisions: do not round the sample up or infer accessible pairs from
OKLCH. Identify the actual text-size threshold and applicable exceptions;
measure composited backgrounds/states. Distinguish the stronger 44px team target
from WCAG 2.2 AA's target-size criterion and its exceptions. Require visual and
interaction evidence beyond screenshots and audit scores.

## Scenario 5: Size, line boxes, and scroll ownership

A picker has 240px available inline space. Its rows use fixed 24px heights,
24px text with 1.5 line-height, and overflow hidden. File names may be unbroken
200-character values differing only in their suffix. Both rows and their list
have overflow auto, and a prose preview uses three-line clamping plus a title
attribute. Confirm/cancel must remain reachable with 2 or 200 results.

Expected decisions: define information and full-content access before selecting
CSS. Review meaningful size bounds without requiring min/max on every element;
retain intrinsic text growth, identify clipping risk, choose deliberate wrap/
ellipsis/clamp policies, and provide a real full-value route across input methods.
Name intended scroll owners/axes and test short/long cases plus final actions.
Do not count a title attribute, full accessible name, scroll geometry, or a
clean clipped screenshot as sufficient evidence of readable full content.

## Expected Behavior

Preserve the scoped product intent. Distinguish standards, team conventions,
and conditional remedies. Use actual engine/behavior evidence when available;
mark proposals, code reasoning, manual walkthroughs, and executed tests separately.

## Regression Coverage

- Native versus ARIA-disabled controls and discoverable focus.
- Explicit nesting targets and Sass/native migration boundaries.
- Invalid computed-value tokens and unrounded contrast thresholds.
- Meaningful size bounds, line boxes, long-text policies, full-content access,
  deliberate scroll ownership, and final-action reachability.

## Verification boundary

Record which scenarios were exercised, the resulting decisions, and whether
verification was a manual walkthrough, an independent agent trial, or executable
testing. Keep session-specific output in the delivery evidence rather than
assuming fixture presence proves behavior.

The executable lab separately exercises native mechanisms with positive and
negative controls. It does not execute these whole scenarios or validate a
specific framework, product, physical device, or screen reader.
