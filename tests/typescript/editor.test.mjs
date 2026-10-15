import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import test from 'node:test';
import { root, workspace } from './helpers.mjs';

test('tsserver selects nearest browser and Node projects and reports their own globals', async t => {
  const w = workspace(t);
  w.json('browser/tsconfig.json', { extends: '../base.json', compilerOptions: { lib: ['ES2022', 'DOM'], types: [], tsBuildInfoFile: '../.cache/browser' }, include: ['*.ts'] });
  w.json('node/tsconfig.json', { extends: '../base.json', compilerOptions: { types: ['node'], tsBuildInfoFile: '../.cache/node' }, include: ['*.ts'] });
  w.write('browser/index.ts', 'export const title = document.title; process.cwd();');
  w.write('node/index.ts', 'export const cwd = process.cwd(); document.title;');
  const server = spawn(process.execPath, [join(root, 'node_modules/typescript/lib/tsserver.js'), '--disableAutomaticTypingAcquisition'], { cwd: w.dir, stdio: ['pipe', 'pipe', 'pipe'] });
  t.after(() => server.kill());
  let buffer = Buffer.alloc(0), sequence = 0;
  const pending = new Map();
  server.stdout.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const boundary = buffer.indexOf('\r\n\r\n');
      if (boundary < 0) break;
      const length = Number(/Content-Length: (\d+)/i.exec(buffer.subarray(0, boundary).toString())?.[1]);
      if (!Number.isFinite(length) || buffer.length < boundary + 4 + length) break;
      const message = JSON.parse(buffer.subarray(boundary + 4, boundary + 4 + length).toString());
      buffer = buffer.subarray(boundary + 4 + length);
      if (message.type === 'response') pending.get(message.request_seq)?.(message);
    }
  });
  const request = (command, args) => new Promise((resolve, reject) => {
    const seq = ++sequence;
    const timer = setTimeout(() => { pending.delete(seq); reject(new Error(`tsserver timed out: ${command}`)); }, 30_000);
    pending.set(seq, response => { clearTimeout(timer); pending.delete(seq); response.success ? resolve(response.body) : reject(new Error(response.message)); });
    server.stdin.write(JSON.stringify({ seq, type: 'request', command, arguments: args }) + '\n');
  });
  for (const [environment, forbidden] of [['browser', 'process'], ['node', 'document']]) {
    const file = join(w.dir, environment, 'index.ts');
    await request('open', { file, projectRootPath: w.dir });
    const info = await request('projectInfo', { file, needFileNameList: true });
    assert.equal(info.configFileName, join(w.dir, environment, 'tsconfig.json'));
    const diagnostics = await request('semanticDiagnosticsSync', { file });
    assert.equal(diagnostics.length, 1, JSON.stringify(diagnostics));
    assert.match(diagnostics[0].text, new RegExp(forbidden));
  }
});
