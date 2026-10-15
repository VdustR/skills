import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import test from 'node:test';
import { blocks, root, workspace } from './helpers.mjs';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= join(root, '.cache/playwright');
const { chromium } = await import('playwright');

test('real Chromium executes isolated browser output and restores shared globals', async t => {
  const w = workspace(t);
  w.json('package.json', { type: 'module' });
  w.json('tsconfig.base.json', JSON.parse(blocks('project-configuration.md', 'json')[0]));
  const browserConfig = JSON.parse(blocks('project-configuration.md', 'json')[2]);
  browserConfig.compilerOptions = { ...browserConfig.compilerOptions, noEmit: false, outDir: '../dist/browser', rootDir: '.' };
  w.json('browser/tsconfig.json', browserConfig);
  const nodeConfig = JSON.parse(blocks('project-configuration.md', 'json')[3]);
  nodeConfig.compilerOptions = { ...nodeConfig.compilerOptions, noEmit: false, outDir: '../dist/node', rootDir: '.' };
  w.json('node/tsconfig.json', nodeConfig);
  w.write('browser/index.ts', 'document.body.dataset["runtime"] = "browser"; export {};');
  w.write('node/index.ts', 'console.log(process.release.name); export {};');
  for (const leaf of ['browser', 'node']) {
    const result = w.cli('-p', `${leaf}/tsconfig.json`);
    assert.equal(result.status, 0, result.output);
  }
  const execution = w.command(process.execPath, ['dist/node/index.js']);
  assert.equal(execution.status, 0, execution.output);
  assert.equal(execution.stdout.trim(), 'node');
  const routes = new Map([
    ['/', ['text/html', '<!doctype html><body><div id="result"></div><script type="module" src="/app.js"></script></body>']],
    ['/app.js', ['text/javascript', w.read('dist/browser/index.js')]],
    ...[['zepto', 'zepto/dist/zepto.js'], ['jquery', 'jquery/dist/jquery.js'], ['lodash', 'lodash/lodash.js'], ['underscore', 'underscore/underscore-umd.js']]
      .map(([name, path]) => [`/${name}.js`, ['text/javascript', readFileSync(join(root, 'node_modules', path), 'utf8')]]),
  ]);
  const server = createServer((request, response) => {
    const route = routes.get(request.url);
    response.writeHead(route ? 200 : 404, { 'Content-Type': route?.[0] ?? 'text/plain' });
    response.end(route?.[1] ?? 'Not found');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const url = `http://127.0.0.1:${server.address().port}`;
  await page.goto(url);
  await page.waitForFunction(() => document.body.dataset.runtime === 'browser');
  await page.addScriptTag({ url: `${url}/zepto.js` });
  await page.addScriptTag({ url: `${url}/jquery.js` });
  const dollar = await page.evaluate(() => {
    const overwritten = window.$ === window.jQuery && window.$ !== window.Zepto;
    const jquery = window.jQuery.noConflict(true);
    const restored = window.$ === window.Zepto;
    jquery('#result').addClass('jquery');
    window.Zepto('#result').addClass('zepto');
    return { overwritten, restored, classes: document.querySelector('#result').className };
  });
  assert.deepEqual(dollar, { overwritten: true, restored: true, classes: 'jquery zepto' });
  await page.addScriptTag({ url: `${url}/lodash.js` });
  await page.evaluate(() => { window.lodashAlias = window._; });
  await page.addScriptTag({ url: `${url}/underscore.js` });
  const underscore = await page.evaluate(() => {
    const overwritten = window._ !== window.lodashAlias;
    const underscore = window._.noConflict();
    const original = { nested: { value: 1 } };
    const cloned = window._.cloneDeep(original);
    return { overwritten, restored: window._ === window.lodashAlias,
      independent: cloned.nested !== original.nested,
      mapped: underscore.mapObject({ value: 1 }, value => value + 1),
      missingBeforeRestore: typeof underscore.cloneDeep };
  });
  assert.deepEqual(underscore, { overwritten: true, restored: true, independent: true, mapped: { value: 2 }, missingBeforeRestore: 'undefined' });
  assert.deepEqual(errors, []);
});
