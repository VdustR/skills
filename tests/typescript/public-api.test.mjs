import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { blocks, workspace } from './helpers.mjs';

test('published API keeps inference authority and rejects dependent argument widening', t => {
  const w = workspace(t); w.config();
  const source = blocks('public-api.md', 'ts').join('\n');
  w.write('src/api.ts', source);
  w.write('src/consumer.ts', `
    import { pick, snapshot } from './api.js';
    const selected = pick(['red', 'green'], 'red');
    type Equal<A,B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
    export const exact: Equal<typeof selected, 'red' | 'green'> = true;
    // @ts-expect-error -- a dependent argument must not expand the choice set.
    pick(['red', 'green'], 'blue');
    // @ts-expect-error -- an empty literal set has no valid selection.
    pick([], 'red');
    const copy = snapshot(Object.freeze(['red', 'green']));
    // @ts-expect-error -- the public collection view is readonly.
    copy.push('blue');
  `);
  w.pass();
  w.write('src/api.ts', source.replace('selected: NoInfer<C>', 'selected: C'));
  w.fail(2578);
});

test('published snapshot isolates array storage while explicitly sharing nested objects', async t => {
  const w = workspace(t);
  w.config('tsconfig.json', { compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', noEmit: false, rootDir: 'src', outDir: 'out' }, include: ['src/**/*.mts'] });
  w.write('src/api.mts', blocks('public-api.md', 'ts').join('\n'));
  const build = w.cli('-p', 'tsconfig.json'); assert.equal(build.status, 0, build.output);
  const api = await import(pathToFileURL(join(w.dir, 'out/api.mjs')));
  assert.equal(api.pick(['red', 'green'], 'red'), 'red');
  assert.throws(() => api.pick(['red', 'green'], 'blue'), /Unknown choice/);
  assert.throws(() => api.pick([], 'red'), /Unknown choice/);
  assert.deepEqual(api.snapshot(Object.freeze(['red'])), ['red']);
  assert.deepEqual(api.snapshot([]), []);
  const item = { value: 1 }; const source = [item]; const copy = api.snapshot(source);
  source.push({ value: 2 }); assert.equal(copy.length, 1);
  item.value = 3; assert.equal(copy[0].value, 3);
  assert.equal(Object.isFrozen(copy), false);
});
