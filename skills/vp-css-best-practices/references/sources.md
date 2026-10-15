# Sources and adoption decisions

Reviewed October 15, 2026. Original summaries only; do not copy article bodies
into this skill. Browser support and draft syntax can change: recheck the actual
project's target versions before adopting a technique.

## Primary references

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) defines accessibility conformance.
  Use the directly linked Understanding pages in `accessibility.md` for each
  criterion's rationale and exceptions. Distinguish final criteria from drafts.
- [CSS Nesting Level 1](https://www.w3.org/TR/css-nesting-1/) and
  [MDN nesting guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using)
  establish parent references, compound versus descendant targeting, and specificity.
  Explicit `&` everywhere a nested selector references its parent is our convention.
- [CSS Variables Level 1](https://www.w3.org/TR/css-variables-1/)
  explains substitution and invalid computed values. A fallback is not type validation.
- [CSS Overflow Level 3](https://www.w3.org/TR/css-overflow-3/)
  distinguishes clipping, scroll containers, and cross-axis computation.
- [CSS Color Adjustment Level 1](https://www.w3.org/TR/css-color-adjust-1/)
  and [MDN forced colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors)
  explain why shadows alone cannot identify important controls or focus.
- [CSS Cascade Level 5](https://www.w3.org/TR/css-cascade-5/) and
  [Selectors Level 4](https://www.w3.org/TR/selectors-4/)
  establish layer precedence and specificity. Moving a rule into a layer changes behavior.
- [MDN aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled)
  explains why ARIA state alone does not block activation or remove focusability.
- [MDN overflow-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-wrap),
  [scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter), and
  [hover media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover)
  supply the operational contracts behind the scoped defensive remedies.

## Content resilience sources

For sizing and content overflow, also read during the October 15 follow-up:
[CSS Sizing Level 3](https://www.w3.org/TR/css-sizing-3/),
[MDN text-overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-overflow),
[line-clamp](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp),
[line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height),
[overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow), and
[overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior).
These establish mechanisms and limitations; the team's content-policy/full-access
requirement is a design convention, not a claim that WCAG mandates a particular
ellipsis implementation. The [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
and [GOV.UK details guidance](https://design-system.service.gov.uk/components/details/)
inform the reveal interaction and when essential information should stay visible.

## Author originals read

| Author and source | Adopted decision / boundary |
| --- | --- |
| [Ahmad Shadeed: Defensive CSS, flex minimums](https://defensivecss.dev/tip/flexbox-min-content-size/) | Reproduce intrinsic-size overflow before changing the shrinking child's minimum. |
| [Ahmad Shadeed: auto-fit versus auto-fill](https://defensivecss.dev/tip/auto-fit-fill/) | Pick distribution behavior from the intended layout; neither is universally better. |
| [Ahmad Shadeed: overflow clip](https://ishadeed.com/article/overflow-clip/) | Inspect the actual scroller and axis computation before replacing hidden. |
| [Ahmad Shadeed: relative colors](https://ishadeed.com/article/css-relative-colors/) | Derive theme values deliberately and remeasure resulting contrast. |
| [Ahmad Shadeed: container queries](https://ishadeed.com/article/css-container-query-guide/) | Make reusable layout respond to its available container when appropriate. |
| [Josh Comeau: Flexbox](https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/) | Understand the sizing algorithm before adding arbitrary widths/breakpoints. |
| [Josh Comeau: CSS reset](https://www.joshwcomeau.com/css/custom-css-reset/) | Evaluate defaults and explanations; do not paste a reset during an unrelated local fix. |
| [Andy Bell: a more modern reset](https://piccalil.li/blog/a-more-modern-css-reset/) | Preserve semantic and interaction affordances while selecting defaults. |
| [Heydon Pickering and Andy Bell: Every Layout axioms](https://every-layout.dev/rudiments/axioms/) | Prefer intrinsic composition over assumptions about one screen and content length. |
| [Sara Soueidan: focus indicators](https://www.sarasoueidan.com/blog/focus-indicators/) | Check indicator geometry, contrast, backgrounds, and interaction; final WCAG governs criterion levels. |
| [Stephanie Eckles: borders, outlines, and shadows](https://moderncss.dev/the-3-css-methods-for-adding-element-borders/) | Account for layout, clipping, and forced colors; historical rendering observations need current-engine checks. |
| [Lea Verou: contrast and readability](https://lea.verou.me/blog/2024/contrast-color/) | Keep measured WCAG conformance and perceived readability as distinct evidence. |
| [Andrey Sitnik and Travis Turner: OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) | Perceptual authoring helps palette work, but does not establish accessible color pairs. |
| [Will Boyd: wrapping and breaking](https://codersblock.com/blog/deep-dive-into-text-wrapping-and-word-breaking/) | Choose wrapping behavior with its intrinsic-size and reading effects in mind. |
| [Adam Argyle: five CSS snippets](https://web.dev/articles/5-css-snippets-every-front-end-developer-should-know-in-2024) | Consider nesting, subgrid, queries, and balanced text without inheriting historical support assumptions. |
| [Temani Afif: percentage height](https://css-tip.com/percentage-height/) | Treat newer sizing solutions as context-dependent; no universal percentage-height replacement was adopted. |

Social posts, image snippets, announcements, and visual experiments are useful
discovery material, but are not a scientific accessibility basis. Promote a new
rule only after reading its original, identifying its applicability/risks, and
running a representative mechanism or product test.
