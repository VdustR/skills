#!/usr/bin/env node
'use strict';

// Uses an existing Playwright package and its browsers; never installs software.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { pathToFileURL } = require('node:url');

function contrast(foreground, background) {
  const luminance = color => {
    const channels = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
    if (!channels) throw new Error(`Only opaque computed sRGB is supported: ${color}`);
    return channels.slice(1).reduce((sum, channel, index) => {
      const c = Number(channel) / 255;
      if (c < 0 || c > 1) throw new Error('sRGB channel out of range');
      return sum + [0.2126, 0.7152, 0.0722][index] * (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    }, 0);
  };
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function main() {
  const [moduleRoot, outputDirectory, engineNames = 'chromium'] = process.argv.slice(2);
  if (!moduleRoot || !outputDirectory) {
    throw new Error('Usage: probe-css.cjs <playwright-package-directory> <output-directory> [chromium,firefox,webkit]');
  }
  const output = path.resolve(outputDirectory);
  fs.mkdirSync(output, { recursive: true });
  const fixture = path.resolve(__dirname, '../assets/behavior-lab.html');
  const contentFixture = path.resolve(__dirname, '../assets/content-lab.html');
  const report = {
    fixtures: ['assets/behavior-lab.html', 'assets/content-lab.html'],
    recordedAt: new Date().toISOString(), status: 'running',
    requestedEngines: engineNames.split(','),
    sourceHashes: Object.fromEntries([fixture, contentFixture, __filename].map(file => [
      path.relative(path.resolve(__dirname, '..'), file), createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    ])), engines: [],
  };
  const save = () => fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  // Replace any prior success before loading dependencies or launching an engine.
  save();
  try {
    const playwright = require(path.resolve(moduleRoot));
    for (const name of report.requestedEngines) {
      const result = { name, checks: [], contrast: [], screenshots: [] };
      let browser;
      try {
        if (!['chromium', 'firefox', 'webkit'].includes(name)) throw new Error(`Unknown engine: ${name}`);
        browser = await playwright[name].launch({ headless: true });
        result.version = browser.version();
        const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
        await page.goto(pathToFileURL(fixture).href);
        const css = (selector, property) => page.locator(selector).evaluate((el, prop) => getComputedStyle(el)[prop], property);
        const check = (label, actual, expected) => { assert.deepEqual(actual, expected, label); result.checks.push({ label, actual }); };
        const measureText = async state => {
          const foreground = await css('#enabled', 'color');
          const background = await css('#enabled', 'backgroundColor');
          const ratio = contrast(foreground, background);
          result.contrast.push({ state, foreground, background, ratio, threshold: 4.5 });
          check(`${state}: ordinary text contrast`, ratio >= 4.5, true);
        };
        const capture = async (label, locator) => {
          const filename = `${name}-${label}.png`;
          if (locator) {
            await locator.scrollIntoViewIfNeeded();
            const box = await locator.boundingBox();
            // Include outward outlines; an element-only crop would hide focus evidence.
            const padding = 10;
            const x = Math.max(0, box.x - padding), y = Math.max(0, box.y - padding);
            await page.screenshot({ path: path.join(output, filename), clip: {
              x, y, width: box.x + box.width + padding - x, height: box.y + box.height + padding - y,
            } });
          } else await page.screenshot({ path: path.join(output, filename), fullPage: true });
          result.screenshots.push(filename);
        };
        check('explicit compound targets parent', await css('#parent', 'borderTopWidth'), '7px');
        check('luminance reference black-white', contrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)'), 21);
        check('luminance reference equal colors', contrast('rgb(23, 78, 166)', 'rgb(23, 78, 166)'), 1);
        check('do not round 777-on-white up to passing', contrast('rgb(119, 119, 119)', 'rgb(255, 255, 255)') < 4.5, true);
        check('descendant does not get compound border', await css('#child', 'borderTopWidth'), '0px');
        check('explicit descendant targets child', await css('#child', 'borderBottomWidth'), '5px');
        check('parent does not get descendant border', await css('#parent', 'borderBottomWidth'), '0px');
        check('direct child target', await css('#child', 'paddingInlineStart'), '13px');
        check('following sibling target', await css('#sibling', 'paddingInlineStart'), '17px');
        check('missing variable uses fallback', await css('#missing', 'color'), 'rgb(23, 78, 166)');
        check('invalid token does not use fallback or previous declaration', await css('#invalid', 'color'), 'rgb(23, 33, 43)');
        check('normal unlayered wins', await css('#layer-normal', 'color'), 'rgb(23, 33, 43)');
        check('important layered wins', await css('#layer-important', 'color'), 'rgb(23, 78, 166)');
        check('mixed nesting list raises specificity', await css('#specificity', 'color'), 'rgb(23, 78, 166)');
        for (const kind of ['flex', 'grid', 'cards']) {
          const overflows = suffix => page.locator(`#${kind}-${suffix}`).evaluate(el => el.scrollWidth > el.clientWidth + 1);
          check(`${kind}: negative control overflows`, await overflows('bad'), true);
          check(`${kind}: remedy contains content`, await overflows('good'), false);
        }
        check('hidden scroll container moves', await page.locator('#hidden').evaluate(el => { el.scrollTop = 40; return el.scrollTop > 0; }), true);
        check('clip cannot scroll', await page.locator('#clip').evaluate(el => { el.scrollTop = 40; return el.scrollTop; }), 0);
        const button = page.locator('#enabled');
        await measureText('default');
        await capture('default', button);
        const normalBackground = await css('#enabled', 'backgroundColor');
        await button.hover();
        check('enabled hover changes background', await css('#enabled', 'backgroundColor'), 'rgb(16, 59, 128)');
        await measureText('hover');
        await capture('hover', button);
        await button.hover();
        await page.mouse.down();
        try {
          check('active wins over simultaneous hover', await css('#enabled', 'backgroundColor'), 'rgb(9, 38, 83)');
          await measureText('active');
          await capture('active', button);
        } finally { await page.mouse.up(); }
        await page.reload();
        await page.keyboard.press('Tab');
        check('keyboard reaches enabled button', await page.evaluate(() => document.activeElement.id), 'enabled');
        check('focus-visible outline exists', await css('#enabled', 'outlineWidth'), '3px');
        await measureText('focus');
        const ring = await css('#enabled', 'outlineColor');
        const adjacent = await css('body', 'backgroundColor');
        const ringRatio = contrast(ring, adjacent);
        result.contrast.push({ state: 'focus-ring-on-flat-body', foreground: ring, background: adjacent, ratio: ringRatio, threshold: 3 });
        check('focus ring contrast against known adjacent surface', ringRatio >= 3, true);
        const geometry = await button.boundingBox();
        result.targetSize = { width: geometry.width, height: geometry.height };
        check('synthetic action meets stronger 44px target', geometry.width >= 44 && geometry.height >= 44, true);
        await capture('focus', button);
        await page.keyboard.press('Tab');
        check('tab skips native and inherited disabled', await page.evaluate(() => document.activeElement.id), 'after-disabled');
        // macOS WebKit may omit links from Tab traversal depending on platform settings.
        await page.locator('#aria').focus();
        check('ARIA disabled still matches not disabled', await page.locator('#aria').evaluate(el => el.matches(':not(:disabled)')), true);
        await page.keyboard.press('Enter');
        check('ARIA alone does not block activation', await page.evaluate(() => globalThis.activations), 1);
        for (const id of ['disabled', 'inherited']) {
          const locator = page.locator(`#${id}`);
          const before = await css(`#${id}`, 'backgroundColor');
          await locator.hover();
          check(`${id}: hover does not alter background`, await css(`#${id}`, 'backgroundColor'), before);
          const box = await locator.boundingBox();
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          try { check(`${id}: active does not alter background`, await css(`#${id}`, 'backgroundColor'), before); }
          finally { await page.mouse.up(); }
          check(`${id}: native activation blocked`, await page.evaluate(() => globalThis.activations), 1);
        }
        await capture('disabled', page.locator('#disabled'));
        await page.emulateMedia({ reducedMotion: 'reduce' });
        check('reduced motion disables authored transition', await css('#enabled', 'transitionDuration'), '0s');
        await page.emulateMedia({ forcedColors: 'active' });
        await page.reload();
        await page.keyboard.press('Tab');
        result.forcedColorsEmulated = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
        if (result.forcedColorsEmulated) {
          check('forced-colors focus retains outline', await css('#enabled', 'outlineStyle'), 'solid');
          check('forced-colors boundary retains border', await css('#enabled', 'borderTopStyle'), 'solid');
          await capture('forced-colors', page.locator('section').first());
        } else result.forcedColorsGap = 'This engine did not activate forced-colors emulation.';
        await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
        await page.setViewportSize({ width: 390, height: 844 });
        await capture('mobile');
        check('normal background recorded', normalBackground, 'rgb(23, 78, 166)');

        await page.goto(pathToFileURL(contentFixture).href);
        for (const width of [320, 390, 1100]) {
          await page.setViewportSize({ width, height: 850 });
          const sizes = await page.evaluate(() => ({
            document: document.documentElement.scrollWidth,
            viewport: innerWidth,
            panel: document.getElementById('bounded').getBoundingClientRect().width,
            parent: document.getElementById('size-host').clientWidth,
          }));
          check(`${width}px: panel respects containing width`, sizes.panel <= sizes.parent + 1, true);
          check(`${width}px: intentional local overflow does not widen page`, sizes.document <= sizes.viewport + 1, true);
        }
        // A narrow parent inside a wide viewport is a distinct constraint from mobile.
        await page.locator('#size-host').evaluate(el => { el.style.inlineSize = '240px'; });
        check('240px parent in wide viewport bounds panel', await page.locator('#bounded').evaluate(el => el.getBoundingClientRect().width <= 240), true);
        await page.locator('#text-policies').evaluate(el => { el.style.inlineSize = '240px'; });
        await page.locator('#scrolling').evaluate(el => { el.style.inlineSize = '240px'; });
        check('240px parent is independent of desktop viewport', await page.evaluate(() => innerWidth === 1100 && document.getElementById('text-policies').clientWidth === 240), true);
        await page.setViewportSize({ width: 320, height: 850 });
        const overflow = selector => page.locator(selector).evaluate(el => ({
          x: el.scrollWidth > el.clientWidth + 1, y: el.scrollHeight > el.clientHeight + 1,
        }));
        check('conflicting minimum overrides maximum: negative control', (await overflow('#bounds-negative')).x, true);
        check('fixed height clips line box: negative control', (await overflow('#glyph-bad')).y, true);
        check('intrinsic glyph line avoids vertical overflow', (await overflow('#glyph-good')).y, false);
        check('mixed-script line remains contained', await overflow('#glyph-scripts'), { x: false, y: false });
        await capture('content-glyph-clipped', page.locator('#glyph-bad'));
        await capture('content-glyph-preserved', page.locator('#glyph-good'));
        check('unbroken token wraps without lost inline content', await overflow('#wrap'), { x: false, y: false });
        check('one-line preview has genuine inline overflow', (await overflow('#single')).x, true);
        check('one-line preview declares ellipsis', await css('#single', 'textOverflow'), 'ellipsis');
        check('one-line preview does not vertically clip line box', (await overflow('#single')).y, false);
        check('short value does not overflow', await overflow('#short'), { x: false, y: false });
        const clampSupported = await page.evaluate(() => CSS.supports('-webkit-line-clamp', '3'));
        result.legacyClampSupported = clampSupported;
        if (clampSupported) {
          check('multi-line preview keeps its three-line budget', await page.locator('#multi').evaluate(el => el.clientHeight <= parseFloat(getComputedStyle(el).lineHeight) * 3 + 1), true);
        } else check('unsupported clamp preserves complete wrapping', await overflow('#multi'), { x: false, y: false });
        await capture('content-previews', page.locator('#text-policies'));
        for (const id of ['single', 'multi']) {
          const disclosure = page.locator(`#${id}-details`);
          const summary = disclosure.locator('summary');
          await summary.focus();
          await page.keyboard.press('Enter');
          check(`${id}: keyboard opens full-content disclosure`, await disclosure.evaluate(el => el.open), true);
          check(`${id}: focus stays on disclosure trigger`, await summary.evaluate(el => el === document.activeElement), true);
          check(`${id}: reveal contains same full value`, await page.locator(`#${id}-full`).textContent(), await page.locator(`#${id}`).textContent());
          check(`${id}: revealed content is not clipped`, await overflow(`#${id}-full`), { x: false, y: false });
          await page.keyboard.press('Enter');
          check(`${id}: keyboard closes disclosure`, await disclosure.evaluate(el => el.open), false);
          await summary.click();
          check(`${id}: pointer opens disclosure`, await disclosure.evaluate(el => el.open), true);
        }
        await capture('content-revealed', page.locator('#text-policies'));
        await page.evaluate(() => globalThis.setPanelEntries(1));
        check('short panel content has no unnecessary overflow', await overflow('#scroll-body'), { x: false, y: false });
        await page.evaluate(() => globalThis.setPanelEntries(30));
        check('long panel content scrolls only vertically', await overflow('#scroll-body'), { x: false, y: true });
        check('shell does not become a second scroller', await overflow('#scroll-shell'), { x: false, y: false });
        await page.locator('#scroll-body').focus();
        await page.keyboard.press('End');
        await page.waitForFunction(() => {
          const el = document.getElementById('scroll-body');
          return el.scrollTop > 0 && Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 2;
        }, null, { timeout: 3000 });
        check('keyboard reaches final panel entry', await page.locator('#scroll-body').evaluate(el => el.scrollTop > 0), true);
        await page.keyboard.press('Tab');
        check('keyboard leaves scroll region for final action', await page.evaluate(() => document.activeElement.id), 'panel-action');
        check('final action stays inside bounded shell', await page.locator('#panel-action').evaluate(el => {
          const action = el.getBoundingClientRect(), shell = document.getElementById('scroll-shell').getBoundingClientRect();
          return action.top >= shell.top && action.bottom <= shell.bottom + 1;
        }), true);
        check('code owns local horizontal scroll without vertical overflow', await overflow('#code-scroll'), { x: true, y: false });
        await capture('content-scroll', page.locator('#scrolling'));
        await page.addStyleTag({ content: 'body { font-size: 32px; } p, .glyph { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-block-end: 2em !important; }' });
        for (const selector of ['#wrap', '#glyph-good', '#glyph-scripts', '#single-full', '#multi-full']) {
          check(`${selector}: spacing and larger base text stay contained`, await overflow(selector), { x: false, y: false });
        }
        check('spacing override does not widen document', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        await capture('content-spacing', page.locator('#glyphs'));
        result.contentEvidenceLimit = 'Larger authored base text and spacing overrides are synthetic stress cases, not actual browser zoom or glyph-ink proof. Ellipsis/clamp paint still needs visual inspection.';
        result.status = 'passed';
      } catch (error) {
        result.status = 'failed';
        result.error = error.stack;
        throw error;
      } finally {
        report.engines.push(result);
        save();
        if (browser) await browser.close();
      }
    }
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    report.error = error.stack;
    throw error;
  } finally { save(); }
  console.log(JSON.stringify(report.engines.map(({ name, version, checks, status }) => ({ name, version, checks: checks.length, status })), null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
