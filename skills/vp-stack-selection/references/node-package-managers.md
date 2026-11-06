# Node.js package-manager ownership

Prefer mise for Node.js and pnpm/Yarn version management when its selected
backend meets the platform and integrity requirements. The package manager
still installs project dependencies. Keep a fitting existing setup unless the
requested work justifies migrating it.

## Choose the owner

| Required behavior | Choice and adoption check |
| --- | --- |
| Install and select pinned Node.js and pnpm/Yarn versions | Prefer direct mise management; test the selected backend on each target. |
| Read a package-manager pin from `package.json` | Enable that tool's idiomatic version file; inspect the resolved version and source. Corepack is not required just to read the pin. |
| Corepack's dispatch-time wrong-manager rejection, `devEngines` validation/`onFail`, Known Good Releases, URL descriptors, or `pack`/cache-only offline workflow | Retain Corepack when the project relies on that behavior. Verify the exact Corepack version and configuration; mise selection is not equivalent. |
| Required mise backend fails or cannot preserve the declared integrity contract | Keep a working Corepack path or verify another backend/version before migration. Do not remove the checksum to make installation pass. |

## Select versions explicitly

The [mise Node.js guide](https://mise.jdx.dev/lang/node.html#package-manager-versions-in-package-json)
documents opt-in selection. For a pnpm project whose package-manager version
lives in `package.json`, use this shape:

```toml
# mise.toml; example Node.js pin, not a universal runtime requirement
[tools]
node = "24.22.1"

[settings]
idiomatic_version_file_enable_tools = ["pnpm"]
```

```json
{ "packageManager": "pnpm@10.15.0" }
```

Enable `yarn` instead for a Yarn project; enable `npm` only when selecting a
separate npm version. npm normally comes with Node.js. Preserve other tools
already enabled in the repository. Pin versions compatible with the actual
project and deployment target rather than copying example versions blindly.

- mise reads a matching `devEngines.packageManager` first, then top-level
  `packageManager`. For an array it reads the first entry. It selects a version;
  it does not implement Corepack's `onFail` validation policy.
- Corepack uses top-level `packageManager` as its primary descriptor and uses
  `devEngines.packageManager` for validation/fallback. Conflicting declarations
  can select different versions under the two tools. Align them before migration.
- An explicit same-directory mise tool pin overrides idiomatic selection.
  Avoid competing pins; when a fixed repository contract requires both, keep
  them equal and check drift in CI. Do not assume a `package.json` checksum
  remains attached to an explicit mise pin.
- Inspect parent/global/local overrides, backend aliases, and installed plugins
  with `mise config`, `mise ls --current`, and `mise which pnpm` or `mise which
  yarn`. Verify the source as well as the printed version.
- With no declaration, mise does not supply Corepack's Known Good Release.
  Configure a version rather than relying on an unrelated global installation.

## Preserve integrity and enforcement

mise supports Corepack-style `+sha1`, `+sha224`, `+sha256`, `+sha384`, and
`+sha512` suffixes with a hexadecimal digest. It verifies the npm tarball for
npm, pnpm, and Yarn 1; Yarn 2+ uses the published CLI file and requires an exact
version. These are different artifacts from a standalone pnpm binary. An
unrecognized suffix makes mise ignore the declaration; it is not a guaranteed
hard failure. Reject malformed declarations in repository validation.

Checksum support landed in mise `2026.8.11`; later fixes include accepting the
npm backend checksum option in `2026.10.14` and preventing a checksum request
from persisting the npm backend in `2026.10.23`. Treat those as feature/fix
milestones, not proof that every later release works or a minimum version for
plain `package.json` selection. The local baseline was
`2026.10.25`: pnpm integrity checks worked, but Yarn 4 checksum installation
failed on macOS with `File name too long`. Keep Corepack for that case until a
different mise version/backend passes the same check.

Selecting a binary does not guarantee wrong-manager rejection. A directly
installed Yarn CLI ran `--version` inside a pnpm-declared project in the probe;
Corepack rejected that command. Package managers may add their own protections,
but verify the actual install command and version before relying on them.
If Corepack's guard is required, retain it; also account for its settings and
the fact that its npm shim is not enabled by default.

## Keep local execution and CI consistent

1. Choose one dispatcher for each package-manager command. With direct mise,
   avoid also enabling Corepack's pnpm/Yarn shims. With Corepack, let mise own
   Node.js and Corepack itself, and let Corepack own package-manager dispatch.
2. Inspect `command -v`, `mise which`, and symlink/wrapper targets before changing
   existing shims. `node.corepack = true` runs `corepack enable` only after
   installing Node versions that include it. Node.js 25+ does not bundle
   Corepack; provision a pinned compatible Corepack separately if needed.
   Disabling the setting does not remove existing shims. Change only the
   authorized installation; never run a blanket global uninstall as setup.
3. Pin a tested mise version in CI. Install from the checked-in configuration,
   then run `mise exec -- pnpm ...` or `mise exec -- yarn ...`; shell activation
   is unnecessary. Do not also run a competing package-manager setup action.
4. When using `mise.lock`, include the runner platforms and verify `mise install
   --locked` with the selected backend. The package-manager lockfile separately
   controls application dependencies; use its frozen/immutable install mode.
   An installed-tool cache is trusted as installed, not reverified on every run.
5. Before adoption, test from an empty tool cache and rerun warm: selected
   version/source, valid and invalid integrity, conflicting selectors,
   missing/malformed declarations, wrong-manager behavior, and executable
   ownership. Keep actual CI/offline/platform checks separate from a local probe.

## Evidence

Reviewed 2026-11-06 (Asia/Taipei). The optional
[isolated probe](../scripts/probe-node-package-managers.py) requires already
installed mise, Node.js, Corepack, Python 3, and network access; it retains its
printed temporary directory. It installs only package-manager CLIs there.
The observations and manual instruction walkthroughs are recorded in the
repository's `fixtures/smoke/vp-stack-selection.md`.
Official sources:

- [mise version-matched package.json parser](https://github.com/jdx/mise/blob/v2026.10.25/src/config/config_file/idiomatic_version/package_json.rs)
  and [settings](https://github.com/jdx/mise/blob/v2026.10.25/settings.toml).
- [mise release history](https://github.com/jdx/mise/blob/v2026.10.25/CHANGELOG.md)
  and [backend persistence fix and review](https://github.com/jdx/mise/pull/15124).
- [Corepack 0.36.0 usage and configuration](https://github.com/nodejs/corepack/blob/v0.36.0/README.md).
- [mise CI and cache behavior](https://github.com/jdx/mise/blob/v2026.10.25/docs/continuous-integration.md).
