# Keycast

Use a keycast when a shortcut, modifier, or typed input is essential to
understanding the result. It reports input; it is not narration.

## What to show

- Show shortcuts as normalized keycaps, such as `Command` + `K` or `Shift` +
  `Enter`.
- For ordinary typing, prefer a compact summary such as `Typed: quarterly
  report` instead of flashing every character.
- Never display passwords, tokens, one-time codes, payment data, or input from a
  field whose sensitivity is uncertain. Suppress the entire event before it
  reaches the overlay or event log; visual masking alone still leaves sensitive
  text in intermediate artifacts.
- Coalesce auto-repeat and consecutive printable characters. Keep a shortcut on
  screen for about 0.9-1.4 seconds and replace, rather than stack, stale input.

## Browser recording

Listen to captured `keydown`, `beforeinput`, and `input` events in an injected
overlay with `pointer-events: none`. Build shortcut labels from the event's
modifier flags and `key`; build typed summaries from the value intentionally sent
by the recording script. Do not infer final text from every raw key event because
IME composition and dead keys do not map one-to-one to characters.

The recording script already knows when it calls `page.keyboard.press()` or
`page.keyboard.type()`. Send the intended, non-sensitive display label to the
overlay at that same point. This is more reliable than a system-wide key logger
and keeps the shown input scoped to the recorded page.

## Native recording

Prefer a keycast feature provided by the input or recording tool when it is
scoped to the target app and can suppress sensitive fields. Otherwise, create a
sidecar event log from the automation commands and composite those known events
in post. Do not install or start a global keyboard monitor merely to decorate a
recording.

Verify that every shown shortcut matches the action timestamp and that no
sensitive input appears in the video, sidecar, temporary frames, or logs.
