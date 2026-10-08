# Context and Wording Examples

These examples illustrate decisions, not required templates or a phrase blacklist.
Quoted non-English text demonstrates native wording and domain terminology.

## Preserve the verification boundary

Source: a change handles token expiry; auth tests pass; mobile browsers were not
tested.

Weak: "Login is completely fixed. All checks passed."

Clear: "Expired tokens now prompt users to sign in again. Auth tests pass; mobile
browsers have not been tested."

Do not add a performance claim or infer production success from these facts.

## Describe the test environment instead of a local alias

Source: a notification-diagnosis PR calls screenshots "physical-device
screenshots" while naming an `android_lab` emulator. Its evidence notes identify
a Pixel 8 emulator, Android 16 / API 36, and staging; iOS was not tested.

Weak: "Physical-device screenshots — android_lab emulator (Android 16)."

Clear: "Screenshots from a Pixel 8 emulator running Android 16 (API 36), against
staging. iOS has not been tested."

The alias adds no verification scope, while "physical-device" contradicts the
source. If a reproduction procedure needs the exact local target, retain it
there: "On the author's workstation, the emulator is named `android_lab`."
Do not imply physical-device coverage or drop the model and OS with the alias.

## Explain references and session shorthand

Source: issue 42 tracks final notification copy and translations. They must be
ready before enabling the feature in production.

Weak: "Wait for #42, then lift the gate as discussed."

Clear: "Keep the feature disabled in production until the final notification
copy and translations tracked in issue 42 are ready."

In an actual artifact, link "final notification copy and translations" to the
supplied issue URL. Do not invent a URL or assume a number identifies the same
issue across repositories. Explain the dependency rather than making the reader
retrieve the conversation.

Source: the author calls a change "the green path"; it retries a failed push-token
registration. Only the retry test passed.

Weak: "The green path is fixed."

Clear: "The app can now retry a failed push-token registration. The retry test
passes; notification delivery has not been verified."

Replace the improvised label with the behavior and keep the evidence boundary.
If the source omits what the label means, do not guess its expansion.

## Keep customary terms across languages

For a Traditional Chinese software-development audience:

Weak: "請建立拉取請求，並在提交訊息裡說明修復。"

Clear: "請建立 PR，並在 commit message 說明修正原因。"

For a nontechnical audience unfamiliar with PRs:

Clear: "請建立 PR，讓團隊審查這次程式修改。"

The term stays recognizable; the explanation supplies its purpose. Do not
generalize this example into a rule that all terminology must be English.

## Add the missing premise

Source: a login failure occurs only after token expiry. The server rejects the
expired token, but the client keeps retrying with it.

Weak: "Refresh handling is broken."

Clear: "After the token expires, the client retries with the same token. The
server rejects each retry, so the user cannot continue. The client needs to obtain
a new token or ask the user to sign in again."

The explanation is longer because the missing sequence is what makes the issue
understandable. Do not select a remedy the evidence has not established.

## Explain a code constraint

Source: the provider's request signature depends on the original parameter order.

Weak: `// Do not sort the parameters.`

Clear: `// Preserve parameter order because the provider signs the original sequence.`

No status label, TL;DR, or reader action is needed.

## Keep a necessary contrast and uncertainty

Source: validation runs locally but deployment has not been checked.

Clear: "Local validation passed; deployment remains unverified."

Source: stale cached data is a possible cause, not a demonstrated cause.

Clear: "Stale cached data may explain the old value. Compare the cached response
with the current API response before changing the cache policy."

Do not remove the distinction or the hedge to make the writing more forceful.

## Preserve the requested structure

If a PR template has `Problem`, `Changes`, and `Validation`, keep those sections
and improve their contents. If a user requests a detailed explanation, retain
the detail necessary to understand it. Do not add an executive summary, a fixed
number of bullets, or an editing report unless the task calls for one.
