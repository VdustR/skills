# GitHub CLI Reference

Use these commands when processing PR review-thread comments and PR discussion
comments. Prefer GraphQL for review-thread replies so replies land on the exact
thread.

## Fetch PR Feedback

```bash
gh api graphql -f owner="<OWNER>" -f repo="<REPO>" -F number=<PR_NUMBER> -f query='
query($owner:String!, $repo:String!, $number:Int!) {
  viewer { login }
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      id
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 10) {
            nodes {
              id
              body
              author {
                __typename
                login
              }
              createdAt
              url
            }
          }
        }
      }
      comments(first: 100) {
        nodes {
          id
          body
          author {
            __typename
            login
          }
          createdAt
          url
        }
      }
    }
  }
}' --jq '
  .data.viewer.login as $viewer |
  {
    viewer: $viewer,
    pullRequestId: .data.repository.pullRequest.id,
    reviewThreads: [
      .data.repository.pullRequest.reviewThreads.nodes[]
      | select(.isResolved == false)
      | {
          kind: "review-thread",
          id,
          isOutdated,
          path,
          line,
          comments: [
            .comments.nodes[]
            | select((.author.login // "ghost") != $viewer)
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
      .data.repository.pullRequest.comments.nodes[]
      | select((.author.login // "ghost") != $viewer)
      | {
          kind: "pr-comment",
          id,
          author: (.author.login // "ghost"),
          authorType: (.author.__typename // "User"),
          body,
          createdAt,
          url
        }
    ]
  }
'
```

## Reply To Review Thread

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

## Reply To PR Discussion Comment

Use `addComment` against the PR node ID. Include a mention and quote so the
bottom-of-PR reply has enough context.

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

## Resolve Review Thread

```bash
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: {
      threadId: "<THREAD_ID>"
    }) {
      thread { isResolved }
    }
  }
'
```

## Fallback Behavior

If the GraphQL API fails to reply to a review thread because of a network error,
permission issue, or already-resolved thread:

1. Retry once after a brief delay.
2. If retry fails, use `gh pr comment` with clear context.
3. Report that the reply was posted as a general PR comment.
4. Continue processing remaining comments.

```bash
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
**Re: Review comment on `<FILE_PATH>:<LINE>`**

> <ORIGINAL_COMMENT_EXCERPT>

<YOUR_REPLY_CONTENT>

---
*Note: Unable to reply directly to the review thread. This is a fallback comment.*
EOF
)"
```

For PR discussion comments, if GraphQL `addComment` fails but `gh pr comment`
works, use `gh pr comment` with the same `@author` and quoted excerpt. Do not
add the review-thread fallback note unless falling back from an actual review
thread.
