# Attachments

GitHub has no documented attachment API. Two undocumented paths exist, split by
file type, and the split is forced rather than a preference.

| File type | Path | Needs |
|---|---|---|
| 8 media types below | `uploads.github.com/user-attachments/assets` | A bearer token |
| Everything else | GitHub's own web upload flow | A logged-in browser session |

Both are undocumented and unversioned. Do not build anything on them that cannot
fall back to a release asset plus a plain link.

## Media: one request with a token

```bash
PATH_TO_FILE=out/demo.mp4
NAME=$(basename "$PATH_TO_FILE")   # the endpoint rejects a name containing a slash
MIME=video/mp4
REPO=owner/name
curl -sS -X POST \
  "https://uploads.github.com/user-attachments/assets?name=$NAME&content_type=$MIME&repository_id=$(gh api "repos/$REPO" --jq .id)" \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "Accept: application/json" \
  --data-binary "@$PATH_TO_FILE"
# 201 {"url":"https://github.com/user-attachments/assets/<uuid>"}
```

That URL is identical to what drag-and-drop produces, so every GitHub surface
renders it natively. The whole exchange is one HTTP request, so it runs from a
script, a cron job, or a container.

### The whitelist is exactly eight types

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

The endpoint also validates the filename extension against the declared content
type. A `.png` name with `image/jpeg` is refused as an extension mismatch.

Size ceilings are GitHub's documented attachment limits: 10 MB for images and
GIFs, 10 MB for video on a free plan and 100 MB on a paid plan.

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

Treat an uploaded attachment as published.

- An `/assets/` URL is downloadable without authentication as soon as it is
  uploaded, even before the comment is posted. Fetching it returns a 302 to a
  signed S3 object, then the bytes. The rendered page uses short-lived
  `private-user-images.githubusercontent.com` links, which hides this.
- A `/files/` URL returns 404 while it is still an unposted draft, and becomes
  publicly downloadable once posted content references it.

## repository_id is attribution, not a fence

An asset uploaded against one repository renders in another repository's markdown
context. Upload once against any repository you can read, then embed anywhere you
can write.
