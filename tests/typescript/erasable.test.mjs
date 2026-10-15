import assert from "node:assert/strict";
import test from "node:test";
import { blocks, workspace } from "./helpers.mjs";

test("published baseline rejects runtime-only TypeScript syntax", (t) => {
  const w = workspace(t);
  const [base] = blocks("project-configuration.md", "json").map(JSON.parse);
  assert.equal(base.compilerOptions.erasableSyntaxOnly, true);
  w.json("base.json", base);
  w.config();
  for (const source of [
    'export enum Status { Ready, Done }',
    'export const enum Status { Ready, Done }',
    'export namespace State { export const value = 1; }',
    'export class Point { constructor(public x: number) {} }',
  ]) {
    w.write("src/index.ts", source);
    w.fail(1294);
  }
  w.write("src/index.ts", `
    namespace Types { export type Value = string; }
    export const value: Types.Value = "ok";
    export const Status = { Ready: "ready", Done: "done" } as const;
    export type Status = typeof Status[keyof typeof Status];
    export class Point { x: number; constructor(x: number) { this.x = x; } }
  `);
  w.pass();
});

test("native Node strips erasable syntax but does not type-check or read tsconfig", (t) => {
  const w = workspace(t);
  w.config("tsconfig.json", { compilerOptions: { module: "NodeNext", moduleResolution: "NodeNext", verbatimModuleSyntax: true }, include: ["src/**/*.mts"] });
  w.write("src/types.mts", "export interface Value { name: string }");
  w.write("src/index.mts", `
    import type { Value } from "./types.mts";
    namespace Types { export type Name = string; }
    const name: Types.Name = "ok";
    const value: Value = { name };
    if (value.name !== "ok") throw new Error("Wrong result");
  `);
  let result = w.command(process.execPath, ["src/index.mts"]);
  assert.equal(result.status, 0, result.output);
  w.write("src/index.mts", "const value: string = 1; if (value !== 1) throw new Error('Wrong value');");
  assert.ok(w.check().codes.includes(2322));
  result = w.command(process.execPath, ["src/index.mts"]);
  assert.equal(result.status, 0, result.output);
  for (const source of ['enum Status { Ready }; console.log(Status.Ready);', 'namespace State { export const value = 1; }']) {
    w.write("src/index.mts", source);
    result = w.command(process.execPath, ["src/index.mts"]);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX/);
  }
});

test("published browser and Node leaves select their own globals and module contract", (t) => {
  const w = workspace(t);
  const configs = blocks("project-configuration.md", "json").map(JSON.parse);
  w.json("tsconfig.base.json", configs[0]);
  w.json("package.json", { type: "module" });
  w.json("browser/tsconfig.json", configs[2]);
  w.json("node/tsconfig.json", configs[3]);
  w.write("browser/index.ts", "export const title: string = document.title;");
  w.write("node/index.ts", "export const directory: string = process.cwd();");
  w.pass("browser/tsconfig.json");
  w.pass("node/tsconfig.json");
  w.write("browser/index.ts", "export const directory = process.cwd();");
  assert.ok(w.check("browser/tsconfig.json").codes.length > 0);
  w.write("node/index.ts", "export const title = document.title;");
  w.fail(2584, "node/tsconfig.json");
});
