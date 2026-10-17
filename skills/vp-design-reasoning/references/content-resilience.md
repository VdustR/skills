# Design for variable content and constrained space

Treat content size and overflow as part of the interaction. A layout is not
complete until users can identify objects, read needed information, and reach
actions when content or text size exceeds the initial example.

Preserve every requested surface and supported container constraint. Do not
replace a narrow side panel with a larger dialog just to avoid long-content
behavior. Propose an adaptive presentation within each required surface, or
identify a demonstrated incompatibility for the user to decide.

## Decide before styling

For variable-content regions, choose the smallest useful record of these decisions:

| Region and user intent | Information that must remain visible | Preferred size and meaningful bounds | Excess-content policy | Full-content route | Scroll owner and axes |
| --- | --- | --- | --- | --- | --- |
| Illustrative file picker; choose the correct file | Distinguishing name and extension | Row adapts to available width; controls retain usable targets | Wrap, or a deliberate name preview | Verified inline reveal or actual file-details action | List owns vertical scroll; rows do not |

The example does not assert that a file-details page exists. Use established
product behavior where available. An intrinsic growing dimension is a valid
constraint decision; do not assign arbitrary minimums, maximums, or line counts
to every element. Define meaningful limits where readability, containment, or
reachability requires them, and specify behavior beyond those limits.

Choose among wrapping, single-line truncation, multi-line preview, and justified
scrolling based on the user's information need. Preserve full instructions,
validation messages, and decision-critical identity in place when practical.
Two objects that differ only in a truncated suffix must remain distinguishable
before selection or commitment. Do not solve the visual layout by hiding the
information needed to operate it.

## Complete shortened-content interactions

For each ellipsis or clamp, name a real route to the full current value and
exercise it with pointer, keyboard, and touch as applicable. Inline expansion,
a native disclosure, or an existing details destination can work. A hover-only
tooltip or a `title` attribute alone does not provide the same access across
input methods. A screen reader receiving the full string also does not solve
the sighted keyboard/touch user's need to inspect it. Copying text alone is not
a visual reading route.

Keep the affordance discoverable, the revealed content readable, the expanded
state truthful, and focus predictable. Define close/return behavior; do not
remove a currently focused control when content expands or collapses without
placing focus appropriately. Preserve selection and context when returning
from a details destination if the existing flow supports it. Do not invent
navigation, persistence, or editing capabilities to satisfy this checklist.

Keep majority-needed information visible; disclosure is useful for optional
detail, not a default way to hide the user's primary task. An explicit request
for full content should reveal it, not change to another equally truncated preview.

## Make scrolling deliberate

Specify the intended scroll regions and axes for the supported layouts. A
reading page often owns its vertical scroll; a workspace can legitimately have
independent panels. Avoid accidental row scrollers, nested scroll traps, and
page-wide horizontal overflow. Code and tables may justify local horizontal
scroll. There is no universal rule that an interface must have one scrollbar.

Check that users can discover the scroll region, reach it by keyboard where
needed, access its final content/actions, and leave it without a trap. Keep
focus indicators, headers, and sticky actions visible. Check short content as
well as long content so unused regions do not acquire unnecessary scrollbars.
Consider real touch/wheel behavior and the OS's overlay scrollbar settings;
an invisible scrollbar in one screenshot is not proof of absent overflow.

## Verification and implementation handoff

Use realistic extremes: empty/short values, long natural text, an unbroken URL
or identifier, similar names with different endings, supported scripts and
emoji, fallback fonts, narrow parent containers, enlarged text, and user spacing.
Check letter tops/bottoms and line boxes, not only whether text stays in bounds.
Increasing line height inside a fixed-height clipped box can lose content.

For web implementation, use
[`vp-css-best-practices`](https://github.com/VdustR/skills/tree/main/skills/vp-css-best-practices)
when CSS sizing, wrapping, clamping, or scroll behavior implements these decisions.
That skill owns CSS mechanisms and browser evidence; this reference owns the
information, disclosure, and navigation decisions. For native UI, use equivalent
platform layout/text/disclosure mechanisms rather than prescribing CSS.

Keep mechanism tests, visual inspection, assistive-technology checks, and user
research distinct. An ellipsis declaration does not establish correct paint or
full-content access; a screenshot does not establish a working reveal/return path.

## Sources

- [W3C text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
  explains loss of content/functionality under user spacing overrides.
- [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
  describes keyboard toggling and expanded state for custom disclosures.
- [GOV.UK details component](https://design-system.service.gov.uk/components/details/)
  distinguishes optional detail from information most users need immediately.

These inform the scoped design decisions above; they do not endorse a single
truncation policy for all components or certify a particular implementation.
