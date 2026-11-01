// Builds the single background video behind the signature-gifts section.
//
//   node scripts/build-gifts-reel.mjs          build the mp4 + poster
//   node scripts/build-gifts-reel.mjs --check  measure the built file
//
// Why this exists: the source clips swing hard in brightness (one falls from 183
// to 57 and back within a second) and differ from each other by a factor of two.
// A CSS veil only dims that swing, so the section read as flickering. Here every
// frame is graded to the SAME mean colour, the veil is baked in and the crossfades
// are rendered, including the one back to the start, so the page plays one looping
// file with no opacity changes, timers or poster swaps.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");

const SRC = "public/videos/real/";
const OUT = `${SRC}gifts-reel.mp4`;
const POSTER = `${SRC}gifts-reel-poster.jpg`;
const CLIPS = ["stargazing", "felucca", "balloon", "table", "welcome", "desert", "yoga", "coupleBalloons"];

const W = 1280;
const H = 720;
const FPS = 24;
const FRAME = W * H * 3;
const RATE = 0.6; // slower than real time, so each clip lingers
const XF = Math.round(1.1 * FPS); // crossfade length, in frames

const SATURATION = 0.55; // pulls blue skies and warm stone towards one palette
const TARGET = [50, 41, 31]; // every frame's mean R, G, B: the section's fixed tint
const KNEE = 58; // highlights roll off above this...
const CEILING = 100; // ...and never pass this, so text always stays readable

// Slightly heavier at the foot, for the text and slide controls.
const FOOT = new Float32Array(H);
for (let y = 0; y < H; y++) {
  const t = Math.max(0, (y / (H - 1) - 0.58) / 0.42);
  FOOT[y] = 1 - 0.34 * t * t;
}

const rollOff = (x) =>
  x <= KNEE ? x : KNEE + (CEILING - KNEE) * (1 - Math.exp(-(x - KNEE) / (CEILING - KNEE)));

const meanAfterGain = (hist, total, gain) => {
  let sum = 0;
  for (let v = 0; v < 256; v++) if (hist[v]) sum += hist[v] * rollOff(v * gain);
  return sum / total;
};

// The gain that lands this channel exactly on its target mean. Capped at 1 so a
// nearly black frame is never lifted into visible noise.
function solveGain(hist, total, target) {
  let lo = 0;
  let hi = 1;
  if (meanAfterGain(hist, total, hi) <= target) return hi;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (meanAfterGain(hist, total, mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function grade(frame) {
  const px = new Uint8Array(FRAME);
  const hists = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  for (let y = 0, i = 0; y < H; y++) {
    const foot = FOOT[y];
    for (let x = 0; x < W; x++, i += 3) {
      const r = frame[i];
      const g = frame[i + 1];
      const b = frame[i + 2];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const nr = ((l + (r - l) * SATURATION) * foot + 0.5) | 0;
      const ng = ((l + (g - l) * SATURATION) * foot + 0.5) | 0;
      const nb = ((l + (b - l) * SATURATION) * foot + 0.5) | 0;
      px[i] = nr;
      px[i + 1] = ng;
      px[i + 2] = nb;
      hists[0][nr]++;
      hists[1][ng]++;
      hists[2][nb]++;
    }
  }
  const total = W * H;
  const luts = hists.map((hist, c) => {
    const gain = solveGain(hist, total, TARGET[c]);
    const lut = new Uint8Array(256);
    for (let v = 0; v < 256; v++) lut[v] = Math.round(rollOff(v * gain));
    return lut;
  });
  for (let i = 0; i < FRAME; i += 3) {
    px[i] = luts[0][px[i]];
    px[i + 1] = luts[1][px[i + 1]];
    px[i + 2] = luts[2][px[i + 2]];
  }
  return px;
}

function blend(a, b, t) {
  const k = t * t * (3 - 2 * t);
  const out = new Uint8Array(FRAME);
  for (let i = 0; i < FRAME; i++) out[i] = (a[i] * (1 - k) + b[i] * k + 0.5) | 0;
  return out;
}

// Yields whole raw RGB frames from a file.
async function* decode(path, vf) {
  const proc = spawn(
    ffmpeg,
    ["-loglevel", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  let pending = Buffer.alloc(0);
  for await (const chunk of proc.stdout) {
    pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
    let at = 0;
    while (pending.length - at >= FRAME) {
      yield pending.subarray(at, at + FRAME);
      at += FRAME;
    }
    pending = Buffer.from(pending.subarray(at));
  }
}

const finished = (proc) =>
  new Promise((resolve, reject) => {
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });

async function build() {
  const encoder = spawn(
    ffmpeg,
    [
      "-y", "-loglevel", "error",
      "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-",
      // Tagged BT.709 so every browser decodes the same colours. The fine grain
      // stops banding in the dark gradients without moving the mean.
      "-vf", "noise=alls=2:allf=t,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p",
      "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-profile:v", "high", "-level", "4.0",
      "-g", "48", "-keyint_min", "24", "-x264-params", "aq-mode=3:deblock=-1,-1",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
      "-an", "-movflags", "+faststart", OUT,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = finished(encoder);
  const write = (buf) =>
    encoder.stdin.write(buf) ? Promise.resolve() : new Promise((r) => encoder.stdin.once("drain", r));

  const head = []; // start of the first clip, crossfaded into at the very end
  let tail = []; // end of the previous clip, crossfaded out of
  let frames = 0;
  for (let c = 0; c < CLIPS.length; c++) {
    const vf = `setpts=PTS/${RATE},fps=${FPS},scale=${W}:${H}`;
    const queue = [];
    let index = 0;
    for await (const raw of decode(`${SRC}${CLIPS[c]}.mp4`, vf)) {
      const graded = grade(raw);
      if (c === 0 && index < XF) {
        head.push(graded);
      } else if (c > 0 && index < XF) {
        await write(blend(tail[index], graded, (index + 1) / (XF + 1)));
        frames++;
      } else {
        queue.push(graded);
        if (queue.length > XF) {
          await write(queue.shift());
          frames++;
        }
      }
      index++;
    }
    tail = queue;
    console.log(`${CLIPS[c]}: ${index} frames`);
  }
  for (let i = 0; i < XF; i++) {
    await write(blend(tail[i], head[i], (i + 1) / (XF + 1)));
    frames++;
  }
  encoder.stdin.end();
  await done;
  console.log(`wrote ${OUT}: ${frames} frames, ${(frames / FPS).toFixed(1)}s`);

  // The poster is the file's own first frame, so nothing shifts when playback starts.
  await finished(
    spawn(ffmpeg, ["-y", "-loglevel", "error", "-i", OUT, "-frames:v", "1", "-q:v", "3", POSTER], {
      stdio: "inherit",
    }),
  );
}

// Decodes the finished file and reports how much the picture moves, frame to frame.
async function check() {
  const means = [];
  for await (const f of decode(OUT, `scale=${W}:${H}`)) {
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < FRAME; i += 3) {
      r += f[i];
      g += f[i + 1];
      b += f[i + 2];
    }
    const n = W * H;
    means.push([r / n, g / n, b / n]);
  }
  const luma = means.map(([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b);
  const report = (label, v) => {
    let step = 0;
    for (let i = 1; i < v.length; i++) step = Math.max(step, Math.abs(v[i] - v[i - 1]));
    console.log(
      `${label.padEnd(6)} min ${Math.min(...v).toFixed(2)}  max ${Math.max(...v).toFixed(2)}  largest frame-to-frame step ${step.toFixed(2)}`,
    );
  };
  console.log(`${means.length} frames`);
  report("luma", luma);
  ["red", "green", "blue"].forEach((name, c) => report(name, means.map((m) => m[c])));
  const seam = Math.abs(luma[0] - luma[luma.length - 1]);
  console.log(`loop seam (last frame to first): ${seam.toFixed(2)}`);
}

await (process.argv.includes("--check") ? check() : build());
