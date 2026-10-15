import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export { ts };
export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const skill = join(root, "skills/vp-typescript-best-practices");

export function blocks(reference, language) {
  return [...readFileSync(join(skill, "references", reference), "utf8")
    .matchAll(new RegExp("```" + language + "\\n([\\s\\S]*?)```", "g"))]
    .map((match) => match[1]);
}

export function workspace(t) {
  const dir = mkdtempSync(join(tmpdir(), "vp-typescript-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  symlinkSync(join(root, "node_modules"), join(dir, "node_modules"), "junction");
  const write = (file, content) => {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  };
  const json = (file, value) => write(file, JSON.stringify(value, null, 2));
  const read = (file) => readFileSync(join(dir, file), "utf8");
  json("base.json", {
    extends: "@tsconfig/strictest/tsconfig.json",
    compilerOptions: {
      target: "ES2022", module: "ESNext", moduleResolution: "Bundler",
      lib: ["ES2022"], types: [], noEmit: true, incremental: true,
      tsBuildInfoFile: ".cache/check.tsbuildinfo", skipLibCheck: false,
    },
  });
  const config = (file = "tsconfig.json", overrides = {}) => json(file, {
    extends: "./base.json", include: ["src/**/*.ts"], ...overrides,
  });
  const parse = (file = "tsconfig.json") => {
    const configPath = join(dir, file);
    const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
      ...ts.sys, onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      },
    });
    assert.ok(parsed, `Cannot parse ${file}`);
    assert.deepEqual(parsed.errors, [], `Config errors in ${file}`);
    return parsed;
  };
  const check = (file = "tsconfig.json") => {
    const parsed = parse(file);
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    return {
      diagnostics, codes: diagnostics.map((d) => d.code),
      text: ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => dir,
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => "\n",
      }),
      files: program.getSourceFiles().map((source) => relative(dir, source.fileName).replaceAll("\\", "/")),
    };
  };
  const command = (executable, args) => {
    const result = spawnSync(executable, args, {
      cwd: dir, encoding: "utf8", timeout: 30_000,
      env: { ...process.env, NO_COLOR: "1" },
    });
    if (result.error) throw result.error;
    return { status: result.status, stdout: result.stdout, stderr: result.stderr, output: result.stdout + result.stderr };
  };
  const cli = (...args) => command(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), ...args]);
  const pass = (file) => {
    const result = check(file);
    assert.deepEqual(result.codes, [], result.text);
    return result;
  };
  const fail = (code, file) => {
    const result = check(file);
    assert.ok(result.codes.includes(code), `Expected TS${code}:\n${result.text}`);
    return result;
  };
  return { dir, write, json, read, config, parse, check, command, cli, pass, fail };
}
