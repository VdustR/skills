import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { root } from './helpers.mjs';

const phase = process.argv[2];
assert.ok(['seed', 'restore'].includes(phase), 'Use seed or restore');
const directory = join(root, '.cache/remote-verification');
const write = (path, value) => { const file = join(directory, path); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, value); };
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const build = () => {
  const start = performance.now();
  const result = spawnSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-b', join(directory, 'tsconfig.json'), '--verbose'], { encoding: 'utf8', timeout: 30_000 });
  if (result.error) throw result.error;
  console.log(JSON.stringify({ phase, elapsedMs: Math.round(performance.now() - start), status: result.status }));
  console.log(result.stdout + result.stderr);
  return { status: result.status, output: result.stdout + result.stderr };
};
const artifacts = ['shared/dist/index.js', 'shared/dist/index.d.ts', 'shared/build.tsbuildinfo', 'app/dist/index.js', 'app/dist/index.d.ts', 'app/build.tsbuildinfo'];
if (phase === 'seed') {
  write('base.json', JSON.stringify({ extends: '@tsconfig/strictest/tsconfig.json', compilerOptions: {
    target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', lib: ['ES2022'], types: [],
    composite: true, declaration: true, erasableSyntaxOnly: true, skipLibCheck: false,
  } }));
  for (const name of ['shared', 'app']) write(`${name}/tsconfig.json`, JSON.stringify({ extends: '../base.json', compilerOptions: {
    rootDir: 'src', outDir: 'dist', tsBuildInfoFile: 'build.tsbuildinfo',
  }, include: ['src/**/*.ts'], ...(name === 'app' ? { references: [{ path: '../shared' }] } : {}) }));
  write('tsconfig.json', JSON.stringify({ files: [], references: [{ path: './shared' }, { path: './app' }] }));
  write('shared/src/index.ts', 'export const value: number = 1;');
  write('app/src/index.ts', 'import { value } from "../../shared/dist/index.js"; export const result: number = value;');
  const result = build(); assert.equal(result.status, 0, result.output);
  write('manifest.json', JSON.stringify({ lock: hash(join(root, 'package-lock.json')), artifacts: Object.fromEntries(artifacts.map(file => [file, hash(join(directory, file))])) }));
} else {
  const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
  assert.equal(manifest.lock, hash(join(root, 'package-lock.json')));
  for (const [file, expected] of Object.entries(manifest.artifacts)) assert.equal(hash(join(directory, file)), expected, file);
  const restored = build(); assert.equal(restored.status, 0, restored.output);
  // A fresh npm install can make extended configs newer than restored outputs.
  // Allow compiler revalidation, but require the emitted contract to be identical.
  for (const file of artifacts.filter(file => !file.endsWith('.tsbuildinfo'))) {
    assert.equal(hash(join(directory, file)), manifest.artifacts[file], file);
  }
  const warm = build(); assert.equal(warm.status, 0, warm.output);
  assert.match(warm.output, /is up to date/);
  assert.doesNotMatch(warm.output, /Building project/);
  write('shared/src/index.ts', 'export const value: string = "changed";');
  const edited = build(); assert.notEqual(edited.status, 0, edited.output);
  assert.match(edited.output, /TS2322/);
}
