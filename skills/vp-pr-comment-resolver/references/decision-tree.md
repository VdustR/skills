# Decision Tree

Use this flow after fetching and queuing PR review-thread comments and PR
discussion comments.

```text
Comment received
      |
      v
Classify author
  - Tier 1: GraphQL __typename
  - Tier 2: profile
  - Tier 2b: public activity
  - Tier 3: ask user
      |
      v
Is the comment clear?
  - No: ask user for clarification
  - Yes: continue
      |
      v
Does the comment pass the validity checklist?
  - No: discuss with user before disagreeing
  - Yes: continue
      |
      v
Is a code change needed?
  - Yes: fix, verify, commit, push if authorized, reply
  - No: reply with explanation
      |
      v
What kind of comment is it?
  - PR discussion comment: post mention + quote reply only
  - Review thread: continue
      |
      v
Is the author a bot?
  - Yes: resolve thread after replying
  - No: leave unresolved for the human reviewer
```

Terminal outcomes:

| Outcome | Reply | Resolve? |
|---------|-------|----------|
| Bot review thread fixed | commit link and files | yes |
| Bot review thread no-fix | reason | yes |
| Bot review thread disagreed | evidence-backed reply after user review | yes |
| Human review thread fixed | commit link and files | no |
| Human review thread no-fix | reason | no |
| Human review thread disagreed | evidence-backed reply after user review | no |
| PR discussion comment | mention + quote + reply body | not resolvable |
