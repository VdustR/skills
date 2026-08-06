---
name: vp-tldr
description: >-
  Write or rewrite the TL;DR summary block that opens a pull request, issue,
  design document, handoff note, or status post, so a reader with no context
  decides in seconds whether it concerns them and can tell verified facts from
  inference. Use when drafting that summary, when an existing one no longer
  matches the current state of the work, or when a description buries its
  conclusion, its open questions, or its blockers. Boundary: covers the summary
  block only, not the body sections around it, and not reviewing someone else's
  change.
---

# TL;DR Summary

The summary is the first block of the artifact, and for most readers it is
where they stop. It does two jobs: it lets a reader decide within seconds
whether the work concerns them, and it separates what has been verified from
what has not, so the readers who continue know where to spend their attention.

## Who reads it

Write for someone who opens the artifact with zero context. They do not know
the feature name, have not read the ticket, and were not in the discussion.
They are also the person who has to decide whether to trust the work.

That reader model produces three constraints:

- **Explain every proper noun on first use.** Feature names, flag names, and
  internal component names each need a short in-place gloss. A reader who has
  to look something up has already stopped reading.
- **Never require the reader to remember earlier text.** Each beat stands
  alone, and a pronoun must have its referent in the same beat.
- **Never state an unverified thing in the voice of a verified one.** Every
  claim either carries a reference or carries an epistemic tag. There is no
  third category.

## The six beats

Fixed order, fixed labels, shallowest first. Every beat is a valid stopping
point.

| Beat             | Answers                                                | Form          |
| ---------------- | ------------------------------------------------------ | ------------- |
| **Bottom line**  | Whether to keep reading                                | 1 sentence    |
| **Problem**      | What is wrong now, and who feels it                    | 1-3 sentences |
| **Approach**     | How it is solved, and why that works                   | 1-3 sentences |
| **Trade-offs**   | What it costs, which alternatives lost and why         | ≤ 3 bullets   |
| **Verified**     | Which claims are checked facts, and where the proof is | ≤ 3 bullets   |
| **Open**         | What is inference, unknown, or blocked, and on whom    | ≤ 3 bullets   |

Do not rename, reorder, merge, or add a seventh beat. **Verified** and **Open**
stay even when thin — write "None", because an empty **Open** is a meaningful
claim that the author checked. Shape, length budget, beat boundaries, and what
belongs in the body sections instead are in `references/beats.md`.

## Language

Default to the language the user habitually works in, which is the language
they are writing to you in unless their instructions name a different one.
Plain language for the actual readers is the point of the block, so it does not
inherit the language of the surrounding artifact or of the codebase.

- A documented convention wins over the default. When a repository, team, or
  user instruction fixes the language of this kind of artifact, follow it. The
  block can be an exception to that convention, but only once the exception is
  agreed, and it is then recorded where the convention lives so the next person
  does not read it as a mistake.
- If the readers do not share the default language, ask before writing rather
  than guessing. A public repository, an open source project, or a mixed-language
  team is the usual case.
- Keep identifiers, paths, flags, commands, and product terms in their original
  form. Do not translate them.
- Translate the six beat labels and the epistemic tags into the summary
  language, and keep one wording per label across artifacts. The set and the
  order never change.

## Evidence and epistemic status

Every **Verified** bullet points at something the reader can open: a test file
plus the case name, a manual verification with environment and observation, a
linked thread with the person's resolved real name, a document, or a section of
this same artifact. No reference means the claim does not belong in that beat.

Every **Open** bullet opens with a tag — inference, unknown, needs
confirmation, or blocker — and the last two name an owner. "Waiting on the
backend" leaves nobody responsible. Evidence forms, attribution rules, and the
tag table are in `references/evidence.md`.

The most damaging move this block can make is promoting an inference into
**Verified** because it feels safe. If nothing was executed, it is an
inference.

## Rewrite, never patch

The summary must be true of the current state of the work, so every push, every
accepted review comment, and every scope change requires a rewrite. Rewrite
means delete and write again from the current diff or current state, then
compare against the old version only to recover a point that still holds.

Appending a sentence, prefixing "Update:", annotating a resolved item in place,
or leaving a superseded bullet next to its replacement all produce a
description the reader has to reconcile. A resolved question moves into
**Verified** with its reference, and the old line disappears. The procedure,
the patterns that must not appear, and the pre-publish self-check are in
`references/rewrite.md`.

## Before it ships

Read the finished block once as a whole, checking that no beat contradicts
another or the body sections. Then check it against the banned patterns and the
annotated bad example in `references/anti-slop.md` — filler openers, unquantified
intensifiers, restated diff statistics, and uncitable claims are what make a
summary cost more attention than it saves.

## Route

Use vp-pr-briefing to understand a pull request someone else wrote, vp-git for
the pull request lifecycle around the description, and vp-checklist-runner when
the artifact's checklist has to be verified rather than summarized.
