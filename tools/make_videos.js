#!/usr/bin/env node
// Encodes a deterministic MP4 per scenario, straight from the engine:
//   engine_dart/bin/render_frames.dart  -> PNG sequence (the SAME ScenePlayer
//   the app uses) -> ffmpeg -> server/public/videos/<id>.mp4
//
// Nothing is hand-authored or stock; every pixel comes from the engine, so the
// videos cannot drift from the interactive playback.
//
//   node tools/make_videos.js              # all scenarios
//   node tools/make_videos.js sc-0001      # just these ids
//
// Config via env: DART, FFMPEG (paths/commands), FPS (30), SIZE (640).
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'server', 'public', 'videos');
const DART = process.env.DART || path.join(ROOT, '.toolchain', 'dart-sdk', 'bin', 'dart.exe');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FPS = process.env.FPS || '30';
const SIZE = process.env.SIZE || '640';

fs.mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
let files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.json')).sort();
if (only.length) files = files.filter((f) => only.includes(f.replace(/\.json$/, '')));

let ok = 0;
let failed = 0;
for (const f of files) {
  const id = f.replace(/\.json$/, '');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `yhqframes-${id}-`));
  try {
    execFileSync(DART, ['run', 'bin/render_frames.dart', path.join(CONTENT, f), tmp, FPS, SIZE], {
      cwd: path.join(ROOT, 'engine_dart'),
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    execFileSync(
      FFMPEG,
      [
        '-y', '-loglevel', 'error',
        '-framerate', FPS,
        '-i', path.join(tmp, 'frame_%05d.png'),
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart',
        path.join(OUT, `${id}.mp4`),
      ],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
    const kb = (fs.statSync(path.join(OUT, `${id}.mp4`)).size / 1024).toFixed(0);
    console.log(`✓ ${id}.mp4  (${kb} KB)`);
    ok++;
  } catch (e) {
    console.error(`✗ ${id}: ${e.message}`);
    failed++;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
console.log(`\n${ok} video(s) -> server/public/videos/${failed ? `, ${failed} failed` : ''}`);
