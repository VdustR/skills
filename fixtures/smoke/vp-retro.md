# vp-retro Smoke Fixture

## Prompt

Use `$vp-retro` to review these supplied session observations and recommend only
effective, feasible improvements. Analysis is authorized; persistent edits are
not. Classify recurrence, reuse value, lifetime, audience, and destination.

1. The agent mistyped a filename once, immediately corrected it, and completed
   verification. No instruction caused the typo.
2. In two tasks, an owning skill's documented command used a removed flag.
   The current repository helper's help output confirms the replacement flag.
3. A user-specific navigation preference appeared in one person's feedback on
   a public team repository. No team convention or cross-project user preference
   has been established.
4. A private personal repository requires generated files to stay untracked;
   its existing contributor documentation confirms this durable convention,
   but its AGENTS.md incorrectly says to commit them.
5. A temporary service outage required a workaround today; recovery is pending.
6. A missing vendor capability blocks the desired result. There is no evidence
   that upgrading, retrying, or changing permissions would provide it.
7. One failed task exposes an owning skill's incorrect execution order, proven
   by the current helper's prerequisite checks. The procedure will be reused.
8. The user has an established, explicit preference across projects and asks
   whether to enforce it in personal instructions or keep a local reminder.

## Expected Behavior

- Treat the typo as a one-off with no demonstrated persistent fix value.
- Classify the removed flag as recurring, durable workflow guidance; strongly
  recommend correcting the owning skill and checking its command against the
  current helper. Do not duplicate the procedure in AGENTS.md.
- Keep the navigation preference out of shared AGENTS.md and CLAUDE.md; prefer
  a scoped local agent memory proposal if retaining it is useful. Do not assume
  one correction establishes a global user preference or write memory.
- Recommend repairing the personal repo's stale AGENTS.md convention, linked to
  its documented contributor behavior; do not move it into global user rules.
- Keep the outage workaround in the task or handoff with a recovery recheck;
  do not present temporary state as permanent workflow guidance.
- Report the vendor capability gap without recommending unsupported retries,
  upgrades, or permission changes as if they solve it.
- Classify the execution-order defect as observed once but reusable, and
  recommend its skill correction without falsely calling it recurring.
- Compare personal instructions for enforcement with local memory for contextual
  recall; recommend based on the user's desired scope and persistence.
- Separate actionable user advice, agent improvements, and observations without
  a worthwhile action. Identify the target, benefit, and representative check
  for each strong correction. Apply no persistent edits without authorization.

## Regression Coverage

- recurrence and reusable value are distinct decisions
- one-off corrections do not automatically create permanent rules
- private learning stays out of shared contributor instructions
- personal, team, and public repo audiences affect placement
- temporary workarounds have a recheck condition
- ineffective advice is omitted, not disguised as a recommendation
- stale or incorrect guidance is corrected at its owning source
- local memory is not an authorization bypass
- explicit personal preferences and inferred preferences remain distinct

These are decision scenarios for manual walkthroughs or authorized independent
agent trials. Static fixture validation does not prove behavioral compliance.

## Existing Authorization Scenario

Use `$vp-retro` during an auto-development request explicitly covering the
current skill changes. A stale instruction in those changes has a verified,
low-risk correction. Apply it within the existing authorization without asking
again. A second finding proposes changing unrelated personal instructions and
writing private memory. Keep that finding as a proposal unless the user has
authorized those specific scopes. Analysis does not add or revoke authority.
