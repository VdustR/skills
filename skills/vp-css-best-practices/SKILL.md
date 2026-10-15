---
name: vp-css-best-practices
description: >-
  Write, review, debug, or migrate CSS with explicit nesting selectors,
  correct interactive states, accessible presentation, and defensive layout.
  Use for stylesheets and CSS authored through Sass, CSS Modules, CSS-in-JS,
  or utility systems. Boundary: owns CSS behavior and its verification; use
  interaction and visual-design workflows for product behavior and visual direction.
---

# CSS Best Practices

Make selector intent explicit, keep controls truthful across states, and verify
the rendered result. Apply the relevant checks to the changed behavior; do not
turn a local fix into a reset, framework migration, or whole-product audit.

## Establish the contract

Inspect the actual styling engine and version, compiler/plugins, browser support
targets, design tokens, component markup, and repository validation workflow.
Identify which element owns each state and whether the control is native,
ARIA-disabled, or driven by a library data attribute. Preserve existing product
contracts and visual direction unless the task changes them.

Separate three kinds of rule:

- Standards: cite the applicable specification, criterion, level, and exceptions.
- Team conventions: explicit `&` and guarded native-button states below.
- Conditional remedies: adopt only after reproducing the relevant failure.

Use [references/sources.md](references/sources.md) when tracing a recommendation
or extending the skill. Author posts provide techniques; primary specifications
and actual target-engine behavior establish their limits. A shared link or
popular snippet is not an endorsement, compatibility proof, or accessibility test.

## Make nested selectors unambiguous

Whenever a selector refers to its containing rule, write the `&` explicitly,
including where the engine allows omission. Preserve whitespace deliberately:

```css
.control {
  &.selected { /* This same element also has the selected class. */ }
  & .label { /* A descendant has the label class. */ }
  & > .icon { /* A direct child has the icon class. */ }
  & + .hint { /* The following sibling has the hint class. */ }
  &[aria-expanded="true"] { /* This same element has the attribute. */ }
}
```

This is a team readability and migration convention, not a claim that native
CSS requires `&` for every descendant. Do not change a descendant into a compound
selector to satisfy it. Do not add `&` to keyframe steps or unrelated top-level
rules. If an API does not accept nesting, use its supported explicit selector
mechanism; do not insert invalid syntax or switch libraries.

Before migration, inspect emitted CSS and test matched and unmatched elements
in both engines. Explicit `&` reduces ambiguity; it does not erase differences
in specificity, ordering, interpolation, or unsupported selector forms. Read
[references/selectors-and-states.md](references/selectors-and-states.md) for these
cases and the disabled-control distinctions.

## Cover native button states

For an authored native disable-capable action, cover these selectors with
meaningful existing tokens or documented inherited behavior:

```css
.action {
  &:disabled { cursor: not-allowed; }

  @media (hover: hover) {
    &:not(:disabled):hover { background: var(--action-hover); }
  }

  &:not(:disabled):active { background: var(--action-active); }

  &:not(:disabled):focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 3px;
  }
}
```

Define and verify the referenced tokens; the example is a selector contract,
not a complete theme. Keep active styling effective while hover also matches,
and keep the focus indicator visible during both states. Avoid empty rules or
duplicating a component library's complete state styles solely for this shape.
Verify inherited disabled states, such as a disabled fieldset, using `:disabled`.

Do not apply this contract blindly to links: `:not(:disabled)` also matches
elements that cannot be disabled. `aria-disabled="true"` does not set native
disabled behavior. Keep an intended focusable unavailable action visibly
focused, suppress its activation in the behavior layer, and guard its visual
states using its real disabled contract. CSS cannot prevent keyboard or
programmatic activation on its own.

## Verify accessibility and resilience

Before sizing or clipping variable content, read
[references/content-and-overflow.md](references/content-and-overflow.md). Define
preferred/minimum/maximum sizing, wrapping or truncation, the full-content route,
and intentional scroll owners/axes. Natural growth is a valid size decision;
do not impose fixed bounds on every element. Verify that visible text survives
line-height, font fallback, zoom, and user spacing without vertical clipping.

Read [references/accessibility.md](references/accessibility.md) for color,
focus, text, motion, and evidence requirements. Use a specified conformance
target; otherwise use WCAG 2.2 A/AA as the working baseline and label higher
team targets separately. Never label a whole page conformant from CSS checks.

For layout, tokens, content variability, clipping, and feature fallback, read
[references/defensive-css.md](references/defensive-css.md). Select a scoped fix
with a failure case and tradeoff; avoid blanket `overflow: hidden`, zero minimum
sizes, `!important`, reset styles, or performance hints across every element.

Validate changed behavior in the actual product:

1. Exercise default, hover, pressed, keyboard focus, disabled, and relevant
   combinations. Check activation and focus order, not just computed styles.
2. Measure rendered color pairs and control geometry; record raw values,
   criterion, threshold, and result. Inspect actual screenshots at desktop and
   narrow widths, including a focused control near clipping/sticky boundaries.
3. Test relevant content extremes, text resizing/reflow, user text-spacing,
   themes, reduced motion, and forced colors. Use a screen reader when semantics
   or hidden content changes. Emulation does not establish physical-device behavior.
   Exercise the full-content route for each ellipsis/clamp, and verify that only
   intentional regions scroll on the intended axes with short and long content.
4. Run the project's applicable lint, build, interaction, and visual checks.
   For a migration, verify the real compiled stylesheet in supported browsers.

For isolated demonstrations, open [assets/behavior-lab.html](assets/behavior-lab.html)
for selectors/states or [assets/content-lab.html](assets/content-lab.html) for
sizing, clipping, full-content disclosure, and scroll ownership. Run
[scripts/probe-css.cjs](scripts/probe-css.cjs) with an existing Playwright package
and installed browsers:

```sh
node scripts/probe-css.cjs <playwright-package-directory> <output-directory> chromium,firefox,webkit
```

Run that command from this skill's directory. It creates a JSON report and
screenshots, records source hashes and run status, and closes its browsers.
Use only screenshots listed in the current report; old files may remain in a reused
output directory. It does not install dependencies, exercise
another styling library, or prove an unrelated application accessible. Read the
screenshots; their existence is not visual review. A missing engine is an explicit
verification gap, not a reason to install software without applicable authorization.

Report changed behavior, checks actually performed, measured failures, manual
visual observations, and unverified browsers/devices/assistive technology.
Distinguish a manual decision walkthrough from executable browser tests and an
independent agent trial.

## Related skills

- [`vp-interaction-design`](https://github.com/VdustR/skills/tree/main/skills/vp-interaction-design)
  when the control's states, semantics, or recovery behavior need design work.
- [`impeccable`](https://github.com/pbakaus/impeccable)
  when visual direction or interface craft is part of the task.
- [`vp-deps-migrate`](https://github.com/VdustR/skills/tree/main/skills/vp-deps-migrate)
  when moving between styling libraries or API families.
