# Astro and Starlight Decision Walkthroughs

Reviewed on 2026-11-12 against the Astro and Starlight cases in
[the stack-selection fixture](vp-stack-selection.md). This is a repeated manual
walkthrough by the author, not an independent agent trial or a framework build.
No fixture repository, credentials, installed packages, or external write targets
were used by the walkthroughs. Repository validation is a separate executable
check and does not prove an agent will follow the guidance.

## Baseline gap

The previous web guide preferred Astro for content/marketing and Starlight for
"Documentation," without distinguishing a document artifact from a website.
It could therefore miss an unlabeled static event site, prescribe a site for a
PDF handbook, or assume the docs default covers wiki permissions and release
versioning. The generic instruction to check fit could yield the right answer,
but did not supply those specific decision boundaries.

## Repeated walkthrough

Round 1 followed each request from the entrypoint through the web guide to the
candidate. Round 2 revisited each request from its fixed delivery, state, or
hosting contract and checked the owning rule before selecting a candidate.
Outcome means a fitting candidate or an explicitly unresolved contract conflict.
Mechanism means the decision used the required boundary in the fixture, rather
than reaching the same candidate through an unrelated preference.

| Scenario | Round 1 outcome / mechanism | Round 2 outcome / mechanism | Decisive boundary |
| --- | --- | --- | --- |
| Static event site | Pass / Pass | Pass / Pass | Explicit default for new static sites |
| Marketing calculator and form | Pass / Pass | Pass / Pass | Bounded island plus endpoint verification |
| Support knowledge base | Pass / Pass | Pass / Pass | Documentation reading workflow beyond developer docs |
| Marketing plus docs | Pass / Pass | Pass / Pass | Astro pages alongside Starlight docs routes |
| PDF handbook | Pass / Pass | Pass / Pass | Requested artifact precedes website defaults |
| Private collaborative wiki | Pass / Pass | Pass / Pass | Editorial workflow and permissions require another verified owner |
| Static-hosted offline editor | Pass / Pass | Pass / Pass | Client state and offline behavior precede hosting label |
| Versioned docs | Pass / Pass | Pass / Pass | Verify versioning separately from localization |
| Existing Next.js page fix | Pass / Pass | Pass / Pass | Scoped work preserves a supported stack |
| Static host plus server rendering | Pass / Pass | Pass / Pass | Runtime conflict requires a supported host or revised delivery |
| Search-hidden private page | Pass / Pass | Pass / Pass | Search exclusion supplies no access control |

Both passes found the outcome and mechanism stated consistently in the revised
guidance. The site/app branches in the web diagram must be read by primary
purpose; the reference explicitly prevents treating static deployment as proof
of content-first interaction.

## Evidence limits

The linked official documentation supports the framework capabilities. The
walkthroughs establish internal consistency and coverage of the named decisions.
They do not measure agent compliance, production accessibility, performance,
CMS integrations, plugin compatibility, or deployment behavior. Those remain
project-specific adoption checks in the reference.
