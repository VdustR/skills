# Beats, Shape, and Length

## Form of each beat

Beats 1-3 are prose with the label inline. Beats 4-6 are a bold label on its
own line followed by bullets. One idea per sentence and one idea per bullet.

Formatting protects skimming: one blank line between beats, no nested lists, no
tables, no code blocks, and no decorative markup beyond the block's own
heading. File lists, diff counts, commit hashes, and code snippets belong in the
body, not here.

**Do not hard-wrap.** Many hosts, including pull request and issue bodies on
GitHub, render every newline as a visible line break, so text pre-wrapped at a
fixed column arrives as ragged short lines. Each prose beat is one continuous
line, and each bullet is one continuous line, however long. Beats 4-6 still
span several lines by design — the label sits on its own line and each bullet
follows — so this is about never breaking a sentence mid-thought, not about
collapsing a beat.

## Where beats blur

**Approach vs Trade-offs.** Approach says why the chosen solution works.
Trade-offs says what it costs and which alternatives lost. If a sentence names
a rejected option, it belongs in Trade-offs.

**Verified vs Open.** The split is epistemic status, not importance. A minor
fact that was actually tested goes in Verified. A central claim that only looks
obvious goes in Open with an inference tag.

Risk does not get a beat of its own. A known cost goes in Trade-offs, an
unknown one goes in Open with a tag, and the reviewer-facing technical
watch-out list stays in the body.

## Length budget

Length is measured in the summary's own script, so the two columns describe the
same amount of reading rather than the same count.

| Scope             | Logographic script  | Alphabetic script   |
| ----------------- | ------------------- | ------------------- |
| Whole block       | 250-400 characters, cap 500 | 150-250 words, cap 300 |
| Prose beat (1-3)  | 1-3 sentences, cap 3 | 1-3 sentences, cap 3 |
| One sentence      | ≤ 50 characters, cap 60 | ≤ 30 words, cap 35 |
| Bullet list (4-6) | ≤ 3 bullets         | ≤ 3 bullets         |
| One bullet        | 1 line, ≤ 60 characters | 1 line, ≤ 35 words |

Paths, URLs, and code identifiers do not count: a Verified bullet is required
to name a test file, so charging it for the full path would price the rule out
of the thing it exists to encourage.

A cap is a ceiling with headroom, not a target. Exceeding one means the content
belongs in the body. When a beat has more than three items, keep the three that
change the reader's decision.

## Language conventions

- Keep technical terms, identifiers, paths, and flag names in their original
  form rather than translating them into the summary language.
- When the text mixes scripts, follow the target language's own convention for
  punctuation and for spacing between scripts, and apply it consistently.
- Fix one wording per epistemic tag and per evidence-form prefix in the summary
  language, punctuation included, and reuse it verbatim across artifacts. The
  tags are skimmable only because they are identical every time.

## Boundaries with the rest of the artifact

Overlap is what makes sections drift apart, so each fact lives in one place.

| Content                                              | Where it lives              |
| ---------------------------------------------------- | --------------------------- |
| Plain-language entry point                           | The summary block           |
| Chosen approach and rejected alternatives, one line each | Trade-offs              |
| Verified facts with a pointer, at most three         | Verified                    |
| Epistemic status and blockers with owners            | Open                        |
| Before and after images, video, payload diffs        | The body's visual section   |
| Problem background, links, ticket references         | The body's rationale section |
| API shape, code samples, migration notes             | The body's implementation section |
| Full test strategy and the technical watch-out list  | The body's implementation section |
| Back-and-forth discussion and review replies         | The comment thread          |
| One-line changelog entry                             | The changelog or release notes |

Verified is not the tests checkbox restated. The checkbox says tests exist;
this beat says which case proves which claim.

Sentences copied from the body are duplication, and the two copies drift apart
on the next edit. Say each thing once, at the altitude where it belongs.
