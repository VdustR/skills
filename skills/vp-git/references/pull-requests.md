# Pull Requests

## Prepare

Before creating a PR, verify the branch is not the default branch, inspect the
complete diff and commit history, run proportionate checks, and follow the
repository template. Create a draft first when PR-stage work is requested.

Follow the user's requested structure and the repository's pull request
template. Apply `vp-clear-writing` to the title and description. Use
`vp-design-reasoning` when the change needs a model of behavior, a design
trade-off, or a decision flow; share the same evidence rather than restarting
research. For a requested summary, follow the summary reference in
`vp-clear-writing` without expanding the edit to the surrounding body.

## Make the change readable

Write for a reviewer who has not read the conversation. Lead with the concrete
problem and resulting behavior. Include a trigger and before/after example
when they clarify the effect. Keep relevant verification and material risks,
migrations, or unresolved limits in the body, within the repository template.
Name where reviewer attention is needed when there is a specific decision or
risk. Do not hide approval-critical information behind a link or collapsed
section. Put approval-critical risks before a large diagram, screenshot, or
other visual that would push them below it. Check the saved page's reading
order at the destination; being present in the body is not enough if the
reviewer must scroll past a tall visual to discover the risk.

Select supporting detail by the question it answers:

- Use a decision tree when reviewers need to see which behavior applies under
  different conditions, including the relevant fallback or failure path.
- Use a sequence or flow diagram when timing, ownership, or handoffs explain
  the change. Use a comparison table when reviewers need to compare options or
  before/after cases across the same attributes.
- Keep a small change in prose when a visual adds no information. Do not add
  a diagram, HTML artifact, or fixed section count to every PR.

Route media publication and rendering through `vp-github`. Link existing
maintained documents with a label that explains their purpose; they stay
authoritative. Do not create an issue to hold PR detail. Long supporting detail
can go in an optional `<details>` section or an authorized committed document;
keep publication within the authorized audience and scope.

State what each evidence item establishes, its relevant revision/version, and
what remains unverified. Avoid duplicate documents and pasted logs, commit
lists, or large metric tables. Verify the saved body, links, and destination
rendering before claiming the reading experience works. `/markdown` can check
HTML structure but does not prove Mermaid rendering or interactive behavior.
Read the description once without opening its supporting links: the reviewer
should still understand the problem, result, verification limits, and material
risks. This is a manual reading check, not measured reviewer usability.

The information hierarchy follows
[GitHub's guidance for helping reviewers](https://docs.github.com/en/pull-requests/concepts/helping-others-review-your-changes).
The choice of supporting representation is a design decision, not a requirement
to use every available format.

## Review

Record the current head commit when evaluating automated review. Inspect checks,
review threads, discussion comments, and reaction-only signals against that
head. A green check or positive emoji can be stale or scoped to an older commit.

Use specialized skills for PR briefing, checklist verification, author-side
comment resolution, and reviewer-side follow-up.

## Ready And Merge

Move out of draft or merge only with explicit authorization and when:

- required checks pass for the current head;
- no material risk or unresolved required feedback remains;
- automated review signals are positive or clearly non-blocking;
- the merge method and post-merge effects are understood.

Before merging, also wait until the checks the repository runs have finished
and passed for the current head, unless repository convention shows a check is
non-blocking. A pending check is not a pass. GitHub auto-merge waits only for
branch-protection requirements, so it merges at once in a repository without
them and cannot stand in for that wait on any check it does not require. Do not
enable auto-merge; merge with an explicit call after the checks and feedback
are re-read on the current head.

After merging, synchronize the local checkout non-destructively and verify the
remote and local state independently.
