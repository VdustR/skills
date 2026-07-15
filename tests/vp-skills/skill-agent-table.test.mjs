import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const helper = join(root, "skills", "vp-skills", "scripts", "skill-agent-table.mjs");

test("reads large skills JSON without truncation", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "vp-skills-test-"));
  const fakeNpx = join(tempDir, "npx");

  try {
    writeFileSync(
      fakeNpx,
      `#!/usr/bin/env node
const filler = "x".repeat(256);
const skills = Array.from({ length: 20_000 }, (_, index) => ({
  name: \`filler-\${index}\`,
  path: \`/tmp/\${filler}-\${index}\`,
  scope: "project",
  agents: [],
}));
skills.push({
  name: "vp-large-output",
  path: "/tmp/vp-large-output",
  scope: "project",
  agents: ["Codex"],
});
process.stdout.write(JSON.stringify(skills));
process.exit(0);
`,
      { mode: 0o755 },
    );

    const result = spawnSync(
      process.execPath,
      [helper, "--scope", "project", "--filter", "^vp-large-output$"],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${tempDir}${delimiter}${process.env.PATH || ""}`,
        },
      },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /vp-large-output\s+project\s+1\s+Codex/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
