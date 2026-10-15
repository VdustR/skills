import assert from "node:assert/strict";
import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { root, workspace } from "./helpers.mjs";

function isolatedModules(w) {
  // Remove only this fixture's link, never the repository's dependency directory.
  rmSync(join(w.dir, "node_modules"));
  mkdirSync(join(w.dir, "node_modules"));
  symlinkSync(join(root, "node_modules/@tsconfig"), join(w.dir, "node_modules/@tsconfig"), "junction");
}

function hostPackage(w, host) {
  w.json(`node_modules/host-${host}/package.json`, { name: `host-${host}`, version: "1.0.0", types: "index.d.ts" });
  w.write(`node_modules/host-${host}/index.d.ts`, `
    export interface Result { value: ${host === "a" ? "string" : "number"} }
    declare global { const $: { ${host}(): Result }; }
  `);
}

test("packed ESM/CJS consumers resolve optional host declarations and run without unrelated hosts or reset", (t) => {
  const w = workspace(t);
  isolatedModules(w);
  for (const host of ["a", "b"]) hostPackage(w, host);
  w.write("src/core.ts", "export function twice(value: number): number { return value * 2; }");
  for (const host of ["a", "b"]) {
    w.write(`src/${host}.ts`, `import type { Result } from "host-${host}"; export function useHost(): Result { return $.${host}(); }`);
  }
  const exportsFor = (name) => ({
    import: { types: `./dist/esm/${name}.d.ts`, default: `./dist/esm/${name}.js` },
    require: { types: `./dist/cjs/${name}.d.ts`, default: `./dist/cjs/${name}.js` },
  });
  w.json("library/package.json", {
    name: "verification-library", version: "1.0.0", type: "commonjs", files: ["dist"],
    exports: { ".": exportsFor("core"), "./host-a": exportsFor("a"), "./host-b": exportsFor("b") },
    peerDependencies: { "host-a": "*", "host-b": "*" },
    peerDependenciesMeta: { "host-a": { optional: true }, "host-b": { optional: true } },
  });
  // Each environment loads only its own ambient dependency; package assembly
  // reuses the independent outputs rather than recompiling with both globals.
  for (const name of ["core", "a", "b"]) for (const format of ["esm", "cjs"]) {
    w.config(`${name}-${format}.json`, {
      compilerOptions: {
        noEmit: false, declaration: true, rootDir: "src", outDir: `.build/${name}/${format}`,
        module: format === "esm" ? "ESNext" : "Node16",
        moduleResolution: format === "esm" ? "Bundler" : "Node16",
        tsBuildInfoFile: `.cache/${name}-${format}.tsbuildinfo`,
      },
      files: [`src/${name}.ts`], include: [],
    });
    for (let run = 0; run < 2; run++) {
      const result = w.cli("-p", `${name}-${format}.json`);
      assert.equal(result.status, 0, result.output);
    }
    for (const extension of ["js", "d.ts"]) {
      w.write(`library/dist/${format}/${name}.${extension}`, w.read(`.build/${name}/${format}/${name}.${extension}`));
    }
    assert.ok(existsSync(join(w.dir, `.cache/${name}-${format}.tsbuildinfo`)));
  }
  for (const [format, type] of [["esm", "module"], ["cjs", "commonjs"]]) w.json(`library/dist/${format}/package.json`, { type });
  const packed = w.command("npm", ["pack", "./library", "--ignore-scripts", "--json", "--pack-destination", ".cache"]);
  assert.equal(packed.status, 0, packed.output);
  const result = JSON.parse(packed.stdout);
  const entries = Array.isArray(result) ? result : result.filename ? [result] : Object.values(result);
  assert.equal(entries.length, 1, packed.stdout);
  const [metadata] = entries;
  assert.equal(typeof metadata.filename, "string", packed.stdout);
  assert.ok(metadata.files.every((file) => !file.path.includes("reset") && !file.path.startsWith("src/")));
  const tarball = join(w.dir, ".cache", metadata.filename);
  for (const host of ["a", "b"]) {
    const consumer = workspace(t);
    isolatedModules(consumer);
    hostPackage(consumer, host);
    const target = join(consumer.dir, "node_modules/verification-library");
    mkdirSync(target, { recursive: true });
    const unpacked = consumer.command("tar", ["-xzf", tarball, "-C", target, "--strip-components=1"]);
    assert.equal(unpacked.status, 0, unpacked.output);
    assert.equal(existsSync(join(consumer.dir, `node_modules/host-${host === "a" ? "b" : "a"}`)), false);
    for (const extension of ["mts", "cts"]) {
      consumer.write(`src/index.${extension}`, `
        import { twice } from "verification-library";
        import { useHost } from "verification-library/host-${host}";
        export const result: ${host === "a" ? "string" : "number"} = useHost().value;
        export const doubled: number = twice(2);
        type IsAny<T> = 0 extends (1 & T) ? true : false;
        export const resetFree: IsAny<ReturnType<typeof JSON.parse>> = true;
      `);
      consumer.config("tsconfig.json", {
        compilerOptions: { module: "NodeNext", moduleResolution: "NodeNext" },
        include: [`src/**/*.${extension}`],
      });
      const inputs = consumer.pass().files;
      const format = extension === "mts" ? "esm" : "cjs";
      assert.ok(inputs.some((file) => file.includes(`verification-library/dist/${format}/${host}.d.ts`)));
      assert.ok(!inputs.some((file) => file.includes(`host-${host === "a" ? "b" : "a"}`)));
    }
    const hostValue = host === "a" ? '"host-a"' : "7";
    for (const format of ["esm", "cjs"]) {
      const load = format === "esm"
        ? 'const core = await import("verification-library"); const adapter = await import("verification-library/host-' + host + '");'
        : 'const core = require("verification-library"); const adapter = require("verification-library/host-' + host + '");';
      const result = consumer.command(process.execPath, ["--input-type=" + (format === "esm" ? "module" : "commonjs"), "-e", `
        globalThis.$ = { ${host}: () => ({ value: ${hostValue} }) };
        ${load}
        if (core.twice(2) !== 4 || adapter.useHost().value !== ${hostValue}) throw new Error("Wrong runtime result");
      `]);
      assert.equal(result.status, 0, result.output);
    }
  }
});
