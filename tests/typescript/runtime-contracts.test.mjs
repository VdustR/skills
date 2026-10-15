import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { blocks, workspace } from './helpers.mjs';

async function compiled(w, source) {
  w.config('tsconfig.json', { compilerOptions: { types: ['node'], module: 'NodeNext', moduleResolution: 'NodeNext', noEmit: false, rootDir: 'src', outDir: 'out' }, include: ['src/**/*.mts'] });
  w.write('src/index.mts', source);
  const build = w.cli('-p', 'tsconfig.json'); assert.equal(build.status, 0, build.output);
  return import(pathToFileURL(join(w.dir, 'out/index.mjs')));
}

test('published guards preserve both branches and numeric selection boundaries', async t => {
  const w = workspace(t); const guards = await compiled(w, blocks('runtime-schemas.md', 'ts')[0]);
  for (const value of [0, -9.5, 9.5]) assert.equal(guards.isSmallNumber(value), true);
  for (const value of ['1', '', null, undefined, 10, -10, 100, NaN, Infinity, -Infinity]) assert.equal(guards.isSmallNumber(value), false);
  for (const value of [100, NaN, Infinity]) assert.equal(guards.isNumber(value), true);
  assert.equal(guards.isNumber('100'), false);
});

test('a subset predicate can compile while misclassifying the false branch at runtime', async t => {
  const w = workspace(t); const module = await compiled(w, `
    function small(value: string | number): value is number { return typeof value === 'number' && Math.abs(value) < 10; }
    export function describe(value: string | number) { if (small(value)) return value.toFixed(); return value.toUpperCase(); }
  `);
  assert.equal(module.describe('ok'), 'OK');
  assert.throws(() => module.describe(100), /toUpperCase/);
});

test('published parsing contract validates normalized output and rejects coercion and unknown keys', async t => {
  const w = workspace(t); const { User } = await compiled(w, blocks('runtime-schemas.md', 'ts')[1]);
  assert.deepEqual(User.parse({ id: ' a ', age: 0 }), { id: 'a', age: 0 });
  assert.deepEqual(User.parse({ id: 'a' }), { id: 'a' });
  for (const value of [null, {}, { id: ' ' }, { id: 1 }, { id: 'a', extra: 1 }, { id: 'a', age: '1' }, { id: 'a', age: -1 }, { id: 'a', age: 1.5 }, { id: 'a', age: null }]) assert.equal(User.safeParse(value).success, false);
});

test('schema policy choices and transform order change observable output', async t => {
  const w = workspace(t); const schema = await compiled(w, `
    import { z } from 'zod';
    export const strip = z.object({ id: z.string() });
    export const retain = z.looseObject({ id: z.string() });
    export const convert = z.coerce.boolean();
    export const before = z.string().min(1).trim();
    export const after = z.string().trim().min(1);
  `);
  assert.deepEqual(schema.strip.parse({ id: 'a', extra: 1 }), { id: 'a' });
  assert.deepEqual(schema.retain.parse({ id: 'a', extra: 1 }), { id: 'a', extra: 1 });
  assert.equal(schema.convert.parse('false'), true);
  assert.equal(schema.before.parse(' '), '');
  assert.equal(schema.after.safeParse(' ').success, false);
});

test('assertion signatures require an independently valid runtime failure path', async t => {
  const w = workspace(t); const module = await compiled(w, `
    function checked(value: unknown): asserts value is number { if (typeof value !== 'number') throw new Error('Not a number'); }
    function unchecked(_value: unknown): asserts _value is number {}
    export function safe(value: unknown) { checked(value); return value.toFixed(); }
    export function unsafe(value: unknown) { unchecked(value); return value.toFixed(); }
  `);
  assert.equal(module.safe(1), '1');
  assert.throws(() => module.safe('bad'), /Not a number/);
  assert.throws(() => module.unsafe('bad'), /toFixed/);
});
