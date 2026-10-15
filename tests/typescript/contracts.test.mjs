import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { z } from "zod";
import { blocks, workspace } from "./helpers.mjs";

test("published TypeScript examples compile under strictest", (t) => {
  const w = workspace(t);
  w.config();
  const consumer = blocks("consumer-contracts.md", "ts");
  assert.equal(consumer.length, 2);
  w.write("src/consumer.ts", `${consumer.join("\n")}\nvoid direct; void mapped; void props; export {};`);
  w.write("src/exhaustive.ts", `${blocks("union-exhaustive.md", "ts").join("\n")}\nexport { area };`);
  w.write("src/types.test-d.ts", `${blocks("type-testing.md", "ts").join("\n")}\nexport {};`);
  w.pass();
});

test("map returns and spread branches catch excess fields that outer checks accept", (t) => {
  const w = workspace(t);
  w.config();
  const shape = `type Item = { value: string }; const values = ["a"];\n`;
  w.write("src/index.ts", `${shape}
    export const mapped: Item[] = values.map(value => ({ value, typo: true }));
    export const spread = { ...(true ? { value: "a", typo: true } : {}) } satisfies Partial<Item>;
  `);
  w.pass();
  w.write("src/index.ts", `${shape}
    export const mapped = values.map((value): Item => ({ value, typo: true }));
    export const spread = { ...(true ? ({ value: "a", typo: true } satisfies Partial<Item>) : {}) };
  `);
  const errors = w.fail(2353);
  assert.equal(errors.diagnostics.filter((d) => d.code === 2353).length, 2);
});

test("JSX spreads need literal checks and union props need the selected variant", (t) => {
  const w = workspace(t);
  w.config("tsconfig.json", { compilerOptions: { jsx: "preserve" }, include: ["src/**/*.tsx"] });
  const common = `
    declare namespace JSX { interface Element {} }
    type Props = { disabled: boolean; onClick?: () => void };
    declare function Button(props: Props): JSX.Element;
  `;
  w.write("src/index.tsx", `${common} export const view = <Button {...{ disabled: true, typo: true }} />;`);
  w.pass();
  w.write("src/index.tsx", `${common} export const view = <Button {...({ disabled: true, typo: true } satisfies Partial<Props>)} />;`);
  w.fail(2353);
  w.write("src/index.tsx", `
    type Props = { kind: "link"; href: string } | { kind: "button"; onClick: () => void };
    export const broad = { onClick() {} } satisfies Partial<Props>;
    export const narrow = { onClick() {} } satisfies Partial<Extract<Props, { kind: "link" }>>;
  `);
  w.fail(2353);
});

test("satisfies accepts structural values and broad index signatures", (t) => {
  const w = workspace(t);
  w.config();
  w.write("src/index.ts", `
    type Item = { id: string };
    const existing = { id: "a", extra: 1 };
    export const structural = existing satisfies Item;
    export const indexed = { id: "a", extra: 1 } satisfies { [key: string]: unknown };
    export const precise = ["a", "b"] as const satisfies readonly string[];
    export const primitive: {} = 1;
    export const wrong: object = 1;
  `);
  w.fail(2322);
  w.write("src/index.ts", w.read("src/index.ts").replace("export const wrong: object = 1;", ""));
  w.pass();
});

test("exhaustiveness rejects a new variant and runtime fallback throws", async (t) => {
  const w = workspace(t);
  const source = blocks("union-exhaustive.md", "ts").join("\n");
  w.config("tsconfig.json", {
    compilerOptions: { noEmit: false, module: "NodeNext", moduleResolution: "NodeNext", rootDir: "src", outDir: "out" },
    include: ["src/**/*.mts"],
  });
  w.write("src/shape.mts", `${source}\nexport { area };`);
  const build = w.cli("-p", "tsconfig.json");
  assert.equal(build.status, 0, build.output);
  const { area } = await import(pathToFileURL(join(w.dir, "out/shape.mjs")));
  assert.equal(area({ kind: "square", side: 3 }), 9);
  assert.throws(() => area({ kind: "triangle", side: 3 }), /Unhandled shape/);
  w.write("src/shape.mts", `${source.replace('type Shape = ', 'type Shape = { kind: "triangle"; side: number } | ')}\nexport { area };`);
  w.fail(1360);
});

test("schema input, output, enum source and runtime rejection agree", (t) => {
  const Schema = z.string().transform((value) => value.length);
  assert.equal(Schema.parse("hello"), 5);
  assert.equal(Schema.safeParse(1).success, false);
  const Status = z.enum(["ready", "done"]);
  assert.deepEqual(Status.options, ["ready", "done"]);
  const w = workspace(t);
  w.config("tsconfig.json", { compilerOptions: { types: ["node"] } });
  w.write("src/index.ts", `
    import { z } from "zod";
    const Schema = z.string().transform(value => value.length);
    type Input = z.input<typeof Schema>;
    type Output = z.output<typeof Schema>;
    type Inferred = z.infer<typeof Schema>;
    export const input: Input = "hello";
    export const output: Output = 5;
    export const inferred: Inferred = output;
    // @ts-expect-error -- transforms do not accept their output as raw input.
    export const badInput: Input = output;
    // @ts-expect-error -- inferred type is output, not input.
    export const badOutput: Inferred = input;
  `);
  w.pass();
});

test("negative tests must execute and mutual assignability is not exact identity", (t) => {
  const w = workspace(t);
  w.config();
  w.write("src/index.test-d.ts", `
    declare const narrow: { id: string };
    declare const extra: { id: string; optional?: number };
    narrow satisfies typeof extra;
    extra satisfies typeof narrow;
    // @ts-expect-error -- ID must be a string.
    ({ id: 1 } satisfies typeof narrow);
    export {};
  `);
  w.pass();
  w.write("src/index.test-d.ts", w.read("src/index.test-d.ts").replace("id: 1", 'id: "a"'));
  w.fail(2578);
});

test("indexed narrowing, generics, branding and finite template contracts reject invalid states", (t) => {
  const w = workspace(t);
  w.config();
  w.write("src/index.ts", `
    declare const brand: unique symbol;
    type UserId = string & { readonly [brand]: true };
    function parseUserId(raw: unknown): UserId {
      if (typeof raw !== "string" || !raw.startsWith("user-")) throw new Error("Invalid ID");
      return raw as UserId;
    }
    export const id = parseUserId("user-1");
    // @ts-expect-error -- unvalidated strings are not branded.
    export const invalidId: UserId = "user-1";
    function first<T>(values: T[]): T | undefined { return values[0]; }
    export const value: number | undefined = first([1]);
    // @ts-expect-error -- indexed access might be undefined.
    export const missing: number = [1][2];
    type Event = \`user:\${"created" | "deleted"}\`;
    export const event: Event = "user:created";
    // @ts-expect-error -- finite events exclude unknown names.
    export const badEvent: Event = "user:changed";
  `);
  w.pass();
});

test("contextual literal inference and inferred filter predicates match compiler behavior", (t) => {
  const w = workspace(t);
  w.config();
  w.write("src/index.ts", `
    const context = { active: true } satisfies { active: boolean };
    // @ts-expect-error -- satisfies supplies contextual typing and can retain true.
    context.active = false;
    const filtered = [1, undefined].filter(value => value !== undefined);
    export const numbers: number[] = filtered;
    export const kept = [1, undefined].flatMap(value => value === undefined ? [] : [value]);
  `);
  w.pass();
});

test("Zod v3 and v4 share parsed values but not schema objects", (t) => {
  const w = workspace(t);
  w.config("tsconfig.json", { compilerOptions: { types: ["node"] } });
  w.write("src/index.ts", `
    import * as z3 from "zod/v3";
    import { z } from "zod";
    const legacy = z3.string();
    const modern = z.string();
    export const parsed: string = modern.parse(legacy.parse("ok"));
    function legacyConsumer(schema: z3.ZodTypeAny) { return schema; }
    // @ts-expect-error -- major-version schema objects have different contracts.
    legacyConsumer(modern);
  `);
  w.pass();
});


test("type assertions erase while schema validation and branding guards run", async (t) => {
  const w = workspace(t);
  w.config("tsconfig.json", {
    compilerOptions: { noEmit: false, module: "NodeNext", moduleResolution: "NodeNext", rootDir: "src", outDir: "out" },
    include: ["src/**/*.mts"],
  });
  w.write("src/runtime.mts", `
    type User = { email: string };
    export const asserted = JSON.parse('{"wrong":true}') as User;
    declare const brand: unique symbol;
    export type UserId = string & { readonly [brand]: true };
    export function parseUserId(raw: unknown): UserId {
      if (typeof raw !== "string" || !raw.startsWith("user-")) throw new Error("Invalid ID");
      return raw as UserId;
    }
  `);
  const result = w.cli("-p", "tsconfig.json");
  assert.equal(result.status, 0, result.output);
  const runtime = await import(pathToFileURL(join(w.dir, "out/runtime.mjs")));
  assert.equal(runtime.asserted.email, undefined);
  assert.equal(runtime.parseUserId("user-1"), "user-1");
  assert.throws(() => runtime.parseUserId(1), /Invalid ID/);
  assert.throws(() => runtime.parseUserId("other-1"), /Invalid ID/);
});
