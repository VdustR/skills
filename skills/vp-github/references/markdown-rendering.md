# Markdown Rendering

## Inline video has exactly one source

GitHub's sanitizer keeps `<video>` only when `src` points at a `user-attachments`
asset. Every other host loses the tag entirely.

| Asset location | Markdown | Renders as |
|---|---|---|
| `user-attachments` | `![alt](url)` | `<img>` |
| `user-attachments` | bare URL on its own line | native `<video>` player |
| `user-attachments` | `<video src="url" controls>` | native `<video>` player |
| `user-attachments` | `[label](url)` | native `<video>` player |
| Release asset or `raw.githubusercontent.com` | `![alt](url)` | `<img>` |
| Release asset or `raw.githubusercontent.com` | bare URL | plain link, no player |
| Release asset or `raw.githubusercontent.com` | `<video src="url">` | tag stripped |

Three consequences:

- Committing an MP4 to the repository and linking it produces no player anywhere,
  including a README. Upload it as an attachment instead. See `attachments.md`.
- `<video>` **does** work in `README.md`, not only in issues and comments. The
  widely repeated claim that GitHub strips video from READMEs is out of date for
  attachment URLs.
- A bare attachment URL on its own line is the simplest form and gets the same
  player as the explicit tag. Prefer it.

## Images have fallbacks that need no undocumented endpoint

Both a release asset URL and a `raw.githubusercontent.com` URL render as `<img>`.
Either is a reasonable target for a screenshot when an attachment upload is not
available:

```bash
gh release upload <tag> shot.png
# ![shot](https://github.com/<owner>/<repo>/releases/download/<tag>/shot.png)
```

## Confirm rather than assume

Rendering rules change and differ by surface. Two checks, neither of which
requires posting anything:

```bash
# Render a draft in a repository's context
gh api -X POST /markdown -f mode=gfm -f context=<owner>/<repo> --field text=@draft.md

# Read what an existing issue, comment, or README actually produced
gh api repos/<owner>/<repo>/issues/<n> -H "Accept: application/vnd.github.html+json" --jq '.body_html'
gh api "repos/<owner>/<repo>/readme?ref=<branch>" -H "Accept: application/vnd.github.html"
```

Grep the result for `<video`, `<img`, and `<a ` to see which of the three you got.
A stripped tag leaves no trace in the output, so absence is the signal.
