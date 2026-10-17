import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { blocks, root, workspace } from "./helpers.mjs";

test("strictest is effective and strict alone is not equivalent", (t) => {
  const w = workspace(t);
  w.config();
  w.write("src/index.ts", "export const ok = 1;");
  const options = w.parse().options;
  const strictest = JSON.parse(readFileSync(join(root, "node_modules/@tsconfig/strictest/tsconfig.json"), "utf8"));
  for (const [name, value] of Object.entries(strictest.compilerOptions)) {
    if (typeof value === "boolean" && name !== "skipLibCheck") assert.equal(options[name], value, name);
  }
  w.write("src/index.ts", "export const option: { value?: string } = { value: undefined }; export const item: string = [\"a\"][1];");
  const result = w.check();
  assert.ok(result.codes.includes(2375), result.text);
  assert.ok(result.codes.includes(2322), result.text);
  w.json("strict.json", { compilerOptions: { strict: true, types: [], lib: ["ES2022"], noEmit: true }, include: ["src/**/*.ts"] });
  w.pass("strict.json");
});

test("browser, worker, Node and portable core load only intended ambient APIs", (t) => {
  const w = workspace(t);
  const environments = {
    browser: { lib: ["ES2022", "DOM"], types: [], good: "document.title", bad: "process.cwd()" },
    worker: { lib: ["ES2022", "WebWorker"], types: [], good: "self.postMessage(1)", bad: "document.title" },
    node: { lib: ["ES2022"], types: ["node"], good: "process.cwd()", bad: "document.title" },
    core: { lib: ["ES2022"], types: [], good: "[1].map(x => x + 1)", bad: "document.title" },
  };
  for (const [name, { lib, types, good, bad }] of Object.entries(environments)) {
    w.config(`${name}.json`, { compilerOptions: { lib, types, tsBuildInfoFile: `.cache/${name}.tsbuildinfo` }, include: [`${name}/**/*.ts`] });
    w.write(`${name}/index.ts`, `export const value = ${good};`);
    w.pass(`${name}.json`);
    w.write(`${name}/index.ts`, `export const value = ${bad};`);
    assert.ok(w.check(`${name}.json`).codes.length > 0, name);
  }
});

test("incompatible host globals isolate, but import/reference/barrel bypass an allowlist", (t) => {
  const w = workspace(t);
  w.write("types/host-a/index.d.ts", "declare const $: { a(): string };\n");
  w.write("types/host-b/index.d.ts", "declare const $: { b(): number };\n");
  for (const host of ["a", "b"]) {
    w.config(`${host}.json`, { compilerOptions: { types: [`host-${host}`], typeRoots: ["./types"], tsBuildInfoFile: `.cache/${host}.tsbuildinfo` }, include: [`${host}/**/*.ts`], exclude: ["types"] });
    w.write(`${host}/index.ts`, `export const value = $.${host}();`);
    w.pass(`${host}.json`);
    w.write(`${host}/wrong.ts`, `export const value = $.${host === "a" ? "b" : "a"}();`);
    w.fail(2339, `${host}.json`);
    rmSync(join(w.dir, host, "wrong.ts"));
  }
  for (const leak of ['import "../types/host-b";', '/// <reference path="../types/host-b/index.d.ts" />']) {
    w.write("a/leak.ts", leak);
    w.fail(2451, "a.json");
  }
  rmSync(join(w.dir, "a/leak.ts"));
  w.write("b/adapter.ts", 'import "../types/host-b"; export const host = "b";');
  w.write("barrel.ts", 'export * from "./b/adapter";');
  w.write("a/leak.ts", 'import "../barrel";');
  w.fail(2451, "a.json");
});

test("config paths resolve from their owner; includes replace and references do not inherit", (t) => {
  const w = workspace(t);
  const [base, leaf] = blocks("project-configuration.md", "json").map(JSON.parse);
  w.json("tsconfig.base.json", base);
  w.write("packages/app/src/index.ts", "export const value = 1;");
  w.write("packages/app/src/widget.stories.tsx", "export const story = 1;");
  w.write("packages/app/reset.d.ts", "export {};");
  w.json("packages/app/tsconfig.json", leaf);
  const parsed = w.parse("packages/app/tsconfig.json");
  assert.equal(parsed.options.noUncheckedIndexedAccess, true);
  assert.deepEqual(parsed.options.types, ["vite/client"]);
  assert.equal(parsed.options.tsBuildInfoFile, join(w.dir, ".cache/tsc/web-app.tsbuildinfo"));
  assert.ok(parsed.fileNames.includes(join(w.dir, "packages/app/reset.d.ts")));
  assert.ok(!parsed.fileNames.includes(join(w.dir, "packages/app/src/widget.stories.tsx")));
  w.json("parent.json", { extends: "./base.json", include: ["parent/**/*.ts"], references: [{ path: "./dependency" }] });
  w.write("parent/one.ts", "export const one = 1;");
  w.write("child/two.ts", "export const two = 2;");
  w.json("child.json", { extends: "./parent.json", include: ["child/**/*.ts"] });
  const child = w.parse("child.json");
  assert.equal(child.projectReferences, undefined);
  assert.deepEqual(child.fileNames, [join(w.dir, "child/two.ts")]);
});

test("empty solution -p is false green while build mode traverses composite dependencies", (t) => {
  const w = workspace(t);
  for (const name of ["core", "app"]) {
    w.json(`${name}/tsconfig.json`, {
      extends: "../base.json",
      compilerOptions: { noEmit: false, composite: true, declaration: true, outDir: `../out/${name}`, rootDir: ".", tsBuildInfoFile: `../.cache/${name}.tsbuildinfo` },
      include: ["*.ts"], ...(name === "app" ? { references: [{ path: "../core" }] } : {}),
    });
  }
  w.write("core/index.ts", 'export const value: string = "ok";');
  w.write("app/index.ts", 'import { value } from "../core/index"; export const result: string = value;');
  w.json("tsconfig.json", { files: [], references: [{ path: "./app" }] });
  let result = w.cli("-b", "tsconfig.json");
  assert.equal(result.status, 0, result.output);
  assert.ok(existsSync(join(w.dir, "out/core/index.d.ts")));
  assert.ok(existsSync(join(w.dir, "out/app/index.d.ts")));
  result = w.cli("-b", "tsconfig.json", "--verbose");
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /up to date/i);
  w.write("core/index.ts", "export const value: number = 1;");
  assert.equal(w.cli("-p", "tsconfig.json").status, 0);
  result = w.cli("-b", "tsconfig.json");
  assert.notEqual(result.status, 0);
  assert.match(result.output, /TS2322/);
});

test("handwritten declarations, JS and suppressed files need actual checking", (t) => {
  const w = workspace(t);
  w.write("src/broken.d.ts", "declare const value: MissingType; export { value };");
  w.config("skip.json", { compilerOptions: { skipLibCheck: true } });
  w.pass("skip.json");
  w.config("check.json");
  w.fail(2304, "check.json");
  rmSync(join(w.dir, "src/broken.d.ts"));
  w.write("src/index.js", '/** @type {string} */ export const value = 1;');
  w.config("js.json", { compilerOptions: { allowJs: true, checkJs: false }, include: ["src/**/*.js"] });
  assert.ok(w.pass("js.json").files.includes("src/index.js"));
  w.config("js.json", { compilerOptions: { allowJs: true, checkJs: true }, include: ["src/**/*.js"] });
  w.fail(2322, "js.json");
  w.write("src/index.js", '// @ts-nocheck\n/** @type {string} */ export const value = 1;');
  w.pass("js.json");
});

test("file inventory catches unowned hidden and test files; environment rows remain independent", (t) => {
  const w = workspace(t);
  w.write("src/index.ts", "export const value = 1;");
  w.write("src/contracts.test-d.ts", "export const value: string = 1;");
  w.write(".storybook/main.ts", "export const value: string = 1;");
  w.write("scripts/new-worker.mts", "export const value: string = 1;");
  w.config("build.json", { exclude: ["src/**/*.test-d.ts"] });
  w.pass("build.json");
  const inventory = ["src/index.ts", "src/contracts.test-d.ts", ".storybook/main.ts", "scripts/new-worker.mts"];
  const inputs = new Set(w.check("build.json").files);
  assert.deepEqual(inventory.filter((file) => !inputs.has(file)), inventory.slice(1));
  w.config("verify.json", { include: ["src/**/*.ts", ".storybook/**/*.ts", "scripts/**/*.mts"] });
  const checked = w.fail(2322, "verify.json");
  assert.equal(checked.diagnostics.filter((d) => d.code === 2322).length, 3);
  assert.deepEqual(inventory.filter((file) => !checked.files.includes(file)), []);
  w.write("shared/platform.ts", "export const title = document.title;");
  for (const [name, lib] of [["browser", ["ES2022", "DOM"]], ["portable", ["ES2022"]]]) {
    w.config(`${name}.json`, { compilerOptions: { lib }, include: ["shared/**/*.ts"] });
  }
  w.pass("browser.json");
  const missingEnvironment = w.fail(2584, "portable.json");
  assert.ok(missingEnvironment.files.includes("shared/platform.ts"));
});

test("incremental checks invalidate after source, dependency and extended-config edits", (t) => {
  const w = workspace(t);
  w.config();
  w.write("src/dependency.ts", 'export const value: string = "ok";');
  w.write("src/index.ts", 'import { value } from "./dependency"; export const result: string = value;');
  for (let i = 0; i < 2; i++) {
    const result = w.cli("-p", "tsconfig.json");
    assert.equal(result.status, 0, result.output);
  }
  assert.ok(existsSync(join(w.dir, ".cache/check.tsbuildinfo")));
  w.write("src/index.ts", "export const result: string = 1;");
  assert.match(w.cli("-p", "tsconfig.json").output, /TS2322/);
  w.write("src/index.ts", 'import { value } from "./dependency"; export const result: string = value;');
  w.write("src/dependency.ts", "export const value: number = 1;");
  assert.match(w.cli("-p", "tsconfig.json").output, /TS2322/);
  w.write("src/dependency.ts", 'export const value: string = "ok";');
  w.write("src/index.ts", 'export function maybe(value: boolean): string | undefined { if (value) return "ok"; }');
  const base = JSON.parse(w.read("base.json"));
  base.compilerOptions.noImplicitReturns = false;
  w.json("base.json", base);
  assert.equal(w.cli("-p", "tsconfig.json").status, 0);
  base.compilerOptions.noImplicitReturns = true;
  w.json("base.json", base);
  assert.match(w.cli("-p", "tsconfig.json").output, /TS7030/);
});

test("warm checks invalidate imported workspace source and global declarations, retain errors, and recover", (t) => {
  const w = workspace(t);
  w.config("app.json", {
    compilerOptions: { tsBuildInfoFile: ".cache/app.tsbuildinfo" },
    include: ["app/**/*.ts"],
  });
  const source = "export const value: number = 1;";
  const globals = "declare function cacheInput(input: number): number;";
  w.write("library/index.ts", source);
  w.write("library/globals.d.ts", globals);
  w.write("app/index.ts", `
    /// <reference path="../library/globals.d.ts" />
    import { value } from "../library/index";
    export const result: number = value;
    export const fromGlobal = cacheInput(1);
  `);
  const check = () => w.cli("-p", "app.json", "--extendedDiagnostics");
  const pass = () => {
    const result = check();
    assert.equal(result.status, 0, result.output);
    return result;
  };
  pass();
  const cache = join(w.dir, ".cache/app.tsbuildinfo");
  const coldState = readFileSync(cache, "utf8");
  const warm = pass();
  assert.equal(readFileSync(cache, "utf8"), coldState);
  assert.match(warm.output, /Instantiations:\s+0\b/, warm.output);

  for (const [file, invalid, valid, code] of [
    ["library/index.ts", 'export const value: string = "changed";', source, "TS2322"],
    ["library/globals.d.ts", "declare function cacheInput(input: string): number;", globals, "TS2345"],
  ]) {
    w.write(file, invalid);
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = check();
      assert.notEqual(result.status, 0, result.output);
      assert.ok(result.output.includes(code), result.output);
      assert.match(result.output, /app\/index\.ts/, result.output);
    }
    w.write(file, valid);
    pass();
    const reused = pass();
    assert.match(reused.output, /Instantiations:\s+0\b/, reused.output);
  }
});

test("application reset affects intended programs without leaking into libraries", (t) => {
  const w = workspace(t);
  w.write("app/reset.d.ts", blocks("project-configuration.md", "ts")[0]);
  w.write("app/index.ts", `
    const data: unknown = JSON.parse("{}");
    export const accepted: unknown = data;
    // @ts-expect-error -- application JSON remains unknown until validated.
    export const unchecked = JSON.parse("{}").id;
  `);
  w.config("app.json", { include: ["app/**/*.ts"] });
  w.pass("app.json");
  w.write("library/index.ts", 'export const result = JSON.parse("{}").id;');
  w.config("library.json", { include: ["library/**/*.ts"] });
  w.pass("library.json");
  w.config("without-reset.json", { include: ["app/index.ts"] });
  w.fail(2578, "without-reset.json");
});

test("selected and DOM reset imports work under Bundler and NodeNext resolution", (t) => {
  const w = workspace(t);
  w.write("app/reset.d.ts", 'import "@total-typescript/ts-reset/json-parse"; import "@total-typescript/ts-reset/fetch"; import "@total-typescript/ts-reset/dom";');
  w.write("app/index.ts", `
    export const raw: unknown = JSON.parse("{}");
    // @ts-expect-error -- selected JSON rule makes unchecked properties unsafe.
    export const jsonValue = JSON.parse("{}").id;
    // @ts-expect-error -- DOM reset makes indexed storage values unknown.
    export const storageValue: string = localStorage["value"];
    export async function read() {
      const raw = await (await fetch("/")).json();
      // @ts-expect-error -- selected fetch rule requires validation.
      return raw.id;
    }
  `);
  for (const [module, moduleResolution] of [["ESNext", "Bundler"], ["NodeNext", "NodeNext"]]) {
    w.config("tsconfig.json", { compilerOptions: { lib: ["ES2022", "DOM"], module, moduleResolution }, include: ["app/**/*.ts"] });
    w.pass();
  }
});

test("the published shared base excludes DOM until a leaf explicitly adds it", (t) => {
  const w = workspace(t);
  const [base] = blocks("project-configuration.md", "json").map(JSON.parse);
  w.json("published-base.json", base);
  w.write("src/index.ts", "export const title = document.title;");
  w.json("core.json", { extends: "./published-base.json", include: ["src/**/*.ts"] });
  w.fail(2584, "core.json");
  w.json("browser.json", { extends: "./published-base.json", compilerOptions: { lib: ["ES2022", "DOM"] }, include: ["src/**/*.ts"] });
  w.pass("browser.json");
});

test("paths do not rewrite runtime imports and lib/target do not polyfill APIs", (t) => {
  const w = workspace(t);
  w.write("src/value.ts", "export const value = 1;");
  w.write("src/alias.mts", 'import { value } from "@fixture/value"; export { value };');
  w.config("alias.json", {
    compilerOptions: { noEmit: false, rootDir: "src", outDir: "out", paths: { "@fixture/*": ["./src/*"] } },
    include: ["src/**/*.ts", "src/**/*.mts"],
  });
  let result = w.cli("-p", "alias.json");
  assert.equal(result.status, 0, result.output);
  assert.match(w.read("out/alias.mjs"), /from "@fixture\/value"/);
  result = w.command(process.execPath, ["out/alias.mjs"]);
  assert.notEqual(result.status, 0);
  assert.match(result.output, /ERR_MODULE_NOT_FOUND/);
  w.write("src/sorted.mts", "export function sorted() { return [2, 1].toSorted(); }");
  w.config("sort.json", {
    compilerOptions: { noEmit: false, target: "ES2015", lib: ["ES2023"], rootDir: "src", outDir: "sort-out" },
    include: ["src/sorted.mts"],
  });
  result = w.cli("-p", "sort.json");
  assert.equal(result.status, 0, result.output);
  result = w.command(process.execPath, ["--input-type=module", "-e", `
    Array.prototype.toSorted = undefined;
    const { sorted } = await import("./sort-out/sorted.mjs");
    let rejected = false;
    try { sorted(); } catch (error) { if (!(error instanceof TypeError)) throw error; rejected = true; }
    if (!rejected) throw new Error("Expected missing runtime API");
  `]);
  assert.equal(result.status, 0, result.output);
});
