#!/usr/bin/env node
// Copies the compiled engine bundle (dart2js output of engine_dart) into the
// JS monorepo's consumers. The bundle is the SAME artifact the browser viewer
// uses; it is built by tools/build_viewer.js. Nothing here recompiles Dart.
//
//   node tools/build_viewer.js   # (re)build frontend/editor/public/engine.js from Dart
//   node tools/sync_engine.js    # fan it out to the JS stack
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'frontend', 'editor', 'public', 'engine.js');

// Every place a JS package needs the bundle. The shared package loads it under
// Node (the server); the server also serves a copy to browser clients.
const DSTS = [
  path.join(ROOT, 'shared', 'engine-js', 'engine.js'),
  path.join(ROOT, 'backend', 'server', 'public', 'engine.js'),
  path.join(ROOT, 'frontend', 'web', 'public', 'engine.js'),
  path.join(ROOT, 'frontend', 'mobile', 'assets', 'engine.js'),
];

if (!fs.existsSync(SRC)) {
  console.error(
    `engine bundle not found at ${path.relative(ROOT, SRC)}\n` +
    `build it first:  node tools/build_viewer.js`,
  );
  process.exit(1);
}

const version = (fs.readFileSync(SRC, 'utf8').match(/engineVersion\s*=\s*["']([^"']+)["']/) || [])[1];

for (const dst of DSTS) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(SRC, dst);
  console.log(`synced engine bundle -> ${path.relative(ROOT, dst)}`);
}
if (version) console.log(`engine version: ${version}`);
