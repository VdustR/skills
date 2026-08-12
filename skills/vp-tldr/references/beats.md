# Structure and Length

## Choose the smallest useful shape

Match the structure to the artifact, audience, and user's instructions. Common
shapes include:

| Need | Possible shape |
| --- | --- |
| One clear result | One or two sentences |
| Several parallel facts | A conclusion followed by bullets |
| Current work | Status, blocker, next action |
| A decision | Decision, reason, consequence |
| An investigation | Finding, evidence, unknown |
| A proposed change | Problem, approach, trade-off, open question |

These are examples rather than named profiles. Use the source's vocabulary and
omit anything that is empty or irrelevant. A summary can combine shapes when
the result remains easier to scan than the body.

## Formatting

- Put the conclusion first, without a setup sentence.
- Keep one idea per sentence or bullet.
- Prefer a paragraph when labels would repeat the sentence they introduce.
- Prefer bullets for parallel facts, owners, blockers, or actions.
- Avoid nested lists, tables, code blocks, file inventories, and diff counts
  unless the user explicitly needs them in the summary.
- Do not hard-wrap text intended for a rendered Markdown surface.

## Length

There is no universal word or character count. A summary is complete when the
reader can determine relevance, outcome, and necessary action without reading
the body. Remove detail that does not change one of those decisions.

As a default, keep the summary to one short paragraph or up to five bullets.
Expand only when the artifact's complexity or requested format requires it.
