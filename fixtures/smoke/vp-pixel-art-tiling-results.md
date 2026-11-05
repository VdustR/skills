# Pixel tiling probe and review evidence

Observed 2026-11-04 (Asia/Taipei). These are maintainer-run executable checks,
visual self-review, and manual decision walkthroughs, not a blind agent trial.
No source article assets, engine, or third-party cutter were executed.

## Executable experiment

Run `skills/vp-pixel-art/scripts/tiling_probe.py --output <scratch-directory>`
with Python 3. Two fresh output directories produced byte-identical artifacts
and reports. Each run passed 14/14 probe expectations. A true expectation means
the control behaved as intended; it does not mean the artwork passed review.

| Control or invariant | Observed result |
| --- | --- |
| Complete 16-tile native-grid fixture | Accepted against the fixture's known boundary/corner contract |
| All legal ordered tile pairs | 128 horizontal and 128 vertical pairs checked against source samples |
| Known consecutive source samples | Literal sample oracles passed; valid neighboring edge pixels differ |
| Three looping 12x12 maps | Seeds 7, 23, 101 had zero incompatible internal or opposite-boundary joins |
| Wrong edge metadata | Neighbor check rejected it |
| Wrong map wrap | Last-row/first-row mismatch rejected |
| Missing tile | Fixture coverage rejected it |
| Damaged pixels with unchanged metadata | Source-sample pair check rejected it |
| Damaged corner | Corner contract rejected it; mid-edge pair check alone still passed |
| Repeated single tile | Metadata passed despite visible repetition |

Corners use a common constant patch in this diagnostic fixture, which establishes
its technical junction invariant. General four-tile junction artwork was not
exhaustively evaluated; other constructions need their own corner checks.

## Actual visual observations

Inspected the 192x192 seed-7 field at native resolution and the three-panel
nearest-neighbor enlargement, plus the native damaged-corner field.

- The single-tile field repeats an identical tuft arrangement in every cell.
- The Wang field changes the interior arrangements, but straight dark/light
  boundary strips still form a conspicuous square lattice. Visual outcome:
  **revise**, despite passing technical checks.
- The damaged-seam panel adds repeated bright interruptions on tile borders.
- The damaged-corner field has isolated bright points at repeated junctions.
- These are synthetic diagnostic assets, not accepted production grass artwork.
  Neither arbitrary-art seam detection nor Image Quilting quality was tested.

This observation is why the reference makes a repeated-field visual gate
non-compensating and explicitly warns about its probe's uniform edge strips.

## Manual decision walkthroughs

The old entrypoint requested generic seam inspection but did not specify a
pair/source oracle, separate corner coverage, a negative-control procedure, or
a repetition baseline. An agent could still have supplied these from prior
knowledge. The comparison below measures explicit procedural support, not an
observed failure rate of the old instructions.

Walked through each case twice: first from the fixture/control, then from the
requested acceptance decision. Both passes gave the decisions below.

| Ordinary task situation | Mechanism required by the added reference | Acceptance decision |
| --- | --- | --- |
| Same edge labels, one damaged strip | Inspect actual pixels against source samples, beyond metadata | Revise the strip |
| Matching source cut has unequal neighboring edge pixels | Preserve consecutive samples; avoid a universal equality test | Technical seam contract passes; visual gate remains separate |
| Mid-edge strips pass, corner patch is damaged | Check four-tile junction/corner contract independently | Revise the corner |
| Valid Wang placement still shows a square lattice | Compare a repeated field at native and enlarged scale | Visual revise; no ready claim from technical report |
| A looping map fails only across opposite boundaries | Validate actual wrap neighbors | Revise boundary assignment |
| A sprite request has no repeating material | Conditional reference routing | Ordinary pixel workflow; no tileset requirement |

## Reproduction fingerprints

SHA-256 prefixes for the two matching executions:

| Artifact | Prefix |
| --- | --- |
| report.json | 27c0254fff2b5e75 |
| wang-seed-7.png | 8cb2083c5229e6d7 |
| comparison-3x.png | 8d7954821052d0af |

The script regenerates previews into a user-chosen scratch directory. These
checks establish sensitivity for controlled faults and scoped self-observations.
They do not establish improved agent routing in independent execution, human
acceptance, hardware compatibility, or target-engine correctness.

## Repository validation

`npm run validate` passed after the changes: 51 existing executable tests,
34 skills, 17 registered smoke fixtures, and locked `skills@1.5.3` parser
compatibility. The new probe was executed separately twice as described above;
it is not one of those 17 registered fixtures. `git diff --check` passed.
The optional system skill-creator `quick_validate.py` could not start because
its Python environment lacks PyYAML; repository frontmatter/parser checks
passed instead. No dependency was installed for this experiment.

## Material trials and user decisions, 2026-11-05

The subsequent trials constructed actual native-grid grass, stone, sand, and
lava fields. Their raw sources and previews remain local scratch experiments,
not distributed skill assets. The maintained probe above remains a diagnostic
negative example, not the generator for these accepted material candidates.
The skill now records the demonstrated construction decisions without hardcoding
the scratch dependencies or distributing every generated atlas.

| Trial | Observed mechanism and result | Decision boundary |
| --- | --- | --- |
| Grass, 16 native 32x32 tiles | Textured shared samples and varied interiors removed the original flat boundary rails in inspected views | Visual self-review only; no explicit user acceptance recorded |
| Stone, 16 native 64x64 tiles | Shared Voronoi seed geometry preserved outlines where arbitrary patch cuts had broken them | User accepted the stone direction |
| Earlier dense sand | Independently phased wave patches and dense bright grain marks passed technical checks but were later rejected for visual incoherence | Earlier visual pass withdrawn |
| Fine sand, 32 native 64x64 tiles, five colors | Restrained patch contrast and sparse compact grains produced a quiet field that still read as material | User accepted it specifically as a background that does not distract |
| Wind sand, same dimensions/count/palette | Connected ripple phase improved direction continuity, but identifiable groups of short bands remain | Candidate; not user-approved or established as better |
| Dense lava versus sparse cracks | Both had scoped continuity checks; the sparse version changed composition and increased to 512 tiles for additional port states and variants | User accepted both as different styles and did not judge the sparse style better |

No foreground interaction or engine/hardware import was executed. The fine-sand
feedback is a user's background-role judgment from the presented previews,
not a verified gameplay readability result. The 512-tile lava set is an example
of a cost/variation tradeoff, not a recommended default set size.

Artifact SHA-256 prefixes bind these observations to the actual native previews:

| Local experiment artifact name | Prefix |
| --- | --- |
| material-study/stone/23-native.png | 085f87455b4f1889 |
| material-study/lava/7-native.png | c06f710b7dea8d51 |
| lava-rivers/7-native.png | d163dfe4070a1543 |
| sand-study/fine/23-native.png | 4b71aed73b6df9e0 |
| sand-study/fine-vs-wind.png | fef9ce8e43a81050 |

The local lava report passed 14/14 expectations twice. Each local sand direction
passed 13/13 twice, including decoded native PNG/source equality, edge/corner
ownership, negative controls, and looping metadata at seeds 7, 23, and 101.
These numerical checks do not replace the decisions in the table.

### Instruction decision walkthroughs

Maintainer manual walkthroughs, not independent/blinded agent trials. Repeated
in two orders: from the ordinary task to the construction choice, and from the
observed artifact/user decision back to the required evidence and acceptance
state. The old draft already required generic visual review; the missing
mechanism was explicit material/role routing and handling comparative feedback.
An agent could have supplied this from its own knowledge. No causal improvement
rate or unseen baseline-agent failure is claimed.

| Ordinary situation | Mechanism checked in both passes | Outcome checked separately |
| --- | --- | --- |
| Make fine sand behind foreground objects | Select restrained granular construction; inspect role/attention before adding detail | Accepted fine-sand style preserved; actual foreground integration still unverified |
| Sand pixels join but waves change direction | Inspect connected direction/phase, not just edge labels or samples | Reopen visual gate; technical pass stays valid |
| Patch selection cuts stone outlines | Select shared geometry before shading; bound every shader influence on protected samples | Accepted stone style retained; a green edge check alone is insufficient |
| Dense and sparse lava are both acceptable | Preserve alternatives and record the larger set's cost | No unsupported better/worse ranking |
| A tile expansion appears less repetitive | Record changed tile size, palette, state count, and variants as applicable | No single-parameter improvement claim or automatic asset-count escalation |
| User asks to try or fix a material | Construct, inspect, and show a candidate within scope | A recommendation-only response does not complete the task |
| Ordinary sprite with no repeating surface | Keep material-reference routing conditional | No tileset process or mandatory quiet-background style |

Mechanism support and decision consistency passed both manual walkthroughs.
Actual visual evidence is limited to the listed trial views and user decisions;
automatic routing, cross-agent behavior, portability of scratch generators, and
new material quality remain unverified.

### Final repository verification, 2026-11-05

After the material/role guidance was added, `npm run validate` passed: 51
existing tests across 14 suites, 34 skills, 17 registered smoke fixtures, and
locked parser compatibility. `git diff --check` and Markdown path/whitespace
checks passed. An initial validation attempt found Python bytecode created by
the scratch experiments importing the local probe; that generated cache was
moved out of the skill package before the successful run. No runtime helper
logic was changed in this documentation revision. Local source changes remain
uncommitted and were not pushed or installed into other skill copies.

### Authorization boundary walkthrough, 2026-11-05

Manually checked twice, from the task and from the requested side effect: a
request to create tile art does not authorize installing a new editor, changing
engine code, or claiming a physical-device result. Continue native authoring
and available preview checks, and keep the unavailable consumer/device gate
not_verified; obtain the route/scope decision if that missing action is required.
The explicit AUTO delivery/install request authorizes this PR and skill update,
not unrelated engine changes or fabricated target-use evidence. The unchanged
generic art workflow could also preserve this boundary; this is a nearby stop
control, not claimed evidence of an improvement.
