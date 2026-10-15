import assert from 'node:assert/strict';
import test from 'node:test';
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
