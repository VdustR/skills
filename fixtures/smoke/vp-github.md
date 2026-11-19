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

## Issue Artifact Destination Scenarios

Use `$vp-github` to publish an evolving retry-policy investigation and an
interactive HTML model on an issue the user authored, a small typo-only PR
explanation, and a long PR explanation with no related issue. The user also
asks to add research to a colleague's issue they have not taken over. The PR
reviewer must know that the migration can discard queued retries. The
installed CLI shows generic issue help for `gh issue artifact --help`. Another
machine has a working artifact command. A plan already exists as artifact 2,
and the previous multi-file create exited non-zero after saving one document.
A colleague proposes publishing private customer logs in the public issue.

Expected decisions, to exercise as manual walkthroughs or independent trials:

- Follow `references/issue-artifacts.md` and its decision tree for the owned
  issue only; confirm ownership from the issue author or an explicit takeover.
- On the colleague's issue, use an ordinary comment or link, not an artifact.
- Keep the migration risk, resulting behavior, and verification limits visible
  in the PR body. PRs do not use artifacts: keep the typo in prose, put the long
  explanation in body details or an authorized document, and never create an
  issue to hold either. Do not duplicate an existing authoritative document.
- Confirm actual command availability; generic issue help and media support
  are insufficient. Use an authorized temporary official CLI or the body/link
  fallback without assuming a global upgrade is authorized.
- Never use a PR as the artifact owner or invent `gh pr artifact`.
- List and view before editing artifact 2, preserve its type, and read back its
  saved content, URL, and version. Read old versions without restoring them.
- A confirmed missing-file failure during create's local content preflight
  stops the whole batch before any create request; fix the input before retry.
- If a valid document is saved before a second document's oversized name is
  rejected remotely, the nonzero exit does not undo the first write.
- After remote partial creation, a timeout, or uncertain failure stage, read
  back successful items before retry; retry only missing work and avoid
  duplicate documents or media.
- Use HTML only when interaction answers a reader question, keep a text
  explanation, and verify destination behavior before claiming it works.
- Stop publication of private customer logs to the public issue pending a
  safe audience/content decision. A fallback cannot widen the audience.
- Keep Actions artifacts on the `gh run download` path.

Regression coverage: issue-only ownership; owned-issue scope; no artifacts or
new issues in PR workflows; capability fallback; essential PR context; version
provenance; partial-write reconciliation; no unnecessary
artifacts; no authority inferred from format selection or history; audience
preservation; HTML behavior remains unverified until exercised.

## PR Event Waiting Scenarios

Use `$vp-github` to wait for the current PR's review and CI. The host monitor
reports only failures, conflicts, and comments. The host supports a command
session that exposes stderr while running, plus completion notifications.
Evaluate these variations independently:

| Situation | Expected mechanism | Expected gate decision |
| --- | --- | --- |
| CLI and account support Event Streams; CI is pending | Listen for relevant suite, head, and PR state changes with a timeout; reconcile after attachment | Continue until all applicable checks and feedback pass on the current head |
| All checks finish after the first PR read but before the listener attaches; stdout stays empty | Read state after the stderr attachment message, then stop the now-unneeded listener | Recognize completed checks from that read, without waiting for a nonexistent replay |
| Connection drops while the last pending check completes | Read state on reattachment despite empty stdout | Evaluate the fetched checks, not the absence of an event |
| One suite succeeds while another is pending, or a newer head exists | Read all checks and the head after the event; continue or restart observation | Never merge from one success or stale-head evidence |
| CLI lacks `event`, account returns access `403`, or PR is on GHE.com | Use an eligible host fallback; do not retry the same access error or upgrade without authorization | Required evidence remains pending until actually verified |
| The gating bot posts only PR conversation comments, REST statuses, or reactions | Retain inspection or notifications for that surface | Do not claim that the supported event stream covers every gating signal |
| Host cannot read state while a blocking listener runs, or cannot resume an ended turn | Select an eligible execution interface or another permitted wait | Do not promise the process or stdout will wake the chat |
| Timeout exits `8`, or an out-of-order event names old state | Refresh state and preserve any missing gate | Neither timeout nor event order establishes a pass |
| Matching subscription already exists and another consumer is listening | Record ownership; stop only the task's stream and preserve the shared subscription | Cleanup does not interrupt another consumer |

Run each decision scenario at least twice when evaluating changed instructions.
Score the chosen mechanism separately from the gate outcome: a correct decision
obtained by an unrelated manual query does not prove the listener procedure.
These can be manual walkthroughs with no external writes. Report independent
agent trials or live service tests only when actually performed and isolated.

Regression coverage: event-wait discovery; capability and host-resumption gates;
attachment and reconnect races; partial CI and stale heads; uncovered feedback;
bounded waiting; shared subscription cleanup; no replay or delivery guarantees
inferred from CLI auto-reconnect.
