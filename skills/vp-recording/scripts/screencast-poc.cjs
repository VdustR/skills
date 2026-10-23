#!/usr/bin/env node

// Records two scenes through a CDP screencast, cuts the off-camera wait between
// them, and adds a caption in post. Exits non-zero when a frame is cropped or an
// encoded clip does not match the wall-clock time it covers.
// Usage: screencast-poc.cjs <output-directory>
// Set CHANNEL=chrome to check a system browser instead of the bundled one.

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("playwright");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const outputDir = path.resolve(process.argv[2] || "out/screencast-poc");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const ffprobe = process.env.FFPROBE || "ffprobe";
const VIEWPORT = { width: 1280, height: 720 };
const FPS = 30;
const FADE = 0.3;
// Concat timestamps land on a 1/25 s grid, and CFR output adds up to one frame.
const TOLERANCE = 1 / 25 + 2 / FPS;

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr}`);
  return result.stdout;
}

function probe(file) {
  const out = run(ffprobe, ["-v", "error", "-count_frames", "-show_entries", "stream=width,height,nb_read_frames:format=duration", "-of", "json", file]);
  const { streams: [stream], format } = JSON.parse(out);
  return { width: stream.width, height: stream.height, frames: Number(stream.nb_read_frames), duration: Number(format.duration) };
}

function pngSize(file) {
  const bytes = fs.readFileSync(file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function recordScene(context, page, dir, act) {
  fs.mkdirSync(dir, { recursive: true });
  const cdp = await context.newCDPSession(page);
  const frames = [];
  let recording = true;
  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    if (recording) {
      const file = path.join(dir, `${String(frames.length).padStart(5, "0")}.png`);
      fs.writeFileSync(file, Buffer.from(data, "base64"));
      // metadata.timestamp is wall-clock seconds, comparable with Date.now() / 1000.
      frames.push({ file, time: metadata.timestamp });
    }
    // Chrome stops sending frames until each one is acknowledged.
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
  await act();
  await cdp.send("Page.stopScreencast");
  recording = false;
  const end = Date.now() / 1000;
  await cdp.detach();
  if (frames.length === 0) throw new Error(`no screencast frames in ${dir}`);
  const size = pngSize(frames[0].file);
  if (size.width !== VIEWPORT.width || size.height !== VIEWPORT.height) {
    throw new Error(`screencast frame is ${size.width}x${size.height}, viewport is ${VIEWPORT.width}x${VIEWPORT.height}`);
  }
  return { frames, span: end - frames[0].time, end };
}

function encodeScene(scene, listPath, mp4) {
  // Frames arrive only when the page changes, so hold each until the next one.
  const lines = ["ffconcat version 1.0"];
  scene.frames.forEach((frame, index) => {
    const next = index + 1 < scene.frames.length ? scene.frames[index + 1].time : scene.end;
    lines.push(`file '${frame.file}'`, `duration ${Math.max(0.001, next - frame.time).toFixed(6)}`);
  });
  // The concat demuxer drops the last entry's duration unless the file repeats.
  lines.push(`file '${scene.frames.at(-1).file}'`);
  fs.writeFileSync(listPath, `${lines.join("\n")}\n`);
  const fades = `fade=t=in:d=${FADE},fade=t=out:st=${(scene.span - FADE).toFixed(3)}:d=${FADE}`;
  // The repeated entry can stretch the final hold, so -t caps the clip at the span.
  run(ffmpeg, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listPath, "-vf", `fps=${FPS},${fades},format=yuv420p`,
    "-t", scene.span.toFixed(6), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", mp4]);
  const result = probe(mp4);
  if (Math.abs(result.duration - scene.span) > TOLERANCE) {
    throw new Error(`${path.basename(mp4)} lasts ${result.duration.toFixed(3)} s but covers ${scene.span.toFixed(3)} s`);
  }
  return result;
}

function bandHashes(inputs, filter) {
  // Hash decoded pixels in the caption band only, before any lossy encode.
  const crop = `format=yuv420p,crop=${VIEWPORT.width}:110:0:${VIEWPORT.height - 110}`;
  const out = run(ffmpeg, ["-v", "error", ...inputs, "-filter_complex", filter ? `${filter},${crop}` : crop, "-f", "framemd5", "-"]);
  return out.split("\n").filter((line) => line && !line.startsWith("#")).map((line) => line.split(",").at(-1).trim());
}

async function main() {
  const encoders = run(ffmpeg, ["-hide_banner", "-encoders"]);
  if (!encoders.includes("libx264")) throw new Error("ffmpeg has no libx264 encoder");
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {});
  const scenes = [];
  try {
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.setContent(`<!doctype html><html><body style="margin:0;height:100vh;background:#0b1020;color:#eef2ff;font:64px ui-sans-serif,system-ui">
      <main style="display:grid;place-items:center;height:100%"><output id="count">0</output></main>
      <div id="edge" style="position:fixed;left:0;right:0;bottom:0;height:8px;background:#ffd166"></div>
      </body></html>`);
    const count = (value) => page.evaluate((text) => { document.querySelector("#count").textContent = text; }, String(value));

    scenes.push(await recordScene(context, page, path.join(outputDir, "scene-1"), async () => {
      for (let value = 1; value <= 12; value += 1) { await count(value); await sleep(value % 6 === 0 ? 900 : 80); }
    }));
    // Off camera: a slow step such as waiting for a reply. It is cut, not sped up.
    await count("waiting");
    await sleep(2000);
    await count("reply");
    scenes.push(await recordScene(context, page, path.join(outputDir, "scene-2"), async () => {
      await sleep(600);
      for (let value = 13; value <= 18; value += 1) { await count(value); await sleep(120); }
      await sleep(600);
    }));

    // A caption rendered in post: a transparent full-frame PNG in the page's own fonts.
    const captionPage = await context.newPage();
    await captionPage.setContent(`<!doctype html><html><body style="margin:0;background:transparent">
      <div style="position:fixed;left:50%;bottom:28px;translate:-50% 0;padding:12px 22px;border-radius:10px;background:#090d18e8;color:#eef2ff;font:650 22px ui-sans-serif,system-ui">Added in post, no drawtext needed</div>
      </body></html>`);
    await captionPage.screenshot({ path: path.join(outputDir, "caption.png"), omitBackground: true });
  } finally {
    await browser.close();
  }

  const clips = scenes.map((scene, index) => {
    const mp4 = path.join(outputDir, `scene-${index + 1}.mp4`);
    const result = encodeScene(scene, path.join(outputDir, `scene-${index + 1}.ffconcat`), mp4);
    console.log(`scene ${index + 1}: ${scene.frames.length} source frames, span ${scene.span.toFixed(3)} s, clip ${result.duration.toFixed(3)} s`);
    return { mp4, ...result };
  });

  // Clips share codec settings, so the concat demuxer can join them without re-encoding.
  const joinList = path.join(outputDir, "join.ffconcat");
  fs.writeFileSync(joinList, `ffconcat version 1.0\n${clips.map((clip) => `file '${clip.mp4}'`).join("\n")}\n`);
  const joined = path.join(outputDir, "joined.mp4");
  run(ffmpeg, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", joinList, "-c", "copy", "-movflags", "+faststart", joined]);
  const joinedProbe = probe(joined);
  const expected = clips.reduce((sum, clip) => sum + clip.duration, 0);
  if (Math.abs(joinedProbe.duration - expected) > 1 / FPS) {
    throw new Error(`joined file lasts ${joinedProbe.duration.toFixed(3)} s, clips sum to ${expected.toFixed(3)} s`);
  }

  // Switch the caption on at an exact frame. A fade would show any text underneath through it.
  const captionFrame = Math.round(clips[0].frames + FPS * 0.5);
  const caption = path.join(outputDir, "caption.png");
  const overlay = `[0:v][1:v]overlay=enable='gte(n,${captionFrame})'`;
  const before = bandHashes(["-i", joined]);
  const after = bandHashes(["-i", joined, "-i", caption], overlay);
  const firstChanged = after.findIndex((hash, index) => hash !== before[index]);
  if (firstChanged !== captionFrame) throw new Error(`caption appeared at frame ${firstChanged}, expected ${captionFrame}`);
  const final = path.join(outputDir, "screencast-poc.mp4");
  run(ffmpeg, ["-y", "-v", "error", "-i", joined, "-i", caption, "-filter_complex", `${overlay},format=yuv420p`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", final]);

  const result = probe(final);
  console.log(`${final}: ${result.width}x${result.height}, ${result.frames} frames, ${result.duration.toFixed(3)} s, caption from frame ${captionFrame}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
