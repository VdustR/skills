# Author Classification

Classify each PR feedback author before deciding whether a review thread should
be resolved after replying. General PR discussion comments are never resolvable,
regardless of author.

## Resolution Policy

| Comment kind | Author class | After reply |
|--------------|--------------|-------------|
| Review thread | Bot | resolve |
| Review thread | Human | leave unresolved |
| PR discussion comment | Bot or human | reply only |

Bots do not follow up in normal review-thread workflows, so a decided outcome is
terminal. Human reviewers may dispute the decision, so leave their threads open.

## Tier 1: GraphQL Type

Use `author.__typename` from the PR feedback query as the primary signal.

| `__typename` | Classification |
|--------------|----------------|
| `Bot` | Bot; reliable, no further check |
| `User` | Ambiguous; inspect profile when the distinction matters |
| `Organization` | Rare; ask the user unless another signal is decisive |

## Tier 2: Profile-Based Judgment

When `__typename == "User"`, fetch the profile:

```bash
gh api users/<login> --jq '{bio, name, blog, company, public_repos, followers}'
```

Strong bot indicators:

| Signal | Indicator |
|--------|-----------|
| `bio` | self-identifies as bot, service, automation, or CI |
| `name`, `blog`, `company` | points to a tool, service, or bot documentation |
| `public_repos` and `followers` | both very low for a service-style account |

Outcomes:

- Clearly a bot -> classify as Bot.
- Clearly a human -> classify as Human.
- Ambiguous -> use Tier 2b only if it would change the decision.

## Tier 2b: Activity Fallback

When profile signals are thin, optionally fetch recent public events:

```bash
gh api users/<login>/events/public
```

A monolithic distribution, such as almost entirely `IssueCommentEvent` or
`PullRequestReviewCommentEvent`, suggests automation. A diverse distribution,
such as pushes, PRs, reviews, stars, and forks, suggests a human.

Use this as supporting evidence, not a mechanical rule.

## Tier 3: Ask User

Ask when prior tiers are inconclusive or conflict:

```text
Should I treat @{author} as a bot?

Profile:
- bio: <bio or empty>
- public repos: <n>
- followers: <n>

If yes, I will resolve review threads from this author after replying. If no, I
will leave those threads open for reviewer follow-up.
```

## Conflict Handling

If signals disagree, do not silently pick one. Surface the conflict and ask the
user. Examples:

- `__typename == "User"` but profile self-identifies as a bot.
- Profile looks human but recent activity is purely automated comments.
- Organization-owned service account with no clear profile metadata.

Do not keep a hardcoded list of known bot names. The classification should be
based on the current GitHub metadata and the user's decision when needed.
