# PR Review Follow-up Workflow

Use this workflow for reviewer-side follow-up on PR review threads and bottom PR
discussion comments.

## 1. Gather PR Context

Start read-only. Do not edit, commit, push, or force-push the PR branch unless
the user explicitly asks.

```bash
gh pr view <NUMBER_OR_URL> --json number,title,author,headRefName,baseRefName,url,commits,reviewDecision,statusCheckRollup
```

Fetch the viewer login:

```bash
gh api user --jq '.login'
```

If local checkout is necessary for verification, prefer an isolated worktree or
read-only checkout flow that matches the current agent's git policy. If changing
the current checkout would be surprising or unsafe, ask first.

## 2. Fetch Review Threads and PR Comments

Fetch all review threads, including resolved and outdated ones, because the
viewer may need to verify a reply after a thread was changed or prematurely
resolved.

```bash
gh api graphql -f owner="<OWNER>" -f repo="<REPO>" -F number=<PR_NUMBER> -f query='
query($owner:String!, $repo:String!, $number:Int!) {
  viewer { login }
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      id
      number
      title
      url
      author { login }
      commits(last: 100) {
        nodes {
          commit {
            oid
            abbreviatedOid
            committedDate
            messageHeadline
            author { user { login } }
          }
        }
      }
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 50) {
            nodes {
              id
              body
              createdAt
              url
              author { __typename login }
            }
          }
        }
      }
      comments(first: 100) {
        nodes {
          id
          body
          createdAt
          url
          author { __typename login }
        }
      }
    }
  }
}' --jq '
  .data.viewer.login as $viewer |
  .data.repository.pullRequest as $pr |
  {
    viewer: $viewer,
    pullRequest: {
      id: $pr.id,
      number: $pr.number,
      title: $pr.title,
      url: $pr.url,
      author: ($pr.author.login // "ghost")
    },
    commits: [
      $pr.commits.nodes[]
      | {
          oid: .commit.oid,
          shortOid: .commit.abbreviatedOid,
          committedDate: .commit.committedDate,
          message: .commit.messageHeadline,
          author: (.commit.author.user.login // "unknown")
        }
    ],
    reviewThreads: [
      $pr.reviewThreads.nodes[]
      | .comments.nodes as $comments
      | {
          kind: "review-thread",
          id,
          isResolved,
          isOutdated,
          path,
          line,
          opener: (($comments[0].author.login) // "ghost"),
          openedByViewer: ((($comments[0].author.login) // "ghost") == $viewer),
          comments: [
            $comments[]
            | {
                id,
                author: (.author.login // "ghost"),
                authorType: (.author.__typename // "User"),
                body,
                createdAt,
                url
              }
          ]
        }
    ],
    prComments: [
      $pr.comments.nodes[]
      | {
          kind: "pr-comment",
          id,
          author: (.author.login // "ghost"),
          authorType: (.author.__typename // "User"),
          openedByViewer: (((.author.login // "ghost") == $viewer)),
          body,
          createdAt,
          url
        }
    ]
  }
'
```

If there are more than 100 threads or comments, page the GraphQL connections
instead of silently ignoring older conversations.

## 3. Classify Conversations

For review threads:

- `own-thread`: first thread comment author equals the viewer login.
- `other-thread`: first thread comment author is not the viewer.
- `author-replied`: the PR author commented after the opener comment.
- `viewer-replied-last`: the newest thread comment is by the viewer.
- `stale-after-author-activity`: the PR author committed to the PR after the
  viewer's last thread comment but did not reply to the thread.

For PR discussion comments:

- `own-pr-comment`: comment author equals the viewer login.
- `other-pr-comment`: comment author is not the viewer.
- Because PR comments are linear, infer follow-up context from later comments
  that mention the author, quote the comment, link the comment URL, or discuss
  the same topic. When this is ambiguous, ask before posting.

## 4. Verify Before Acting

For each candidate conversation:

1. Read the original comment and all later replies.
2. Inspect the current diff and current files related to the concern.
3. Check commits after the relevant comment timestamp.
4. Run the narrowest relevant verification:
   - Targeted test for behavior claims.
   - Lint/typecheck for static correctness claims.
   - CI status when it directly covers the concern.
   - Official or repo docs for API or convention disputes.
5. Decide whether the concern is resolved, still valid, ignored, uncertain, or
   not worth further action.

Do not post a challenge when the evidence is thin. Report the uncertainty and
ask the user which posture to take.

## 5. Act on Own Review Threads

### Resolved by Evidence

If the viewer opened the thread and verification confirms the author resolved
the concern:

1. Add a short confirmation reply when useful.
2. Resolve the thread.

```bash
gh api graphql -f query='
  mutation($body: String!, $threadId: ID!) {
    addPullRequestReviewThreadReply(input: {
      pullRequestReviewThreadId: $threadId,
      body: $body
    }) {
      comment { id url }
    }
  }
' -f threadId="<THREAD_ID>" -f body="<REPLY_BODY>"
```

```bash
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: {
      threadId: $threadId
    }) {
      thread { id isResolved }
    }
  }
' -f threadId="<THREAD_ID>"
```

If no reply is useful, resolving alone is acceptable when the platform allows it
and the verification evidence is strong.

### Concern Remains

If the author replied but the issue remains:

1. Reply in the thread with concise evidence.
2. Keep the thread open.

### Ignored After Author Activity

If the author has committed or replied elsewhere after the user's comment but
this thread has no author reply and no relevant fix:

1. Reply in the thread with a reminder.
2. Name the unresolved concern and the evidence checked.
3. Keep the thread open.

### Waiting

If there is no author reply and no later author activity, do not nag. Report it
as waiting.

## 6. Act on Other Reviewers' Threads

Never resolve another reviewer's thread.

Reply only when one of these is true:

- You independently verified the issue and can add useful evidence.
- The author response appears incomplete or incorrect and you can explain why.
- You see an adjacent risk that the original reviewer did not mention.
- You disagree with the original comment and can provide evidence without taking
  over the thread.

Skip when your reply would only say "looks good" or duplicate the existing
conversation.

## 7. Act on PR Discussion Comments

Bottom PR comments have no review-thread resolution state. Use the same
verification logic, but reply as a new PR comment with mention-and-quote context:

```bash
gh api graphql -f query='
  mutation($body: String!, $subjectId: ID!) {
    addComment(input: {
      subjectId: $subjectId,
      body: $body
    }) {
      commentEdge { node { id url } }
    }
  }
' -f subjectId="<PULL_REQUEST_ID>" -f body="@<AUTHOR>

> <ORIGINAL_COMMENT_EXCERPT>

<REPLY_BODY>"
```

For the viewer's own PR discussion comment:

- If the author responded and the concern is resolved, post a short closure
  reply only when useful.
- If the author responded but the concern remains, challenge with evidence.
- If the author ignored it despite later PR activity, remind with evidence.

For other people's PR discussion comments:

- Add verified agreement or additional review input when useful.
- Skip when there is nothing material to add.

## 8. Final Report

Report only actions and meaningful skips:

```markdown
## PR Review Follow-up Summary

**PR:** #<number> - <title>
**Checked:** <n> conversations

| Status | Count |
|--------|-------|
| Resolved own threads | <n> |
| Challenged own threads | <n> |
| Reminded own threads | <n> |
| Replied on others' threads | <n> |
| Replied to PR comments | <n> |
| Skipped | <n> |

### Details
| Conversation | Owner | Action | Evidence |
|--------------|-------|--------|----------|
| `<path>:<line>` | own | resolved | `<test or file evidence>` |
| `<path>:<line>` | other | replied | `<evidence added>` |
```

If the skill posted comments, include the comment URLs when available.
