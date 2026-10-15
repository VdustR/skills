import assert from 'node:assert/strict';
import test from 'node:test';
import { workspace } from './helpers.mjs';

for (const [name, types, source] of [
  ['jquery', ['jquery'], '$("body").addClass("jquery");'],
  ['zepto', ['zepto'], '$("body").addClass("zepto");'],
  ['lodash', ['lodash'], '_.cloneDeep({ nested: { value: 1 } });'],
  ['underscore', ['underscore'], '_.mapObject({ value: 1 }, value => value + 1);'],
]) {
  test(`real ${name} ambient declarations work in their own project`, t => {
    const w = workspace(t);
    w.config('tsconfig.json', { compilerOptions: { lib: ['ES2022', 'DOM'], types, skipLibCheck: false } });
    w.write('src/index.ts', source);
    w.pass();
  });
}

for (const types of [['jquery', 'zepto']]) {
  test(`combining ${types.join('/')} ambient declarations exposes a collision`, t => {
    const w = workspace(t);
    w.config('tsconfig.json', { compilerOptions: { lib: ['ES2022', 'DOM'], types, skipLibCheck: false } });
    w.write('src/index.ts', 'const source = 1; void source;');
    const result = w.check();
    assert.ok(result.codes.includes(2451), result.text);
    assert.match(result.text, types[0] === 'jquery' ? /\$/ : /_/);
  });
}

test('module aliases let Lodash and Underscore APIs coexist without ambient globals', t => {
  const w = workspace(t);
  w.config();
  w.write('src/index.ts', `import lodash from 'lodash';
import underscore from 'underscore';
export const cloned = lodash.cloneDeep({ nested: { value: 1 } });
export const mapped = underscore.mapObject({ value: 1 }, value => value + 1);`);
  w.pass();
});

test('Lodash and Underscore UMD declarations can select one global silently', t => {
  const w = workspace(t);
  w.config('tsconfig.json', { compilerOptions: { types: ['lodash', 'underscore'], skipLibCheck: false } });
  w.write('src/index.ts', '_.cloneDeep({ value: 1 });');
  w.pass();
  w.write('src/index.ts', '_.mapObject({ value: 1 }, (value: number) => value + 1);');
  w.fail(2339);
});
