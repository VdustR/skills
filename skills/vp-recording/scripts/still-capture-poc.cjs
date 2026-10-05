#!/usr/bin/env node
// Synthetic artifact regression exercise; requires the skill's Playwright setup.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const display = { width: 480, height: 240 };

async function inspect(page, filename) {
  const bytes = await fs.readFile(filename);
  const type = bytes.subarray(0, 8).equals(pngSignature) ? 'image/png'
    : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? 'image/jpeg'
    : 'unknown';
  const dimensions = await page.evaluate(async ({ type, data }) => {
    const image = new Image();
    image.src = `data:${type};base64,${data}`;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, { type, data: bytes.toString('base64') });
  return { type, ...dimensions };
}

function validate(artifact) {
  assert.equal(artifact.type, 'image/png', 'lossless PNG required');
  assert.ok(artifact.width >= display.width * 2 && artifact.height >= display.height * 2,
    'insufficient source pixels for intended 2x display');
}

async function main() {
  if (process.argv.length !== 3) throw new Error('Usage: still-capture-poc.cjs <output-directory>');
  const output = path.resolve(process.argv[2]);
  await fs.mkdir(output, { recursive: true });
  const source = path.join(output, 'synthetic.html');
  await fs.writeFile(source, `<!doctype html><meta charset="utf-8"><title>Synthetic capture</title>
<style>body{margin:0;padding:16px;box-sizing:border-box;font:14px Arial;background:#f4f6fa;color:#17233b}
h1{font-size:20px;margin:0 0 12px}button{font:inherit;padding:6px 12px}p{margin:12px 0}img{float:right}</style>
<h1>Synthetic settings</h1><div id="state">Loading</div><script>
const illustration = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="8" fill="#2356bc"/><circle cx="32" cy="32" r="18" fill="#fff"/></svg>';
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.querySelector('#state').innerHTML = '<img alt="Generated illustration" src="data:image/svg+xml,' + encodeURIComponent(illustration) + '"><p role="status">Settings ready</p><label><input type="checkbox" checked> Enable generated alerts</label><p>Small text: saved configuration is available.</p><button>Save settings</button>';
}));</script>`);
  const browser = await chromium.launch();
  const reports = [];
  assert.throws(() => validate({ type: 'image/png', width: 960, height: 239 }), /insufficient source pixels/);
  assert.throws(() => validate({ type: 'image/png', width: 479, height: 480 }), /insufficient source pixels/);
  try {
    for (const scale of [1, 2]) {
      const context = await browser.newContext({ viewport: display, deviceScaleFactor: scale });
      try {
        const page = await context.newPage();
        await page.goto(pathToFileURL(source).href);
        await page.getByRole('status').filter({ hasText: 'Settings ready' }).waitFor();
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(Array.from(document.images, image => image.decode()));
        });
        const filename = path.join(output, `capture-${scale}x.png`);
        await page.screenshot({ path: filename, type: 'png', scale: 'device' });
        assert.equal(await page.getByRole('status').innerText(), 'Settings ready');
        const artifact = await inspect(page, filename);
        assert.equal(artifact.width, display.width * scale);
        assert.equal(artifact.height, display.height * scale);
        if (scale === 1) {
          assert.throws(() => validate(artifact), /insufficient source pixels/);
          const mislabeled = path.join(output, 'jpeg-named-png.png');
          await fs.writeFile(mislabeled, await page.screenshot({ type: 'jpeg', quality: 45, scale: 'css' }));
          const jpeg = await inspect(page, mislabeled);
          assert.equal(jpeg.type, 'image/jpeg');
          assert.throws(() => validate(jpeg), /lossless PNG required/);
          reports.push({ file: 'jpeg-named-png.png', ...jpeg, result: 'rejected: type' });
        } else {
          validate(artifact);
        }
        reports.push({ file: path.basename(filename), ...artifact, captureScale: scale,
          intendedDisplay: display, assertion: 'Settings ready',
          result: scale === 1 ? 'rejected: dimensions' : 'accepted: machine properties only' });
      } finally {
        await context.close();
      }
    }
    const preview = path.join(output, 'intended-size.html');
    await fs.writeFile(preview, `<!doctype html><meta charset="utf-8"><title>Intended display</title>
<style>body{margin:0;font:14px Arial;color:#17233b}h2{font-size:16px;margin:8px}img{display:block;width:480px;height:240px}</style>
<h2>Insufficient 1x source at intended size</h2><img src="capture-1x.png" alt="1x synthetic capture">
<h2>Valid 2x source at intended size</h2><img src="capture-2x.png" alt="2x synthetic capture">`);
    const context = await browser.newContext({ viewport: { width: 480, height: 552 }, deviceScaleFactor: 2 });
    try {
      const page = await context.newPage();
      await page.goto(pathToFileURL(preview).href);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => image.decode()));
      });
      await page.screenshot({ path: path.join(output, 'intended-size.png'), type: 'png', scale: 'device' });
    } finally {
      await context.close();
    }
    await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(reports, null, 2) + '\n');
    console.log(JSON.stringify(reports, null, 2));
    console.log('Visual readability and export routing require separate inspection and decision walkthroughs.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
