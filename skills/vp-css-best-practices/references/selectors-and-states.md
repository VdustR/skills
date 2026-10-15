# Selectors, states, and migration

## Explicit parent references

| Intent inside `.item` | Write | Do not confuse with |
| --- | --- | --- |
| Same element, extra class | `&.selected` | `& .selected`, a descendant |
| Descendant | `& .label` | `&.label`, same element |
| Direct child | `& > .icon` | Any-depth descendant |
| Next sibling | `& + .hint` | Child inside the item |
| Pseudo-class / attribute | `&:focus-visible`, `&[data-open]` | Descendant state |
| Ancestor context | `[data-theme="dark"] &` | An attribute on the item itself |
| Pseudo-element | `&::before` | Essential text supplied only through generated content |

Native CSS allows some implicit parent references; our convention spells them
out. Native `&` is a selector reference, not textual Sass interpolation. Sass
suffix forms such as `&__label` do not become portable native nesting by adding
an ampersand. Use an explicit class rule or a supported engine mechanism.

Native nesting takes the highest specificity in the containing selector list,
similar to `:is()`. A mixed `.item, #special` parent can raise specificity for
every nested branch. Do not assume expansion into independent flat rules.
Use `:where()` deliberately where zero specificity is intended; it is not a
mechanical replacement for `:is()`.

For CSS Modules, account for local/global escaping. For CSS-in-JS or atomic
systems, read the exact version's selector restrictions and emitted CSS.
Some support only selectors that target the current generated class. If an API
cannot express a descendant, change the supported composition or keep the
existing contract; do not invent nesting support.

Migration checks: same target elements, non-target exclusion, selector-list
specificity, media placement, source order, cascade layers, SSR/injection order,
and actual browser matched styles. Class-string order alone does not determine
stylesheet precedence. Normal unlayered declarations outrank normal layered
declarations; important layer precedence reverses. Do not wrap existing CSS in
layers as a harmless formatting change.

## Native and semantic disabled states

`:disabled` follows native HTML disabled semantics, including applicable inherited
fieldset state. `[disabled]` only matches the attribute on that element. A link
with a `disabled` attribute is not thereby a native disabled control.

Use these four authored native-button selectors or verify that the existing
component contract already supplies them:

```css
&:disabled
&:not(:disabled):active
&:not(:disabled):focus-visible
&:not(:disabled):hover
```

Place hover decoration under `@media (hover: hover)` when it avoids sticky touch
hover. Do not put essential controls, labels, or keyboard focus styles inside
that query. It describes the primary input's hover capability; hybrid devices
need testing rather than an assumption that the query detects all pointers.
Adding `pointer: fine` can exclude devices that still benefit from hover; do so
only for a demonstrated requirement.

Test overlapping states: focus+hover, focus+active, hover+active, and disabled
while hovered/pressed. Declare active after competing hover styles or otherwise
verify precedence. Use independent outline properties so background state changes
cannot erase focus. Do not require a visible custom pressed effect when the
component's established contract intentionally provides equivalent feedback.

For `aria-disabled="true"` or library `[data-disabled]`:

```css
.action {
  &[aria-disabled="true"] { cursor: not-allowed; }
  &:not(:disabled):not([aria-disabled="true"]):active { /* Enabled press. */ }
  &:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 3px; }
}
```

This is a separate contract: if the unavailable action remains in the tab order
for discoverability, it still needs visible focus. Apply the same semantic guard
to hover decoration. The behavior layer must suppress pointer, Enter/Space where
applicable, and other activation paths. `pointer-events: none` is insufficient
and can remove helpful pointer discovery without disabling keyboard access.

Loading, read-only, selected, expanded, checked, and invalid are distinct states.
Use their actual semantics; do not infer disabled from appearance. Prefer
`:user-invalid` for post-interaction decoration when supported and appropriate,
but provide real error text and programmatic relationships. A CSS selector does
not announce validation or implement focus management.
