# vp-minimal-repro Smoke Fixture

## Prompt

Use `$vp-minimal-repro` for each independent situation. Local investigation and
repository evidence notes are authorized; changing live system state, sending
calls, publishing artifacts, and creating scheduled work are not.

1. A native harness recorded the real OS focus event on app departure. The
   record identifies the OS/runtime, configuration, source revision, trace, and
   command. Three application entry points share the same departure handler;
   only their labels changed. The next proposed test repeats every entry point
   against every exit path to reconfirm that event.
2. The same harness emitted a synthetic unlock event. No real lock/unlock or
   lid cycle has been observed. The application responds correctly to the event.
3. A phone's audio API lists and selects a connected Bluetooth route. The user
   wants to know whether call audio is audible through the headset. No listening
   observation exists, and starting a call is outside the authorized scope.
4. A service probe recorded a response under an older API version. The current
   version changed, and fresh output contradicts the saved fixture. The proposed
   shortcut is to keep the fixture and mark the whole journey passed.
5. A transform fails on one small input. A local candidate fix is available and
   can be toggled safely inside the reproduction.
6. An undocumented external operation has no known failure. A small authorized
   probe can answer the question; one result varies with event order. Later
   sessions will need the result, and the repo has an existing testing-notes file.

7. A team proposes a complete streaming UI to learn whether a library emits a
   completion callback before or after resolving its promise. Either order could
   work, but it changes the adapter design. A tiny real-library call is available.
8. The probe's output does not distinguish event ordering because the logger
   buffers timestamps. Another complete UI run is proposed without a new trace.
9. A copy-only typo fix has no material behavior question.

## Expected Behavior

- Reuse the first observation after matching relevant conditions. Verify the
  shared handler and relevant wiring without expanding a redundant cross-product.
  Preserve required acceptance checks and any distinct external conditions.
- Keep real OS event delivery unverified in the second case. Reuse the synthetic
  result only for the application's response; name the remaining physical check.
- Separate route enumeration/selection from audible output. Prepare the smallest
  listening procedure, leave audio unverified, and stop before an unauthorized
  call rather than replaying login or treating route logs as hearing evidence.
- Invalidate the affected service premise and fixture in the fourth case;
  investigate the changed boundary without declaring product acceptance or
  rerunning unrelated stable behavior. Do not schedule a monitor.
- Execute fail, pass with the fix, and fail after reverting the fix in the fifth
  case before making a causal claim. Preserve the existing demonstration and
  de-identification requirements when sharing is later authorized.
- Accept the sixth case without inventing a failure. Preserve event order in a
  discriminating check, record variation and limits, and retain the scoped facts
  in the existing notes with procedure, evidence, environment, observation time,
  relevant revision, reuse conditions, and reasons to recheck. Link those facts
  from the acceptance plan rather than relying on chat history alone.

- For case 7, define the decision, actual library interface, relevant version and
  sequencing, excluded UI scope, distinguishable event trace, conclusion limits,
  and stopping condition before coding the probe. Stop once ordering is known
  for those conditions; keep UI integration acceptance separate.
- For case 8, report the result as inconclusive, identify a sequence counter or
  other discriminating trace, and rerun only that check when authorized. Do not
  treat ambiguous output as confirmation or expand into the complete UI.
- For case 9, skip a separate experiment and use proportionate ordinary checks.

## Regression Coverage

- Unknown external behavior is a valid entry point without an observed failure.
- A real dependency observation differs from a mock, synthetic event, or proxy.
- Evidence reuse depends on matching conditions and explicit invalidation.
- A scoped observation never substitutes for integration or physical acceptance.
- Existing checks remain required; duplicate exploratory runs need a new question.
- Failure reproduction retains the reversible causal check.
- Evidence retention respects authorization and sharing boundaries.

These are scenarios for manual decision walkthroughs or authorized independent
agent trials. Static fixture validation does not prove agent behavior.
