import assert from "node:assert/strict";
import test from "node:test";
import { workspace } from "./helpers.mjs";

function frameworkWorkspace(t, extension, checker) {
  const w = workspace(t);
  w.json("package.json", {
    private: true,
    type: "module",
    scripts: { "check:complete": `tsc -p tsconfig.json && ${checker}` },
  });
  w.config("tsconfig.json", {
    compilerOptions: {
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      verbatimModuleSyntax: true,
      tsBuildInfoFile: ".cache/framework.tsbuildinfo",
    },
    include: ["src/**/*.ts", `src/**/*.${extension}`],
    vueCompilerOptions: { strictTemplates: true },
  });
  w.write("src/sentinel.ts", "export const checked = true;\n");
  return w;
}

function completeCheck(w) {
  // npm scripts resolve this workspace's linked node_modules/.bin automatically.
  return w.command("npm", ["run", "check:complete", "--silent"]);
}

test("Vue templates require vue-tsc in addition to the TS-only input inventory", (t) => {
  const w = frameworkWorkspace(t, "vue", "vue-tsc --noEmit -p tsconfig.json");
  w.write("src/Counter.vue", `<script setup lang="ts">
defineProps<{ count: number }>();
</script>
<template><p>{{ count.toFixed(1) }}</p></template>
`);
  const valid = completeCheck(w);
  assert.equal(valid.status, 0, valid.output);
  t.diagnostic(`Valid Vue complete check: exit ${valid.status}\n${valid.output}`);

  w.write("src/Counter.vue", `<script setup lang="ts">
defineProps<{ count: number }>();
</script>
<template><p>{{ count.toUpperCase() }}</p></template>
`);
  const tsOnly = w.pass();
  assert.ok(!tsOnly.files.some((file) => file.endsWith(".vue")));
  const vanilla = w.cli("--noEmit", "-p", "tsconfig.json");
  assert.equal(vanilla.status, 0, vanilla.output);
  const invalid = completeCheck(w);
  assert.notEqual(invalid.status, 0, invalid.output);
  assert.match(invalid.output, /Counter\.vue.*TS2339/);
  assert.match(invalid.output, /toUpperCase/);
  t.diagnostic(`Invalid Vue: vanilla tsc exit ${vanilla.status}; complete check exit ${invalid.status}\n${invalid.output}`);
});

test("Svelte templates require svelte-check in addition to the TS-only input inventory", (t) => {
  const w = frameworkWorkspace(t, "svelte", "svelte-check --tsconfig tsconfig.json --output machine --fail-on-warnings");
  w.write("src/Counter.svelte", `<script lang="ts">
let { count }: { count: number } = $props();
</script>
<p>{count.toFixed(1)}</p>
`);
  const valid = completeCheck(w);
  assert.equal(valid.status, 0, valid.output);
  assert.match(valid.output, /COMPLETED \d+ FILES 0 ERRORS 0 WARNINGS/);
  t.diagnostic(`Valid Svelte complete check: exit ${valid.status}\n${valid.output}`);

  w.write("src/Counter.svelte", `<script lang="ts">
let { count }: { count: number } = $props();
</script>
<p>{count.toUpperCase()}</p>
`);
  const tsOnly = w.pass();
  assert.ok(!tsOnly.files.some((file) => file.endsWith(".svelte")));
  const vanilla = w.cli("--noEmit", "-p", "tsconfig.json");
  assert.equal(vanilla.status, 0, vanilla.output);
  const invalid = completeCheck(w);
  assert.notEqual(invalid.status, 0, invalid.output);
  assert.match(invalid.output, /ERROR "src\/Counter\.svelte"/);
  assert.match(invalid.output, /toUpperCase/);
  assert.match(invalid.output, /COMPLETED \d+ FILES 1 ERRORS 0 WARNINGS/);
  t.diagnostic(`Invalid Svelte: vanilla tsc exit ${vanilla.status}; complete check exit ${invalid.status}\n${invalid.output}`);
});
