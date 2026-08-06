# Evidence and Epistemic Tags

## Verified: every bullet resolves

Each bullet under **Verified** must point at something the reader can open. No
reference means the claim does not belong in this beat.

| Form              | Shape                                                             |
| ----------------- | ----------------------------------------------------------------- |
| Test              | `Test:` the file path and the case name, plus what it covers       |
| Manual check      | `Manual:` which environment, what was done, what was observed      |
| Decision in a thread | `<platform>:` a descriptive link, plus who confirmed what in one clause |
| Document or spec  | `Doc:` a titled link                                               |
| Code elsewhere    | The repository or service, plus the path                           |
| This artifact     | Which body section or test file, by name                           |
| Captured screen   | A specific image or recording labeled as coming from this change   |

**Attribute people by resolved name and link.** "The product manager approved
it" is not evidence. Chat user IDs must be resolved to names before being
quoted; an unresolved `U0123ABCD` is an unverified attribution, and an
unlinked claim dies as soon as the thread scrolls away.

**Cite the case, not the suite.** "Added tests" tells the reader nothing. The
file plus the case name tells them what is covered, and by omission what is
not.

**Only real output counts as visual evidence.** A screenshot or recording
produced by the change under review can be cited here. A mockup or a design
comp is intent, and citing it is the same error as calling an inference a fact.
When the artifact carries images, label each one with its provenance so the two
cannot be confused.

**Never round an inference up to a fact.** If the reasoning is sound but
nothing was executed, it is an inference and belongs under **Open**. Moving it
into **Verified** because it feels safe is the most damaging thing this block
can do.

## Open: every bullet carries a tag

Each bullet under **Open** opens with one of four tags, first thing on the
line, so the beat can be skimmed for what is unresolved.

| Tag                  | Means                                              | Must also include             |
| -------------------- | -------------------------------------------------- | ----------------------------- |
| `Inference:`         | Good reason to believe it, but nothing was executed | What the inference rests on   |
| `Unknown:`           | A known gap, with no judgment made yet              | What specifically is unknown  |
| `Needs confirmation:`| Someone has to answer before it can be settled      | A person, and the question    |
| `Blocker:`           | Blocks merge or release                             | A person or team, and the action |

`Needs confirmation:` and `Blocker:` without a named owner are incomplete.
"Waiting on the backend" leaves nobody responsible; "waiting on <name> to
confirm whether the API can return null" does not.

A blocker must open with its tag. Burying one mid-sentence in another beat is a
process failure, not a formatting preference.

Write these tags in the summary's language, keeping one wording per tag across
artifacts so a reader who has seen one summary can skim the next.

## Unattended generation

When the summary is produced by an automated path that has no diff analysis and
no verification of its own, do not invent the beats. Emit the six labels as a
stub, put whatever the automation can actually back — a quality gate that ran,
for example — under **Verified**, and carry a blocker under **Open** naming the
person or team who has to rewrite it. A stub that admits what it is costs less
than a plausible summary nobody checked.
