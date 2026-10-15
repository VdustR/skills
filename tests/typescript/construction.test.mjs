import assert from 'node:assert/strict';
import test from 'node:test';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { blocks, workspace } from './helpers.mjs';

test('published conditional fragments reject additions in both branches, including empty ones', t => {
  const w = workspace(t); w.config();
  const source = blocks('consumer-contracts.md', 'ts')[1];
  const write = text => w.write('src/index.ts', `${text}\nexport { props };`);
  write(source); w.pass();
  const active = source.replace('onClick: () => {}', 'onClick: () => {}, typo: true');
  write(active); w.fail(2353);
  const inactive = source.replace('({} satisfies Partial<Props>)', '({ typo: true } satisfies Partial<Props>)');
  assert.notEqual(inactive, source); write(inactive); w.fail(2353);
  write(inactive.replace('({ typo: true } satisfies Partial<Props>)', '({ typo: true })'));
  w.pass();
});

test('published fragments preserve the intended active and inactive button behavior', async t => {
  const w = workspace(t);
  w.config('tsconfig.json', { compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', noEmit: false, rootDir: 'src', outDir: 'out' }, include: ['src/**/*.mts'] });
  const source = blocks('consumer-contracts.md', 'ts')[1];
  w.write('src/active.mts', `${source}\nexport { props };`);
  w.write('src/inactive.mts', `${source.replace('const action = true', 'const action = false')}\nexport { props };`);
  const result = w.cli('-p', 'tsconfig.json'); assert.equal(result.status, 0, result.output);
  const active = await import(pathToFileURL(join(w.dir, 'out/active.mjs')));
  const inactive = await import(pathToFileURL(join(w.dir, 'out/inactive.mjs')));
  assert.equal(active.props.disabled, false);
  assert.equal(typeof active.props.onClick, 'function');
  assert.deepEqual(inactive.props, { disabled: true });
});
