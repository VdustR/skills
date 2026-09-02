# Attachments

## Route by file and CLI capability

GitHub CLI v2.99.0 introduced a supported `--attach` path for images and videos.
Other files still require GitHub's web upload flow or a link-based fallback.

| File and target | Path | Needs |
|---|---|---|
| Supported media in an issue, PR, or comment | `gh ... --attach` | GitHub CLI v2.99.0+, repository write access |
| Supported media in a README or discussion | Standalone legacy upload, then embed the returned URL | A bearer token, repository write access |
| Everything else | GitHub's own web upload flow | A logged-in browser session |

GitHub Enterprise Server does not support `--attach` in this release. Check
`gh version`, the target host, authentication, repository write access, file
type, and size before the write. Keep a release asset plus a plain link as the
unattended fallback for unsupported files or hosts.

## Media: use `gh --attach`

```bash
gh issue comment 42 --repo owner/name \
  --body 'Visual verification:' \
  --attach './out/demo.mp4'

gh pr create --repo owner/name --title 'Fix login state' \
  --body-file ./pr-body.md \
  --attach './out/before.png#Before: empty error area' \
  --attach './out/after.png#After: validation message is visible'
```

The flag is repeatable, with up to 50 files per command. If the body already
references an attached local path, such as `![Login error](./out/login.png)`,
GitHub CLI rewrites that reference in place and preserves the body's alt text.
An attached file not referenced in the body is appended. Image alt text can also
follow `#` in the flag value; video has no alt text.

Supported commands are `gh issue create`, `gh issue edit`, `gh issue comment`,
`gh pr create`, `gh pr edit`, and `gh pr comment`. Uploads use the OAuth token
from `gh auth login` or a classic personal access token and require write access
to the target repository.

Partial failure is consequential: when some attachments upload and others fail,
GitHub CLI still performs the issue, pull request, or comment write with the
successful uploads, prints the resulting URL, and exits non-zero. Read the
created or edited content back before deciding whether to retry. Do not repeat
the whole command blindly.

### Supported media is exactly eight types

| Accepted | Rejected with 422 |
|---|---|
| `image/png` | `image/avif`, `image/apng` |
| `image/jpeg` | `video/x-m4v` |
| `image/gif` | `audio/mpeg`, `audio/wav` |
| `image/webp` | `application/pdf`, `application/zip` |
| `image/svg+xml` | `application/octet-stream` |
| `video/mp4` | `text/plain`, `text/markdown`, `text/csv` |
| `video/webm` | `application/json` |
| `video/quicktime` | |

The supported CLI path rejects other types. Do not infer support from the web
interface's broader attachment list.

Size ceilings are GitHub's documented attachment limits: 10 MB for images and
GIFs, 10 MB for video on a free plan and 100 MB on a paid plan.

### Standalone or old-CLI fallback

The supported commands cannot upload media directly for a README or discussion.
The standalone bearer-token endpoint also remains the fallback when `gh` is
older than v2.99.0 and neither a temporary current CLI nor an approved toolchain
update is available. It is undocumented and unversioned; use it only for the
same eight media types and do not promise continued availability.

```bash
PATH_TO_FILE=out/demo.mp4
NAME=$(basename "$PATH_TO_FILE")
MIME=video/mp4
REPO=owner/name
GITHUB_UPLOAD_TOKEN=$(gh auth token)
{
  printf 'header = "Authorization: Bearer %s"\n' "$GITHUB_UPLOAD_TOKEN"
} | curl --config - -sS -X POST \
  "https://uploads.github.com/user-attachments/assets?name=$NAME&content_type=$MIME&repository_id=$(gh api "repos/$REPO" --jq .id)" \
  -H "Accept: application/json" \
  --data-binary "@$PATH_TO_FILE"
unset GITHUB_UPLOAD_TOKEN
# 201 {"url":"https://github.com/user-attachments/assets/<uuid>"}
```

The endpoint rejects a filename containing a slash and validates the extension
against the declared content type. Passing the authorization header through
curl's standard-input config keeps the token out of process arguments. Embed
the returned URL in the intended README or discussion only after confirming the
target and content.

## Non-media: drive a logged-in page

PDFs, archives, logs, and text files land in a different store with a different
URL shape, `https://github.com/user-attachments/files/<id>/<name>`, and there is
no token route to it.

The reliable seam is a synthesized `paste` carrying a real `File` on the comment
textarea, letting GitHub's own editor run its upload. Run it in the page context
of an open issue or PR through a browser automation tool, Playwright on a
logged-in profile, or the devtools console.

```js
const editor = document.querySelector('textarea[placeholder*="Markdown"]');
const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
const dt = new DataTransfer();
dt.items.add(new File([bytes], name, type ? { type } : {}));
editor.focus();
editor.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
// poll editor.value for a [name](https://github.com/user-attachments/files/…) link,
// or for a "Failed to upload" HTML comment
```

Two things that will bite:

- **Declare the type a real browser would report for that filename.** A `.log`
  declared as `text/plain` is refused; the same bytes with an **empty** type
  succeed, because that is what Chrome reports for an extension the OS mime map
  does not know. Pass the `type` option only when it is non-empty.
- **GitHub's comment box has no `input[type=file]` in the DOM.** It is created on
  demand, so tools that upload by targeting a file input find nothing. The paste
  event works where the file-input approach cannot.

Verified through this path: `application/pdf`, `application/zip`, `text/plain`,
and an extensionless-mime `.log`.

### Why a token cannot do it

Instrumenting `fetch` during a real upload shows three steps:

1. `POST github.com/upload/policies/assets` with multipart `repository_id`,
   `name`, `size`, `content_type`. Headers include `github-verified-fetch: true`
   and a per-page-load `x-fetch-nonce`. Returns the S3 policy and a numeric id.
2. `POST objects-origin.githubusercontent.com/github-production-repository-file-…`
   with the policy fields from step 1 plus `file`.
3. `PUT /upload/repository-files/<id>` with `authenticity_token`.

The nonce in step 1 is issued to a page load, which is the point of it. A sibling
endpoint at `uploads.github.com/user-attachments/files` does exist and does
validate `size`, but returned 404 for every content type tried, with and without
those headers spoofed.

For unattended work that must deliver a non-media file, stop here and use a
release asset (`gh release upload`, any type) or a repo blob plus a link. It will
not preview, and it needs no session.

## Visibility

Treat an uploaded attachment as published to the audience that can read the
owning repository. The final access model depends on repository visibility and
whether posted content references the asset; do not infer it from the
`user-attachments` URL alone.

- A referenced `/assets/` URL attributed to a public repository returned 200
  without authentication. The same URL also returned 200 with a bearer token.
- A referenced `/assets/` URL attributed to a private repository returned 404
  without authentication and 200 with a token that could read the repository.
- An unreferenced `/assets/` URL attributed to a public repository returned 404
  without authentication and 200 with a token that could read the repository.
- GitHub renders authenticated images through short-lived
  `private-user-images.githubusercontent.com` URLs carrying signed parameters.
- A `/files/` URL returns 404 while it is still an unposted draft, and becomes
  publicly downloadable once posted content references it.

These are observed cases, not a documented stability contract. An upload has no
documented deletion path, and a later reference or visibility change can expand
access. Confirm the artifact contains no secret or unintended data before
uploading it, regardless of when the surrounding issue or comment is posted.

## Legacy `repository_id` is attribution, not a fence

For the undocumented legacy endpoint, an asset uploaded against one repository
can render in another repository's Markdown context. This does not relax the
supported CLI path's requirement for write access to the target repository.
