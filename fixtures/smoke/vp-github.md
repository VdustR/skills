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

- Upload with one `POST` to `uploads.github.com/user-attachments/assets` carrying
  `name`, `content_type`, and `repository_id`, authorized with a bearer token.
- Keep the bearer token out of process arguments by passing the authorization
  header through curl's standard-input config.
- Embed the returned `user-attachments` URL as a bare URL on its own line.
- Warn that the endpoint is undocumented and unversioned, and name the release
  asset fallback.
- Warn that the attachment is public by URL: an `/assets/` URL is downloadable
  without authentication as soon as it is uploaded, even before the comment is
  posted, so a private repository does not keep it private.

Situation 2:

- Refuse to promise the token path for these files. The endpoint accepts eight
  media content types, and `application/zip` and `text/plain` are not among them.
- Explain that the non-media flow is gated on a `github-verified-fetch` header and
  a per-page-load `x-fetch-nonce`, so no token substitutes for a logged-in
  session, and do not present header spoofing as a workaround.
- For an unattended job, deliver through a release asset or repo blob plus a plain
  link rather than attempting the web flow.
- Treat customer-supplied diagnostics as sensitive: because attachments are public
  by URL, get the user's decision before uploading them anywhere.

Situation 3 routes to `references/markdown-rendering.md`:

- Reject it: `<video>` survives GitHub's sanitizer only when `src` points at a
  `user-attachments` asset, so a raw or release URL renders as a plain link and the
  explicit tag is stripped.
- Correct the related misconception: `<video>` does work in `README.md` when the
  source is an attachment URL.
- Verify with `POST /markdown` or a rendered-HTML read instead of asserting the
  outcome.

## Regression Coverage

- media attachments use the token endpoint and a bare URL on its own line;
- bearer tokens are not expanded into curl process arguments;
- non-media attachments are not promised on a token, and the verified-fetch nonce
  is not treated as a spoofable header;
- unattended non-media delivery falls back to a release asset;
- attachments are flagged as public by URL before sensitive files are uploaded;
- inline video is only claimed for `user-attachments` sources;
- README video support is stated correctly rather than repeated from stale advice;
- rendering claims are verified through `/markdown` or rendered HTML;
- the undocumented endpoints carry an explicit stability warning.
