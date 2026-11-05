# Seamless pixel textures and Wang tiles

Read this when creating, adapting, or reviewing repeating pixel textures or
edge-matched tilesets. Keep the skill's native-grid, palette, source, and review
gates. This reference adds tile construction and acceptance criteria; it does
not require a tileset for ordinary sprites or authorize engine code changes.

## Select the repetition model

| Need | Suitable starting point | Limit |
| --- | --- | --- |
| Repeat one small texture | A single seamless tile | Every distinctive feature repeats at a fixed interval |
| Vary a uniform material across a large area | Edge Wang tiles with compatible boundary samples and varied interiors | Shared boundary features and prominent interiors can still reveal repetition |
| Join grass, dirt, water, or other regions | A terrain-transition set using the consumer's edge, corner, or mixed rules | Transition coverage does not establish varied interiors |

Combine transitions and Wang interiors when both needs exist. Do not treat every
16-tile set as interchangeable. Tiled distinguishes edge and corner sets (16
patterns for two terrain states) from mixed sets (256 complete patterns).

Declare tile dimensions, palette/alpha, intended viewing scale, material and
lighting, adjacency model, permitted transforms, map boundary behavior, and
consumer before construction. For a small single tile, keep this contract small.
Record atlas order explicitly; the bit order below is an example convention,
not a universal engine format. Preserve existing project conventions.

## Choose the material structure and visual role

Set the asset's role before choosing detail density. A background can succeed
through recognizable material, restrained contrast, and room for foreground
objects. A focal surface or intentionally busy style may need a different
balance. Establish the role from the brief or consuming context; do not impose
quiet sand, sparse lava, or one palette on every project.

| Material structure | Construction route | Failure to inspect |
| --- | --- | --- |
| Fine grains, moss, or other locally irregular texture | Compatible textured boundary samples with varied interiors; match palette, cluster size, and detail density across the join | Flat boundary rails, empty border bands, repeated conspicuous marks, or a field of distracting speckles |
| Directional ripples, grain, or flow | Maintain a coherent direction/phase field across boundaries; vary coverage and spacing within that field | Cut-off ridges, abrupt direction changes, uniformly corrugated stripes, or repeated groups of short marks |
| Stone outlines, cracks, or another connected contour network | Construct shared boundary geometry and corner neighborhoods first, then shade the geometry | A patch cut that preserves edge pixels but truncates an interior stone or line; neighboring geometry influencing a supposedly protected edge |
| Emissive cracks or molten areas | Choose the intended network density and separate dark material, warm branches, and bright centers | Every line equally bright/wide, hotspot rows, or fixed connection points exposing the tile lattice |

Match the method to the structure, not just the theme name. Grass patch selection
can produce acceptable texture while breaking stone outlines or lava paths.
Conversely, preserving a network does not establish that its density or style
suits the brief. Dense and sparse lava can both be accepted alternatives.

### Practical construction choices

- For a quiet granular base, author sparse compact grain clusters and restrained
  irregular substrate variation at native size. Keep most of the field within
  a narrow value range, with highlights serving a specific material role.
  Inspect the assembled field before adding more marks. Large oval color blobs
  can read as pebbles; dense bright dots can overwhelm the ground. Choose palette
  spacing and density from the intended role, not fixed universal percentages.
- For rippled sand, establish the prevailing direction and connected phase
  before shading crests/troughs. Use a smooth coverage envelope for calm and
  rippled areas. Randomly cutting independently phased wave patches can make
  technically compatible sand look incoherent; globally repeated stripes or
  clustered short bands can still look artificial after continuity is fixed.
- For structured paving, one workable route is boundary/corner-owned seed
  geometry with independently varied interior seeds and a shared sampling halo.
  Shade the resulting cells at the native grid. Prove that every input affecting
  the protected boundary remains shared: a shader using the two nearest sites
  needs both influences checked, not only the nearest site. A jitter bound that
  worked for one tile size or shader is not a universal safe bound.
- For explicit crack paths, agree on boundary connection states, keep crossings
  compatible, and vary interior branches and widths. Keep prominent hot centers
  away from fixed repeated connection points when the brief calls for irregular
  heat distribution. One open-port location can form a circuit-like lattice;
  additional positions can help, but more states multiply asset count. Record
  that tradeoff rather than calling a larger set automatically better.

First render a native-size repeated field, then inspect detail enlargements and
the atlas. Do not polish isolated tiles until the material reads coherently
across the field. Repair the observed structure/contrast problem before adding
variants, increasing tile size, or changing palettes. When those changes are
useful, record them as changed asset designs, not proof that one parameter alone
improved quality. Keep any platform budget fixed unless changing it is in scope.

## Construct the pixels

### Single seamless tile

1. Work at the native grid. Paint across wrapped boundaries or use an integer
   offset to move boundary joins into the middle for repair. Inspect the joins
   in both directions and where four copies meet.
2. Preserve intentional clusters, shading direction, palette, and alpha. Return
   to the original offset and inspect a repeated field at native size. A clean
   join does not hide repeated flowers, rocks, or large value blocks.

### Edge Wang set

1. Define a boundary codebook for horizontal and vertical edges separately.
   Matching labels specify compatibility, not visible colors or proof of a
   seamless image. Plan the corner neighborhoods as well as the edge strips;
   independent edge patches can conflict where four tiles meet.
2. Author compatible boundary neighborhoods, then vary the interiors. Hand-draw
   from shared native-grid samples, or cut complementary patches from an
   authorized pixel texture. On either side of a cut, preserve the consecutive
   source samples that actually adjoin. Opposing outermost rows/columns do not
   generally need to be identical: they represent adjacent pixels, not the
   same pixel. Some projects deliberately use identical boundary pixels; verify
   that contract rather than imposing it on every tileset.
3. Preserve the boundary neighborhoods while joining the interiors. Image
   Quilting's minimum-error boundary cut is an optional patch-stitching method,
   not a guarantee of good pixel clusters. Prefer discrete sample selection over
   feathered blending when the declared palette/alpha must stay exact. Inspect
   the resulting native pixels, corners, and shading after stitching.
4. Keep shared strips visually quiet. Put conspicuous stones, flowers, and
   bushes into optional decoration layers when the brief permits; use terrain
   transitions or larger-scale composition for shapes wider than a tile. Avoid
   rotating/flipping directional light or grain merely to fill missing cases.

For the complete binary edge example, label edges `(top, right, bottom, left)`
and use `id = top + 2*right + 4*bottom + 8*left`: 16 combinations before any
additional visual variants. With `k` states per edge, a complete unrestricted
four-edge set has `k^4` patterns. Completeness is conditional on that model;
sparse sets need their own coverage/placement strategy. Do not require 16 tiles
for every task or promise a unique match when variants share a pattern.

To construct a compatible map with this complete set, assign one state per
shared map edge, then choose a tile with those four states. For looping maps,
the opposite map boundaries must share states too. For independently generated
chunks, derive shared states from the same seed, orientation, and canonical
global edge coordinates. Implement or exercise that consumer only when in scope.
Random placement reduces obvious periodicity; it does not make every possible
arrangement mathematically aperiodic.

## Validation method and acceptance baseline

Set required contexts before reviewing. Technical, visual, and target-use
results are separate; a required failure cannot be averaged away. The counts
below follow from the binary example, while preview sizes/seeds are practical
starting points for a repeatable review, not universal quality thresholds.

| Layer | Method | Passing baseline |
| --- | --- | --- |
| Format and source | Rebuild exports; inspect actual dimensions, palette, alpha, tile bounds, atlas mapping, and declared transforms | All declared constraints hold for the exact exported revision |
| Pattern coverage | Enumerate required patterns and variants; reject unintended duplicate IDs before a keyed map can overwrite them | No missing required pattern, conflicting identifier, or unsupported transform; variants are explicit |
| Placement | Check actual neighbors against metadata; include self-pairs and map/chunk boundaries when required | Zero illegal joins or missing lookups in the declared contexts; the complete binary set has 128 legal ordered pairs per axis |
| Pixel continuity | Render legal pairs and four-tile junctions. Compare protected neighborhoods with known source samples when available; otherwise inspect actual stitched images | No unintended broken contour, value/alpha jump, or conflicting corner. A metadata match alone is insufficient |
| Material coherence and role | Inspect direction/phase, connected shapes, cluster scale, detail density, and value hierarchy across the native field. Include the intended foreground when available, and identify a stand-in as a stand-in | The material reads as intended and its attention level fits the declared role; no unexplained patch transitions or foreground competition |
| Repetition and craft | Compare one-tile repetition with the proposed tileset at the same area, palette, scale, and decoration state. Start with a 12x12 field at three recorded seeds; also inspect native size and nearest-neighbor enlargement | No unintended seam lattice, conspicuous feature rows, or distracting repeated motifs in the declared views; retain intended patterns authorized by the brief |
| Consumer, when required | Import the exact atlas and metadata; exercise actual sampling, transforms, scrolling, wrap/chunk joins, and camera scales | No wrong tile selection, atlas bleed, filtering seam, or boundary break in that consumer; untested contexts stay not_verified |

For a single tile, a 3x3 repeat is a useful first join/corner view, followed by a
larger field when repetition matters. For a Wang set, small seed samples do not
cover every pair or junction. Enumerate legal combinations when feasible; if
only sampling junctions, record the uncovered cases. A known shared-corner
construction can establish a technical corner invariant, but it cannot replace
visual inspection of the assembled field.

Do not introduce a universal seam color-distance cutoff or require zero
cross-seam pixel difference. Real material contains adjacent color changes;
artifacts can also persist despite equal boundary pixels. Exact comparison is
appropriate only against a declared source/pixel contract. Record visual
failures with the seed, tile IDs, coordinates, inspected scale, and actual
observation. For subjective repetition, report the inspected views and reviewer;
do not invent a percentage improvement or call self-review human approval.

Separate compatibility, visual self-review, target-use evidence, and the user's
decision. A user accepting one style does not approve every theme, later edit,
or consumer. If two different styles are accepted, preserve them without ranking
them unless comparison supports that claim. If the user rejects a technically
valid result, retain the technical result and reopen the visual criterion; do
not use a green report to defend the artwork or redefine their preference.

When the requested next step is to fix or try artwork, produce and inspect the
candidate within the authorized scope, then show it. A list of future
suggestions does not replace the requested visual result. Once the declared
criteria and required user decisions are satisfied, stop polishing; additional
detail is a new choice, not an automatic quality improvement.

### Verify that the checks can fail

Use copies and retain the accepted source. Alongside a known-good fixture,
exercise targeted negative controls:

- Wrong metadata or a missing tile: placement/coverage must reject it.
- Damaged boundary pixels with unchanged codes: pixel continuity must fail even
  while metadata compatibility passes.
- Damaged corner with intact mid-edge samples: corner inspection must catch
  what a mid-edge-only check misses.
- Incorrect opposite boundary or chunk edge, when relevant: boundary validation
  must fail rather than inspecting only internal neighbors.
- A technically compatible but visibly repetitive field: visual review must
  remain failed even when the numerical checks pass.

Repeat the representative checks with recorded seeds. Score the mechanism
(source comparisons, neighbor constraints, visual observations) separately from
the output's acceptance. A successful output produced for another reason does
not demonstrate that the proposed check works.

## Re-runnable controlled probe

Run from the skill directory with Python 3 (standard library only):

```bash
python3 scripts/tiling_probe.py --output /tmp/pixel-tiling-probe
```

The probe creates its own diagnostic native-grid fixture: 16 tiles, 16x16 pixels
each, four colors, and known consecutive boundary samples. It checks all 128
legal pairs on each axis, generates looping 12x12 maps for seeds 7, 23, and 101,
and injects metadata, pixel, corner, coverage, and wrap faults. It writes
`report.json`, a native atlas, native maps, damaged examples, and
`comparison-3x.png` (left: single-tile repeat; middle: Wang placement; right:
damaged seam). Nonzero exit means a probe expectation failed. Existing files
with these names in the selected output directory are overwritten.

This is a demonstration of check sensitivity, not a validator accepting arbitrary
art or an implementation of the article's cutter. Its deliberately uniform
boundary strips can create a visible lattice even while technical checks pass.
That visual failure is a useful counterexample, not a production-ready grass
set. Its constant corner patches are a fixture construction choice, not a
requirement for authored artwork. No engine/hardware or independent/human
acceptance follows from a green report.

Deliver source, native exports, the boundary codebook/atlas mapping, recorded
preview seeds, and scoped technical/visual/consumer results as needed for the
requested asset. Keep failed required gates as revise; missing required
observations remain needs_review under the shared review gates.

## Sources

- [SpriteCook: Wang tiles for pixel art, explained](https://www.spritecook.ai/blog/wang-tiles-explained)
  (2026-11-03): pixel-texture sampling example, shared-edge placement, and
  repetition pitfalls. This product tutorial is not evidence of tool quality.
- [Cohen et al.: Wang Tiles for Image and Texture Generation](https://graphics.uni-konstanz.de/publikationen/Cohen2003WangTilesImage/index.html)
  (2003): edge-matched texture construction and extended corner coding.
- [Efros and Freeman: Image Quilting for Texture Synthesis and Transfer](https://graphics.cs.cmu.edu/people/efros/research/quilting.html)
  (2001): patch-based texture synthesis and minimum-error cuts.
- [Tiled: Using Terrains](https://doc.mapeditor.org/en/stable/manual/terrain/):
  edge/corner/mixed models, variations, and directional transformation caveats.

The preview sizes, seeds, and layered acceptance baseline are this skill's
review protocol, not numerical standards established by those publications.
