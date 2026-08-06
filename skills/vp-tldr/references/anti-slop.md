# Banned Patterns

Each row costs the reader attention without adding information. The wordings
below are English examples; the pattern is what is banned, in whatever language
the summary is written in.

| Banned                                            | Why it fails                                      | Instead                                |
| ------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| "This PR aims to…", "The purpose of this change is…" | Spends the highest-value line saying nothing   | Open with the conclusion itself        |
| "It is worth noting that", "In summary", "All in all" | Filler that adds length, not information       | Delete it and state the point          |
| Three parallel clauses filling one sentence       | Padding disguised as structure                    | Keep the one item that matters         |
| "significantly", "substantially", "across the board" with no number | An unverifiable claim            | Give the number, or drop the adjective |
| "Adds 3 files, modifies 7 files"                  | Restates the diff the reader already has          | Describe the behavior change           |
| "Completely solves", "fully supports"             | Overclaims what one change can prove              | State the scope actually covered       |
| "Should be fine", "theoretically works" under Verified | An inference wearing a fact's label          | Move it to Open with an inference tag  |
| "Added tests", "all tests pass"                   | Names no case, so covers nothing checkable        | Cite the file and the case             |
| "The PM said", "backend said" with no name or link | Names nobody, and dies with the thread           | Resolved name plus a linked thread     |
| "No known issues" as an empty Open beat           | A catch-all that hides whether anyone checked     | Write "None", or name the open item    |
| Translated-sounding sentences that keep another language's structure | Machine-translation texture     | Write natively in the summary language |
| Em-dash chains stitching clauses together         | Reads as generated prose                          | Split into two sentences               |
| "Not X, but Y" for a plain fact                   | A contrast frame where an observation would do    | State the observed fact                |
| Sentences copied from the body                    | Duplication; the two drift apart on the next edit | Say it once, at the right altitude     |
| "Done", "fixed" as a checklist-style ending       | A status log, not a summary                       | Fold it into Approach or Verified      |
| "Feel free to reach out with questions"           | Ceremonial padding                                | End at the Open beat                   |

## Annotated bad example

```markdown
## TL;DR

This PR aims to comprehensively improve the contact panel experience. It is
worth noting that it not only adds a custom field section, but also
significantly improves data loading performance and polishes the visuals.

**Verified**

- Added tests, and they all pass.
- The PM said this is fine.
- Performance should be fine.

Update: changed useEffect to derived state per reviewer feedback.
```

In reading order:

1. "This PR aims to" burns the first line. After a full sentence the reader
   still does not know what changed, and there is no bottom-line beat to jump
   to.
2. "comprehensively" and "significantly" carry no number, so they assert
   nothing checkable.
3. "not only… but also… and…" is three-item padding, and the second and third
   items are already in the body.
4. "Added tests, and they all pass" names no case, so it proves nothing.
5. "The PM said this is fine" has no name and no link; once the thread scrolls
   away it is unverifiable.
6. "Performance should be fine" is an inference sitting under Verified. It
   belongs in Open with an inference tag.
7. "Update:" keeps the description's own edit history in the reader's way.
8. Four of the six beats are missing, so nothing can be skimmed and no blocker
   is visible.
