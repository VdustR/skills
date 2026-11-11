# Audience Content Walkthrough Evidence

## Method and limits

On 2026-11-11 (Asia/Taipei), the maintainer performed two manual decision
walkthroughs against [the requests and rubric](vp-clear-writing-audience.md).
The first uses the ten requests as written. The second changes the audience,
subject, or reuse context as recorded below. The selected text and the reason
for including or omitting information are recorded separately.

This is a repeated manual walkthrough by the author of the change, not an
independent agent trial, an automated writing test, or a measured improvement
in model behavior. The maintainer saw the rubric. Neither pass ran any action
described in a scenario: no message, API request, invoice, account operation,
or publication. Only repository documentation and local task notes were written;
no credential-bearing trial agent or fixture repository was launched.

Baseline inspected: `f4dab03207e024531901a4c8ab22ce6b3d384e5e`,
`skills/vp-clear-writing/SKILL.md`. Its audience and drafting-history rules
already support several correct outcomes. Its broad prohibition on inventing
facts and instruction to label illustrative examples could also produce labels
instead of sample values or repeat disclaimers throughout an example. No
executed baseline failure is claimed. The change clarifies these decisions;
these walkthroughs cannot prove it will prevent future failures.

## Pass 1: Original requests

In the tables, **Selection** assesses audience, purpose, and placement, while
**Output** assesses the actual wording, facts, scope, and requested format.
Both judgments are manual. A passing output alone does not establish that a
future agent will consult or apply the new rule.

| Case | Selected output | Selection and placement evidence | Selection | Output |
| --- | --- | --- | --- | --- |
| 1 | 「這個星期日下午 2–4 點，帶最多三本書來社區活動室交換吧。一起找本想讀的書，也認識附近的鄰居。」 | Guests receive event facts and warm language; tone instructions and omitted contact data are not announced. | Pass | Pass |
| 2 | “Keep the invitation warm. Avoid sales language. Leave out the organizer's phone number.” | The editor must apply these requirements, so they become checklist content. | Pass | Pass |
| 3 | “Example customer data:” followed by `{"name":"Mira Chen","email":"mira@example.com"}` | Context labels the example once; fictional values are within the brief and no execution is claimed. | Pass | Pass |
| 4 | `{"name":"<CUSTOMER_NAME>","email":"<CUSTOMER_EMAIL>"}` followed by “Replace both placeholders with your customer's values.” | The reader supplies actual values; replacing the markers would defeat the template's purpose. | Pass | Pass |
| 5 | Banner: “Practice mode. No invoice will be sent.” Button: “Practice sending an invoice”. | The limitation affects the action users are about to take; the prototype's production history adds no help. | Pass | Pass |
| 6 | “The local simulation displayed a confirmation after the click. No invoice was sent; live delivery has not been tested.” | Scope and limits qualify the verification result in the report itself. | Pass | Pass |
| 7 | “Mira: Could I choose a Saturday delivery?” / “Leo: Of course. Which time slot works for you?” | The existing heading supplies fictional context; names and friendly dialogue satisfy the production brief without quoting it. | Pass | Pass |
| 8 | “No real customer statement was supplied. The example conversation cannot serve as a customer testimonial; provide an approved quote or use clearly illustrative copy.” | Fictional scope cannot supply endorsement evidence for a page claiming an actual experience. | Pass | Pass |
| 9 | “Exports now include a date column. Tested with CSV files; spreadsheet-format exports remain untested.” | Result and material limit stay together; no sentence announces the editing work. | Pass | Pass |
| 10 | “A winding path threads between raised garden beds. Illustration: Rowan Vale” | The requested attribution remains exact; drafting notes do not become caption text. | Pass | Pass |

## Pass 2: Changed subjects and destinations

Each row supplies the change to the original request and records the resulting
decision. This pass checks whether selection follows purpose rather than a
memorized word or format. All changed situations remain fictional.

| Case | Changed request and selected output | Selection and placement evidence | Selection | Output |
| --- | --- | --- | --- | --- |
| 1 | The invitation is now for a Saturday seed swap, 10 a.m.–noon, same room, up to two packets; omit a home address. Output: 「星期六上午 10 點到中午，帶最多兩包種子來社區活動室交換吧。一起分享想種的花草。」 | The new location, time, and quantity replace the old facts; omitting a private detail does not require a disclaimer. | Pass | Pass |
| 2 | Produce a brief for the editor of that seed-swap invitation. Output: “Use a warm tone, avoid sales language, and omit the organizer's home address.” | The same restrictions belong in a brief addressed to their implementer. | Pass | Pass |
| 3 | Use an invented display name and email in a welcome-email mockup already headed “Sample email”. Output: “To: Noor Patel <noor@example.com>” / “Welcome, Noor.” | The surrounding sample context is enough; each field need not repeat it. | Pass | Pass |
| 4 | The welcome email is now a reusable template with `<NAME>` and `<EMAIL>`. Output: “To: <EMAIL>” / “Welcome, <NAME>.” / “Replace the placeholders before sending.” | Template instructions require actual substitution, so markers remain. | Pass | Pass |
| 5 | A practice transfer screen moves no money. Output: “Practice mode. No money will move.” / “Practice a transfer”. | A visible limitation protects the user's understanding of the action; it is not production clutter. | Pass | Pass |
| 6 | Write acceptance evidence for that transfer simulation. Output: “The simulation displayed a confirmation. No money moved; live transfers remain untested.” | The report cannot imply financial execution from a simulated screen. | Pass | Pass |
| 7 | Reuse the original dialogue alone on a slide, without its heading; supply any context needed. Output begins “Example conversation:” before the two lines. | Removing the surrounding context changes the placement decision; the excerpt carries its status with it. | Pass | Pass |
| 8 | Turn the fictional exchange into a case-study claim that delivery satisfaction improved by 30%; no study exists. Output: “The supplied dialogue does not establish a measured improvement. Provide supporting results or keep the exchange explicitly illustrative.” | Authorized invention of dialogue does not authorize invented metrics or evidence. | Pass | Pass |
| 9 | The date column is proposed, and no tests have run. Output: “The proposal would add a date column to exports. It has not been implemented or tested.” | The changed evidence changes the claim, while instructions to shorten the prose remain implicit. | Pass | Pass |
| 10 | The attribution must appear in the handout footer, not the caption. Caption: “A winding path threads between raised garden beds.” Footer: “Illustration: Rowan Vale”. | Required attribution is preserved at the specified destination; no universal placement rule is imposed. | Pass | Pass |

## Acceptance and remaining limits

Both manual passes preserved the intended distinctions. Cases 1/2, 3/4, and
7/8 require different outcomes from related inputs; cases 5, 6, 9, and 10 protect
meaningful disclosures from blanket removal. The excerpt variation checks that
context is not assumed to travel with copied content.

No instruction edits were needed after these passes. The remaining uncertainty
is how independently running agents will select and apply the guidance across
models and tasks. Static repository checks validate structure and parser
compatibility; they do not close that behavioral evidence gap.

## Static verification

`npm ci --ignore-scripts` and `npm run validate` passed: repository checks
validated 32 skills, 18 smoke fixtures, the existing executable suites, and
parser compatibility with `skills@1.5.3`. All 32 skill frontmatters and agent
metadata files also parsed as YAML; the skill-creator validator passed for
`vp-clear-writing`. These checks do not execute the prose scenarios above.

## Design reference

[GOV.UK's content design guidance](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/)
supports choosing content amount, format, and placement by user need. It does
not establish the fictional-content rule or this change's effectiveness. The
guidance page was read on 2026-11-11; it exposed no attached discussion section.
