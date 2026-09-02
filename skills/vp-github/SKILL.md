---
name: vp-github
description: >-
  Work with GitHub platform behavior that is not a Git operation: attaching
  images, videos, or files to issues, pull requests, and comments; controlling
  how Markdown renders on GitHub surfaces; and choosing a credential that can
  reach the endpoint. Use for any request to upload, attach, embed, or show a
  local artifact on GitHub. Also use proactively when writing or editing GitHub
  content and an available screenshot, recording, diagram, or other local file
  would provide material evidence, even when the user did not say "upload."
  Boundary: use vp-git for local Git work, vp-stacked-pr for stacks, and the
  vp-pr-* skills for review workflows.
---

# GitHub Platform Behavior

## Route

- Putting an image, video, or file into an issue, PR, comment, discussion, or
  README: read
  `references/attachments.md`.
- Getting markdown to render the way you intend, especially inline video: read
  `references/markdown-rendering.md`.

Media upload through the supported path needs an authenticated GitHub CLI
v2.99.0 or later. Non-media attachment upload also needs a browser signed in to
GitHub and a way to run scripts in its page context. Confirm what the chosen path
needs before promising the result, and never treat choosing the upload method as
authorization to publish.

## Start from the credential

What you can reach depends on which credential you hold, and the difference is
not obvious from the error message.

| Credential | Reaches |
|---|---|
| GitHub CLI OAuth token, classic PAT | REST and GraphQL, plus `gh --attach` media upload |
| A workflow's built-in `GITHUB_TOKEN` | REST and GraphQL for its own repository; media upload is unverified |
| A logged-in browser session | Everything above, plus web-only flows gated on a per-page nonce |

Some GitHub endpoints are deliberately reachable only from a real page load. They
require a `github-verified-fetch: true` header and an `x-fetch-nonce` issued to
that page, so no token substitutes for a session. Non-media attachment upload is
one of them. When an endpoint refuses a valid token, check for that gate before
assuming a permissions problem.

## Test rendering without posting

`POST /markdown` renders arbitrary markdown in a repository's context and returns
the HTML. Use it to confirm what a surface will do before creating an issue or a
comment.

```bash
gh api -X POST /markdown -f mode=gfm -f context=<owner>/<repo> --field text=@draft.md \
  | grep -oE '<(video|img|a)[^>]*'
```

To check what an existing issue or comment actually produced, ask for the rendered
body instead of guessing from the source:

```bash
gh api repos/<owner>/<repo>/issues/<n> -H "Accept: application/vnd.github.html+json" --jq '.body_html'
```

## Prefer the supported media path

For a local image or video bound for an issue, pull request, or comment, use the
repeatable `--attach` flag on `gh issue create`, `gh issue edit`,
`gh issue comment`, `gh pr create`, `gh pr edit`, or `gh pr comment`. Read
`references/attachments.md` for version, permissions, partial-failure, body
rewrite, and fallback behavior. Do not reconstruct the upload request when the
supported CLI path is available.

## Verify before claiming a limit

GitHub's documented file-type and size lists describe the web interface. Endpoints
enforce their own, narrower rules, and the two disagree. Probe the endpoint with a
throwaway file in a scratch repository rather than reading the docs and asserting
the result. `references/attachments.md` records what the probes returned.

## Related skills

- [`vp-git`](https://github.com/VdustR/skills/tree/main/skills/vp-git) for Git
  changes and ordinary pull-request lifecycle work.
- [`vp-stacked-pr`](https://github.com/VdustR/skills/tree/main/skills/vp-stacked-pr)
  for dependent pull requests or branches.
- [`vp-recording`](https://github.com/VdustR/skills/tree/main/skills/vp-recording)
  when the attachment must first be captured, recorded, or rendered.
- [`vp-pr-comment-resolver`](https://github.com/VdustR/skills/tree/main/skills/vp-pr-comment-resolver)
  for author-side PR discussion and review threads.
