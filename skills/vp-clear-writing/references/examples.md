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
