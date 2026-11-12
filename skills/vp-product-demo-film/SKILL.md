---
name: vp-product-demo-film
description: >-
  Create story-driven product demo and promotional films that show a user's
  problem, the product in use, and a meaningful outcome. Use for narrative
  software videos, launch films, or turning a feature walkthrough into a story.
  Requires remotion-best-practices for Remotion production.
  Boundary: use vp-recording for capture mechanics and evidence recordings;
  this skill owns story, choreography, and editorial review.
---

# Product Demo Film

Make the product's value understandable through a task the viewer recognizes.
Preserve the requested format, tone, tools, and budget. A mascot, cinematic
camera, or voiceover is optional. Use Remotion for generated animation unless
the user explicitly chooses another renderer; use `vp-recording` for real capture.

## Requirements

Before creating or editing Remotion compositions, require the official
[`remotion-best-practices`](https://github.com/remotion-dev/skills/tree/main/skills/remotion-best-practices)
skill. Check the current agent's available skills and readable installed
`SKILL.md`; an installed Remotion npm package does not satisfy this requirement.
Read that skill and follow its routing to the relevant implementation references.
This skill owns the creative direction; the Remotion skill owns Remotion usage.

If missing, explain the requirement and guide installation from `remotion-dev/skills`
through `vp-skills`. For a personal installation across supported agents:

```bash
npx -y skills@1.5.3 add remotion-dev/skills --skill remotion-best-practices -g --agent '*'
```

Install only within the user's authorized scope. After installation, verify the
source and availability to the current agent, then read `SKILL.md`. If it is
still unavailable, continue story and storyboard work but leave Remotion
implementation pending. Check project packages and render dependencies separately.

## Establish the story before the effects

Identify the audience, their task, what blocks them today, and what changes when
they use the product. Name the outcome the viewer should understand or act on.
Use supplied evidence to establish what the product actually does. Resolve an
unknown that changes the story before producing detailed animation.

Choose whether this is a fictional promotional scenario, a real walkthrough,
or an evidence recording. Keep that distinction in the production brief and
preserve any disclosure needed to avoid misleading viewers. A staged success
does not establish that a real integration, production action, or security
guarantee was verified.

Write a short sequence of causal beats: the user's request, the obstacle,
the product's intervention, and the resulting task outcome. Show the product
where the value happens. If a helper unblocks another app, show the blocked
task and the handoff rather than spending the film on unrelated app chrome.

Produce an inexpensive story cut with rough timing, placeholder art, and
dialogue or captions before detailed effects. Check whether a viewer can tell
who needs this, what changed, and why. Revise a confusing cut before polishing.
Honor an explicitly requested approval gate; otherwise use the agreed brief
to evaluate the cut and continue within the user's authorization.

## Choreograph the task

For each beat, align the dialogue, action, visible state change, reaction, and
camera focus on one timeline. Let an action cause the next response. Give the
viewer time to read a result before cutting away. Use pans, zooms, and character
reactions to direct attention to that cause and effect. Avoid a succession of
text cards when the requested film depends on seeing the product being used.

For example, an invented inventory assistant receives "Find the missing order,"
encounters a workspace choice, selects the authorized workspace, and reveals
the order. The camera follows the choice and result; a character's relief
follows the result. Decorative movement alone does not communicate the change.

Use `vp-recording` for real UI capture, cursor and caption layers, deterministic
renders, encoding, and file inspection. Keep genuine clicks tied to actual
targets. A simulated UI or animated cursor can illustrate a fictional scene,
but cannot stand in as evidence that the real action ran.

Keep production constraints and editorial notes in working documents. Apply
`vp-recording`'s viewer-copy guidance when replacing sensitive content and
deciding which qualifications belong on screen. Keep product and security
claims within the demonstrated mechanism's limits.

## Finish and deliver

Choose music and sound for the intended mood and the user's preferences.
Verify the actual asset's author, source, license, editing and distribution
permissions, commercial-use terms when relevant, and required attribution or
modification notices. Keep license evidence and satisfy its placement terms;
"free" does not establish permission. Balance music against dialogue.

Keep the source, assets that may be retained, cue timeline, render settings,
and commands needed to reproduce the film. Record the renderer and dependency
versions and any live inputs that prevent exact reproduction. Deliver the
verified local video file and its retrieval path with the source location.
Use `vp-recording`'s file checks, then review the whole story for pacing,
readability, sound, claims, and credits. Report what was actually inspected.

An upload is a separate application interaction. Use `vp-interaction-routing`
to verify its destination and resulting state within the existing authorization.
A local-file request ends at local delivery; a draft request does not authorize
sending or publishing.

## Related skills

- [`remotion-best-practices`](https://github.com/remotion-dev/skills/tree/main/skills/remotion-best-practices)
  for required Remotion implementation guidance.
- [`vp-skills`](https://github.com/VdustR/skills/tree/main/skills/vp-skills)
  when the required Remotion skill needs installation or repair.
- [`vp-recording`](https://github.com/VdustR/skills/tree/main/skills/vp-recording)
  for producing and inspecting the footage and encoded file.
- [`vp-interaction-routing`](https://github.com/VdustR/agent-plugin-vp-interaction-routing/tree/main/skills/vp-interaction-routing)
  when delivering the film into an application or service.
