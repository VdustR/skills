# Rewrite Procedure and Self-Check

The block must be true of the work's current state, so it is rewritten on every
push, every accepted review comment, and every scope change.

## Procedure

1. Read the current state first — the diff against the base branch, the
   resolved review conclusions, the decisions made since. Do not reread the old
   summary yet; it anchors you to a stale narrative.
2. Write all six beats fresh from what the work now does.
3. Only then compare against the old version, to recover a point that still
   holds and got dropped.
4. **Reclassify between Verified and Open.** This is what goes stale fastest.
   Yesterday's open question is often today's verified fact. When it is, the
   bullet moves into Verified with its reference and the old line disappears.
   Never annotate in place with "(confirmed)".
5. Re-verify each beat: is the bottom line still the main outcome, is the
   problem still live, does the approach match what the code now does, did
   review add or remove a trade-off, do all Verified references still resolve,
   and is each Open owner still the right person?
6. Read all six beats as one piece, checking for contradictions between beats
   and against the body sections.

## What must not appear

| Must not appear                                    | Where it belongs instead                  |
| -------------------------------------------------- | ----------------------------------------- |
| "Update:", "Additionally:", "EDIT:"                | The comment thread                        |
| "v2:", "second revision:"                          | The comment thread                        |
| "Adjusted per reviewer feedback"                   | The review reply                          |
| "Originally X, now changed to Y"                   | Nowhere — the description has no history  |
| "(confirmed)" appended to an open question         | Nowhere — the bullet moves to Verified    |
| "(fixed in abc1234)"                               | The commit log                            |
| Two bullets that contradict each other             | Nowhere — one of them is stale            |

Decision history survives only as a conclusion. Keep the outcome plus one
clause of reasoning in Trade-offs, in the present tense, and drop the path that
led there.

```text
Keep: The dropdown uses the component library's Select rather than a custom
one, because its keyboard accessibility is already handled.

Drop: A custom dropdown was built first, a reviewer pointed out the library
already has Select, and after discussion it was switched.
```

The second version documents the conversation. The reader needs the decision.

## Self-check before publishing

Run this every time the block changes, not only when it is first written.

- [ ] Six beats, fixed labels, original order; empty ones say "None"
- [ ] Nothing is hard-wrapped — each prose beat and each bullet is one continuous line
- [ ] Within the length budget, and no beat over three sentences or three bullets
- [ ] The first line is the conclusion, with no setup before it
- [ ] Every proper noun is glossed in the beat where it appears
- [ ] Every Verified bullet points at a file, URL, or section that resolves
- [ ] Every quoted person has a resolved real name and a linked thread
- [ ] Every Open bullet opens with a tag, and every confirmation or blocker names an owner
- [ ] Nothing unverified sits under Verified
- [ ] No file lists, diff counts, commit hashes, or code snippets
- [ ] No banned pattern from `anti-slop.md` and nothing from the table above
- [ ] Items were reclassified between the last two beats, not annotated in place
- [ ] The block was rewritten from the current state, not appended to
- [ ] No beat contradicts another beat or the body
