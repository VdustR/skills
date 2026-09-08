#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("playwright");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const outputDir = path.resolve(process.argv[2] || "out/annotation-poc");

function timestamp(ms) {
  const value = Math.max(0, ms);
  const hours = Math.floor(value / 3_600_000);
  const minutes = Math.floor((value % 3_600_000) / 60_000);
  const seconds = Math.floor((value % 60_000) / 1_000);
  const millis = Math.floor(value % 1_000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

async function main() {
  const ffmpeg = process.env.FFMPEG || "ffmpeg";
  const encoderCheck = spawnSync(ffmpeg, ["-hide_banner", "-encoders"], { encoding: "utf8" });
  if (encoderCheck.status !== 0) throw new Error("ffmpeg is unavailable");
  if (!encoderCheck.stdout.includes("libx264")) throw new Error("ffmpeg has no libx264 encoder");

  fs.mkdirSync(outputDir, { recursive: true });
  const rawDir = path.join(outputDir, "raw");
  fs.mkdirSync(rawDir, { recursive: true });
  const cues = [];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: rawDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  const startedAt = Date.now();
  let rawPath;

  try {
    await page.setContent(`<!doctype html>
      <html><head><style>
      * { box-sizing: border-box; } html, body { margin: 0; width: 100%; height: 100%; cursor: none !important; }
      body { background: #0b1020; color: #eef2ff; font: 18px Inter, ui-sans-serif, system-ui; overflow: hidden; }
      main { width: 900px; margin: 70px auto; padding: 44px 52px; background: #151d35; border: 1px solid #334269; border-radius: 24px; box-shadow: 0 28px 80px #0008; }
      .eyebrow { color: #8ea8ff; font-size: 14px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
      h1 { margin: 12px 0 8px; font-size: 38px; } p { color: #aeb9d9; margin: 0 0 34px; }
      button { width: 100%; padding: 18px 26px; border: 1px solid #53668f; border-radius: 14px; background: #0e1528; color: #eef2ff; font: 750 18px inherit; }
      button:focus { outline: 3px solid #7c9cff; outline-offset: 4px; }
      #result { margin-top: 24px; min-height: 54px; padding: 16px 18px; border-radius: 12px; background: #0e1528; color: #9fb3ff; opacity: 0; transform: translateY(8px); transition: .25s ease; }
      #result.show { opacity: 1; transform: none; background: #17382f; color: #91f3c8; box-shadow: 0 0 0 1px #49c99566, 0 0 42px #49c99528; }
      #cursor { position: fixed; z-index: 1000; width: 30px; height: 38px; left: 0; top: 0; pointer-events: none; transform: translate(-4px,-3px); filter: drop-shadow(0 3px 5px #0009); }
      #cursor path { fill: #fff; stroke: #101522; stroke-width: 2; } #cursor.down { scale: .84; }
      .ripple { position: fixed; z-index: 999; width: 18px; height: 18px; border: 4px solid #ffd166; border-radius: 50%; pointer-events: none; translate: -50% -50%; animation: ripple .42s ease-out forwards; }
      @keyframes ripple { to { width: 70px; height: 70px; opacity: 0; } }
      #keycast { position: fixed; z-index: 1001; right: 30px; top: 28px; min-width: 180px; padding: 13px 18px; border-radius: 12px; background: #090d18e8; border: 1px solid #52638f; text-align: center; font-weight: 750; opacity: 0; transform: translateY(8px); transition: .16s ease; pointer-events: none; }
      #keycast.show { opacity: 1; transform: none; }
      #caption { position: fixed; z-index: 1001; left: 50%; bottom: 28px; translate: -50% 0; max-width: 720px; padding: 12px 22px; border-radius: 10px; background: #090d18e8; font-size: 22px; font-weight: 650; text-align: center; pointer-events: none; }
      .key { display: inline-grid; place-items: center; min-width: 34px; height: 30px; margin: 0 2px; padding: 0 8px; border: 1px solid #60719a; border-bottom-width: 3px; border-radius: 7px; background: #172139; }
      </style></head><body>
      <main><div class="eyebrow">Recording overlay PoC</div><h1>Unlock developer mode</h1><p>Enter the classic sequence without exposing a system-wide key logger.</p><button aria-label="Activate code input">Click to activate keyboard input</button><div id="result">Developer mode unlocked ✓</div></main>
      <svg id="cursor" viewBox="0 0 32 40" aria-hidden="true"><path d="M3 2 L28 24 L17 26 L23 37 L17 40 L11 28 L3 35 Z"/></svg>
      <div id="caption"></div><div id="keycast"></div>
      <script>
      const cursor = document.querySelector('#cursor'); const keycast = document.querySelector('#keycast'); const caption = document.querySelector('#caption');
      addEventListener('mousemove', e => { cursor.style.translate = e.clientX + 'px ' + e.clientY + 'px'; }, true);
      addEventListener('mousedown', e => { cursor.classList.add('down'); const r = document.createElement('div'); r.className='ripple'; r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px'; document.body.append(r); setTimeout(()=>r.remove(), 450); }, true);
      addEventListener('mouseup', () => cursor.classList.remove('down'), true);
      const expected = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      const labels = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', b: 'B', a: 'A' };
      let entered = [];
      addEventListener('keydown', event => {
        if (!labels[event.key]) return;
        event.preventDefault();
        entered.push(event.key);
        while (!expected.slice(0, entered.length).every((key, index) => key === entered[index])) entered.shift();
        keycast.innerHTML = entered.map(key => '<span class="key">' + labels[key] + '</span>').join('');
        keycast.classList.add('show');
        if (entered.length === expected.length) document.querySelector('#result').classList.add('show');
      });
      window.demo = {
        caption(value) { caption.textContent = value; },
        keycast(value) { keycast.textContent = value; keycast.classList.toggle('show', Boolean(value)); }
      };
      </script></body></html>`);

    async function say(text, holdMs) {
      const start = Date.now() - startedAt;
      await page.evaluate((value) => window.demo.caption(value), text);
      await sleep(holdMs);
      cues.push({ start, end: Date.now() - startedAt, text });
    }

    let position = { x: 160, y: 150 };
    await page.mouse.move(position.x, position.y);
    const glide = async (locator, duration = 700) => {
      const box = await locator.boundingBox();
      if (!box) throw new Error("target has no live bounding box");
      const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const steps = Math.max(3, Math.round(duration / 16.7));
      for (let index = 1; index <= steps; index += 1) {
        const progress = index / steps;
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        await page.mouse.move(position.x + (target.x - position.x) * eased, position.y + (target.y - position.y) * eased);
        await sleep(17);
      }
      position = target;
    };

    await say("Click once to scope keyboard input to the demo.", 950);
    const input = page.getByRole("button", { name: "Activate code input" });
    await glide(input);
    await page.mouse.down(); await sleep(90); await page.mouse.up();
    await say("Keycast now follows the real Konami Code events.", 900);
    for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) {
      await page.keyboard.press(key);
      await sleep(360);
    }
    await say("The complete sequence unlocks developer mode.", 1600);
    await page.evaluate(() => window.demo.keycast(""));
    await say("Cursor, keycast, and subtitles remain independent layers.", 1300);
  } finally {
    await page.evaluate(() => window.demo.caption(""));
    await sleep(250);
    await context.close();
    rawPath = await video.path();
    await browser.close();
  }

  if (!rawPath) throw new Error("Playwright did not produce a WebM file");
  const mp4 = path.join(outputDir, "konami-code-poc.mp4");
  const result = spawnSync(ffmpeg, ["-y", "-i", rawPath, "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-movflags", "+faststart", mp4], { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`ffmpeg exited with ${result.status}`);
  const vtt = ["WEBVTT", "", ...cues.flatMap((cue, index) => [String(index + 1), `${timestamp(cue.start)} --> ${timestamp(cue.end)}`, cue.text, ""])].join("\n");
  fs.writeFileSync(path.join(outputDir, "konami-code-poc.vtt"), vtt);
  console.log(mp4);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
