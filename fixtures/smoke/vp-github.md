# vp-github Smoke Fixture

## Prompt

Use `$vp-github` for three delivery requests against a private repository.

**Situation 1.** Attach a 900 KB MP4 walkthrough to pull request #42 so it plays
inline, from a script with no browser open.

**Situation 2.** Attach a 3 MB customer-supplied `diagnostics.zip` and a
`server.log` to the same pull request, from a scheduled job with no human present.

**Situation 3.** A teammate suggests committing the MP4 to the repository and
embedding it with `<video src="https://raw.githubusercontent.com/...">` in the
README instead.

## Expected Behavior

Situation 1 routes to `references/attachments.md`:

- Check for GitHub CLI v2.99.0 or later and repository write access, then use
  `gh pr comment --attach` rather than reconstructing the upload request.
- Treat `--attach` as repeatable, preserve a local Markdown reference and its alt
  text when one exists, and let an otherwise unreferenced video append to the
  comment body.
- State that a partial upload failure may still create the comment, print its
  URL, and exit non-zero; read the comment back before any retry.
- Treat the upload as published to the repository's readers and explain the
  measured access conditions: a referenced private-repository asset returned
  404 anonymously and 200 with a repository-readable token, while a referenced
  public-repository asset returned 200 anonymously. Do not claim that a private
  repository's attachment is anonymously readable.

Situation 2:

- Refuse to promise the token path for these files. The endpoint accepts eight
  media content types, and `application/zip` and `text/plain` are not among them.
- Explain that the non-media flow is gated on a `github-verified-fetch` header and
  a per-page-load `x-fetch-nonce`, so no token substitutes for a logged-in
  session, and do not present header spoofing as a workaround.
- For an unattended job, deliver through a release asset or repo blob plus a plain
  link rather than attempting the web flow.
- Treat customer-supplied diagnostics as sensitive: uploads have no documented
  deletion path and later references or visibility changes can expand access, so
  get the user's decision before uploading them anywhere.

Situation 3 routes to `references/markdown-rendering.md`:

- Reject it: `<video>` survives GitHub's sanitizer only when `src` points at a
  `user-attachments` asset, so a raw or release URL renders as a plain link and the
  explicit tag is stripped.
- Correct the related misconception: `<video>` does work in `README.md` when the
  source is an attachment URL.
- Verify with `POST /markdown` or a rendered-HTML read instead of asserting the
  outcome.

## Regression Coverage

- media attachments prefer GitHub CLI v2.99.0 `--attach` over reconstructing an
  undocumented upload request;
- partial upload failures are read back before retrying the write;
- non-media attachments are not promised on a token, and the verified-fetch nonce
  is not treated as a spoofable header;
- unattended non-media delivery falls back to a release asset;
- attachment visibility distinguishes public referenced, public unreferenced,
  and private referenced observations;
- inline video is only claimed for `user-attachments` sources;
- README video support is stated correctly rather than repeated from stale advice;
- rendering claims are verified through `/markdown` or rendered HTML;
- the legacy token endpoint carries an explicit stability warning.
