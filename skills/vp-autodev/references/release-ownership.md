# Integration and Release Ownership

The delivery brief classifies, from evidence read in the repository, who owns
integration and how the repository releases. The classification decides where
the release conditions are evaluated and how far repository policy permits
this workflow to proceed. Apply the selected AUTO endpoint as an authorization
ceiling.

## The release conditions

These apply in every cell of the classification below. Ask before a release
that has:

- material operational impact;
- ambiguous versioning or release policy;
- incomplete verification;
- scope beyond the requested change.

They never collapse into the merge decision. When a merge is itself the
release, they are evaluated before that merge.

## Who owns integration

| Owner | Evidence | Terminal state for this workflow |
|-------|----------|----------------------------------|
| The user | The user can merge in this repository and repository policy lets this change merge without another party's decision | Through the selected endpoint as the mechanism below permits |
| Another team in the organization | Code owners, branch protection, or documented policy route the merge decision to a group the user is not in | A Ready PR with reviewers requested and feedback handled; never a merge |
| An upstream maintainer | The repository belongs to a party outside the user's organization, or contribution rules say maintainers merge | A Ready PR with reviewers requested and feedback handled; never a merge |

Read the evidence: branch protection and rulesets, code-owner files,
contribution guides, and the repository's own instructions. A push permission
alone does not make the user the integration owner when policy routes the
decision elsewhere.

## How the repository releases

| Mechanism | Evidence | Where the release conditions are evaluated | Complete when |
|-----------|----------|---------------------------------------------|---------------|
| A merge that itself deploys to production for the touched paths | A deploy workflow triggers on push or merge to the base branch, and its path filters (or lack of them) cover the touched paths | Before that merge, because the merge is the release | The deploy workflow finished successfully and the published result was verified |
| A shared batch, such as a release PR that carries other contributors' work | A branch or PR that accumulates merged changes and is released as one | The user's change is done when merged to base and present on the batch; releasing the batch is a separate decision that needs the other contributors' acknowledgement unless repository policy says otherwise | The change is on the batch; the batch release is reported as its own decision with its owner |
| A versioned release step, such as a bump PR, a tag, or a publish job | A documented release procedure that runs after merge and produces a version | At that step, under the same conditions | The version is published and verified, or the reason no version is needed is recorded |
| A party that is not the user | Release is run by another team, a release manager, or upstream | Not by this workflow; report the merged state and who releases | The change is merged (or Ready, per the owner table) and the release owner is named in the report |

Read the deploy workflows' triggers and path filters for the touched paths
rather than assuming. A workflow that deploys on every push to the base
branch makes every merge a production release for the paths it covers, and a
path filter can exclude the touched paths even when the workflow exists.

## Combining the two

Fill both rows in the delivery brief. The owner row sets the furthest state
this workflow may reach; the mechanism row sets where the release conditions
are checked and what counts as complete. Examples:

- Owner: the user. Mechanism: merge deploys production. Evaluate the release
  conditions before merging; after merging, wait for the deploy workflow to
  finish and verify the result before reporting completion.
- Owner: the user. Mechanism: shared batch. Merge to base when the integrate
  phase permits; report the change as on the batch; treat the batch release
  as a separate decision owned as repository policy says.
- Owner: another team. Mechanism: any. Stop at a Ready PR with reviewers
  requested and feedback handled, and report who merges and who releases.
- Owner: the user. Mechanism: versioned step. Merge, then run the versioned
  step under the release conditions, and verify the published version.
