# Banned Patterns

Each row costs the reader attention without adding information. The wordings
below are English examples; the pattern is what is banned, in whatever language
the summary is written in.

| Banned                                            | Why it fails                                      | Instead                                |
| ------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| "This document aims to…", "The purpose of this update is…" | Spends the highest-value line saying nothing | Open with the conclusion itself        |
| "It is worth noting that", "In summary", "All in all" | Filler that adds length, not information       | Delete it and state the point          |
| Three parallel clauses filling one sentence       | Padding disguised as structure                    | Keep the one item that matters         |
| "significantly", "substantially", "across the board" with no number | An unverifiable claim            | Give the number, or drop the adjective |
| File counts, message counts, or other source inventory | Restates metadata the reader can already see | Describe the meaningful result         |
| "Completely solves", "fully supports"             | Overclaims what one change can prove              | State the scope actually covered       |
| "Should be fine", "theoretically works" stated as fact | Presents an inference as established           | State the basis and uncertainty        |
| "Checks passed" with no relevant detail           | Does not show what the check establishes          | Name the relevant check and result     |
| "The PM said", "backend said" with no name or link | Names nobody, and dies with the thread           | Resolved name plus a linked thread     |
| "No known issues" with no stated basis            | Hides what was and was not checked                 | State the checked scope or omit it      |
| Translated-sounding sentences that keep another language's structure | Machine-translation texture     | Write natively in the summary language |
| Em-dash chains stitching clauses together         | Reads as generated prose                          | Split into two sentences               |
| "Not X, but Y" for a plain fact                   | A contrast frame where an observation would do    | State the observed fact                |
| Sentences copied from the body                    | Duplication; the two drift apart on the next edit | Say it once, at the right altitude     |
| "Done", "fixed" as a checklist-style ending       | A status log, not a summary                       | Fold it into Approach or Verified      |
| "Feel free to reach out with questions"           | Ceremonial padding                                | End after the last useful point        |

## Annotated bad example

```markdown
## TL;DR

This update aims to comprehensively improve the contact panel experience. It is
worth noting that it not only adds a custom field section, but also
significantly improves data loading performance and polishes the visuals.

**Evidence**

- Checks passed.
- The project lead said this is fine.
- Performance should be fine.

Update: changed the implementation after feedback.
```

In reading order:

1. "This update aims to" burns the first line. After a full sentence the reader
   still does not know what changed, and there is no bottom-line beat to jump
   to.
2. "comprehensively" and "significantly" carry no number, so they assert
   nothing checkable.
3. "not only… but also… and…" is three-item padding, and the second and third
   items are already in the body.
4. "Checks passed" does not identify which conclusion the checks support.
5. "The project lead said this is fine" has no name or source, so the reader
   cannot assess the attribution.
6. "Performance should be fine" presents an inference as an established fact.
   It needs its basis and uncertainty.
7. "Update:" keeps the description's own edit history in the reader's way.
8. The result, relevant limitation, and required action are unclear.
