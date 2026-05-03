# PR Review Follow-up Reply Templates

Use concise, evidence-backed replies. Match the review conversation's language
when appropriate; default to English when unsure.

## Footer

Use this footer when generated-message disclosure is expected in the repo:

```markdown
Generated with [vp-pr-review-followup](https://github.com/VdustR/skills).
```

Omit the footer if the repository or user prefers human-only comment style.

## Own Review Thread: Resolve After Verification

```markdown
Verified the latest change addresses this.

Evidence:
- `{FILE_PATH}:{LINE_NUMBER}` now {WHAT_CHANGED}
- `{VERIFICATION_COMMAND}` passes / CI covers this path

Resolving this thread.
```

Short form:

```markdown
Verified in `{FILE_PATH}:{LINE_NUMBER}`. Resolving this thread.
```

## Own Review Thread: Challenge Author Reply

```markdown
Thanks for the update. I re-checked this, and I think the original concern still
applies.

Evidence:
- `{FILE_PATH}:{LINE_NUMBER}` still {CURRENT_PROBLEM}
- `{VERIFICATION}` shows {OBSERVED_RESULT}

Can you take another look at {SPECIFIC_REQUEST}?
```

## Own Review Thread: Reminder After No Reply

```markdown
Following up on this thread. I saw newer PR activity, but I could not find a
reply here or a change that addresses the concern.

Still unresolved:
- `{FILE_PATH}:{LINE_NUMBER}` {CURRENT_PROBLEM}

Can you either address this or explain why the current behavior is intentional?
```

## Own Review Thread: Author Fixed Without Reply

```markdown
I checked the latest diff and this appears to be addressed by
`{COMMIT_OR_CHANGE_REFERENCE}`.

Evidence:
- `{FILE_PATH}:{LINE_NUMBER}` now {WHAT_CHANGED}
- `{VERIFICATION}` confirms {RESULT}

Resolving this thread.
```

## Other Reviewer's Thread: Verified Agreement

```markdown
I independently checked this and agree with @{REVIEWER}.

Additional evidence:
- `{FILE_PATH}:{LINE_NUMBER}` {WHY_THE_CONCERN_IS_VALID}
- `{VERIFICATION}` shows {RESULT}
```

## Other Reviewer's Thread: Additional Concern

```markdown
Adding one more concern to this thread: {SHORT_CONCERN}.

Evidence:
- `{FILE_PATH}:{LINE_NUMBER}` {DETAIL}
- This also affects {RELATED_CASE}
```

## Other Reviewer's Thread: Disagree With Evidence

```markdown
I may be missing context, but I read this differently.

Evidence:
- `{FILE_PATH}:{LINE_NUMBER}` {WHAT_THE_CODE_DOES}
- `{DOC_OR_TEST_REFERENCE}` supports {WHY_CURRENT_APPROACH_MAY_BE_OK}

I would not block on this unless there is another case I'm not seeing.
```

## PR Discussion Comment Wrapper

Use this for bottom-of-PR comments because GitHub PR discussion comments are
linear, not resolvable review threads.

```markdown
@{AUTHOR}

> {ORIGINAL_COMMENT_EXCERPT}

{REPLY_BODY}
```

Example:

```markdown
@author

> Can we make sure the retry path is covered?

Verified this is now covered by `src/api/retry.test.ts`; the targeted test
passes locally with `npm test -- src/api/retry.test.ts`.
```

## PR Discussion Comment: Challenge

```markdown
@{AUTHOR}

> {ORIGINAL_COMMENT_EXCERPT}

I re-checked this and still think the concern is unresolved.

Evidence:
- `{FILE_OR_DIFF_REFERENCE}` {CURRENT_STATE}
- `{VERIFICATION}` shows {RESULT}

Can you address this or clarify the intended behavior?
```

## PR Discussion Comment: Reminder

```markdown
@{AUTHOR}

> {ORIGINAL_COMMENT_EXCERPT}

Following up because there has been newer PR activity, but I could not find a
reply or a related change for this point. Can you confirm whether this is still
planned for this PR?
```

## Skip Reasons for Final Report

Use these in the summary; do not post them to GitHub unless useful:

- `waiting`: no author reply and no later author activity.
- `duplicate`: another later comment already covers the same point.
- `no-extra-signal`: another reviewer's thread is already clear and complete.
- `ambiguous-context`: PR discussion comment cannot be safely mapped to a
  concrete concern.
- `needs-user-call`: evidence supports multiple reasonable review postures.
