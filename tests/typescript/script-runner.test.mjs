import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { root, workspace } from "./helpers.mjs";

test("published native script setup keeps strictest and declaration-only ts-reset checks", (t) => {
  const w = workspace(t);
  const reference = readFileSync(join(root, "skills/vp-stack-selection/references/typescript.md"), "utf8");
  const config = JSON.parse(reference.match(/```json\n([\s\S]*?)```/)[1]);
  const reset = reference.match(/```ts\n([\s\S]*?)```/)[1];
  w.json("package.json", { type: "module" });
  w.json("tsconfig.scripts.json", config);
  w.write("reset.d.ts", reset);
  w.write("scripts/task.ts", `
    const payload = JSON.parse('"ok"');
    if (typeof payload !== "string") throw new Error("Expected a string");
    console.log(payload.toUpperCase());
  `);
  const checked = w.pass("tsconfig.scripts.json");
  assert.ok(checked.files.includes("reset.d.ts"));
  const executed = w.command(process.execPath, ["scripts/task.ts"]);
  assert.equal(executed.status, 0, executed.output);
  assert.equal(executed.stdout.trim(), "OK");

  w.write("scripts/task.ts", 'export const name: string = ["ok"][1];');
  w.fail(2322, "tsconfig.scripts.json");
  w.write("scripts/task.ts", 'export const name: string = JSON.parse(\'"ok"\');');
  w.fail(2322, "tsconfig.scripts.json");
  w.json("without-reset.json", { ...config, include: ["scripts/**/*.ts"] });
  w.pass("without-reset.json");
});
