import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { blocks, workspace } from './helpers.mjs';

test('compiler diagnostics and a trace measure a checked consumer without weakening its contract', t => {
  const w = workspace(t);
  w.config('tsconfig.check.json', { compilerOptions: { tsBuildInfoFile: '.cache/diagnostics.tsbuildinfo' } });
  w.write('src/api.ts', `
    export type Path<T> = { [K in Extract<keyof T,string>]: T[K] extends object ? \`\${K}.\${Path<T[K]>}\` : K }[Extract<keyof T,string>];
  `);
  w.write('src/consumer.ts', `
    import type { Path } from './api.js';
    type Model = { ${Array.from({ length: 80 }, (_, i) => `p${i}: { label: string; count: number }`).join(';')} };
    export const valid: Path<Model> = 'p79.label';
    // @ts-expect-error -- intermediate objects are not supported leaf paths.
    export const intermediate: Path<Model> = 'p79';
    // @ts-expect-error -- an unknown property must stay invalid.
    export const unknown: Path<Model> = 'missing.label';
  `);
  const commands = blocks('type-performance.md', 'bash').map(command => command.trim().split(/\s+/).slice(1));
  const baseline = w.cli(...commands[0]);
  assert.equal(baseline.status, 0, baseline.output);
  assert.match(baseline.output, /Instantiations:\s+[1-9]\d*/);
  assert.match(baseline.output, /Check time:/);
  const trace = w.cli(...commands[1], '--tsBuildInfoFile', '.cache/trace.tsbuildinfo');
  assert.equal(trace.status, 0, trace.output);
  assert.ok(existsSync(join(w.dir, '.cache/type-trace/trace.json')));
  assert.ok(existsSync(join(w.dir, '.cache/type-trace/types.json')));
  w.write('src/api.ts', 'export type Path<T> = string & { readonly unused?: T };');
  const weakened = w.cli('-p', 'tsconfig.check.json', '--extendedDiagnostics');
  assert.notEqual(weakened.status, 0);
  assert.match(weakened.output, /TS2578/);
});
