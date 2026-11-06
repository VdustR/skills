#!/usr/bin/env python3
"""Probe installed mise/Corepack on macOS or Linux; requires Python 3 and network.

Keeps evidence in a printed temporary directory. Reuses the installed Node.js
and Corepack without enabling shims or changing global/project configuration.
Installs only package-manager CLIs into isolated storage. Runs cold, then warm.
Yarn installation is an observation: review its exit status separately.
"""

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import urllib.request


def output(args, **kwargs):
    return subprocess.check_output(args, text=True, timeout=120, **kwargs).strip()


mise = shutil.which("mise")
if mise is None:
    raise SystemExit("Requires an installed mise, Node.js, and Corepack.")
node = output([mise, "which", "node"])
corepack = output([mise, "which", "corepack"])
root = Path(tempfile.mkdtemp(prefix="mise-package-managers-"))
print("Evidence directory:", root, flush=True)
(root / "bin").mkdir()
(root / "bin/node").symlink_to(node)
(root / "global.toml").write_text("")
(root / "system.toml").write_text("")
env = {
    "HOME": os.environ["HOME"],
    "PATH": f"{root / 'bin'}:/usr/bin:/bin",
    "MISE_CONFIG_DIR": str(root / "config"),
    "MISE_CACHE_DIR": str(root / "cache"),
    "MISE_DATA_DIR": str(root / "data"),
    "MISE_STATE_DIR": str(root / "state"),
    "MISE_GLOBAL_CONFIG_FILE": str(root / "global.toml"),
    "MISE_SYSTEM_CONFIG_FILE": str(root / "system.toml"),
    "MISE_YES": "1",
    "MISE_NODE_COREPACK": "0",
    "COREPACK_HOME": str(root / "corepack"),
    "COREPACK_ENABLE_DOWNLOAD_PROMPT": "0",
    "CI": "1",
}
print("mise:", output([mise, "--version"], env=env))
print("node:", output([node, "--version"], env=env))
print("corepack:", output([corepack, "--version"], env=env))
settings = '[settings]\nidiomatic_version_file_enable_tools = ["pnpm", "yarn"]\n'
# JSON string escaping is also valid for this TOML basic string.
node_pin = "[tools]\nnode = " + json.dumps(
    "path:" + str(Path(node).resolve().parent.parent)
) + "\n"


def case(name, package, config=settings + node_pin):
    directory = root / name
    directory.mkdir(exist_ok=True)
    (directory / "package.json").write_text(json.dumps(package))
    (directory / "mise.toml").write_text(config)
    return directory


def run(directory, args, expected_success=True):
    result = subprocess.run(
        args, cwd=directory, env=env, text=True, timeout=120,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    text = result.stdout.strip()
    print(directory.name, args[1:], "exit", result.returncode, "\n", text, flush=True)
    if expected_success is not None:
        assert (result.returncode == 0) == expected_success, text
    return text


for repeat in (1, 2):
    print("REPEAT", repeat, flush=True)
    directory = case("disabled", {"packageManager": "pnpm@10.15.0"}, node_pin)
    assert json.loads(run(directory, [mise, "ls", "--current", "--json", "pnpm"])) == []

    directory = case("enabled", {"packageManager": "pnpm@10.15.0"})
    assert run(directory, [mise, "current", "pnpm"]).endswith("10.15.0")

    conflicting = {
        "packageManager": "pnpm@10.15.0",
        "devEngines": {"packageManager": {
            "name": "pnpm", "version": "10.14.0", "onFail": "ignore",
        }},
    }
    directory = case("precedence", conflicting)
    assert run(directory, [mise, "current", "pnpm"]).endswith("10.14.0")
    assert run(directory, [corepack, "pnpm", "--version"]).endswith("10.15.0")

    directory = case(
        "explicit", {"packageManager": "pnpm@10.15.0"},
        settings + node_pin + 'pnpm = "10.14.0"\n',
    )
    assert run(directory, [mise, "current", "pnpm"]).endswith("10.14.0")

    for name, package in (
        ("missing", {}),
        ("invalid-suffix", {"packageManager": "pnpm@10.15.0+invalid.abc"}),
    ):
        directory = case(name, package)
        assert json.loads(run(directory, [mise, "ls", "--current", "--json", "pnpm"])) == []

    # A distinct version keeps failure independent of the already installed CLI.
    directory = case("bad-hash", {"packageManager": "pnpm@10.14.0+sha224." + "0" * 56})
    text = run(directory, [mise, "install"], False)
    assert "Checksum mismatch" in text
    directory = case("good-hash", {"packageManager": (
        "pnpm@10.15.0+sha224.88208eb7c2e7de6ed534fa298248dee656723116995eda4b508fd0c9"
    )})
    run(directory, [mise, "install"])
    assert run(directory, [mise, "exec", "--", "pnpm", "--version"]).endswith("10.15.0")

    with urllib.request.urlopen(
        "https://repo.yarnpkg.com/4.9.2/packages/yarnpkg-cli/bin/yarn.js", timeout=30,
    ) as response:
        digest = hashlib.sha224(response.read()).hexdigest()
    directory = case("yarn", {"packageManager": "yarn@4.9.2+sha224." + digest})
    # A failed install blocks adoption; it is not a successful compatibility test.
    run(directory, [mise, "install"], None)
    assert run(directory, [corepack, "yarn", "--version"]).endswith("4.9.2")

    # Provision Yarn independently to distinguish selection from dispatch checks.
    directory = case(
        "wrong-manager", {"packageManager": "pnpm@10.15.0"},
        settings + node_pin + '"npm:@yarnpkg/cli-dist" = "4.9.2"\n',
    )
    run(directory, [mise, "install"])
    assert run(directory, [mise, "exec", "--", "yarn", "--version"]).endswith("4.9.2")
    assert "pnpm" in run(directory, [corepack, "yarn", "--version"], False)

print("Assertions passed; review Yarn install exit status separately.")
