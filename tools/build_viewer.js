#!/usr/bin/env node
/**
 * Builds the browser scenario viewer and proves it matches the Dart engine.
 *
 *   node tools/build_viewer.js
 *   then serve frontend/editor/public/ and open viewer.html
 *
 * Steps: sync content -> compile the engine to JS -> export Dart display lists
 * -> compare the two. Everything it writes is a build artifact and git-ignored;
 * the only sources are /content and engine_dart.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = path.join(ROOT, 'engine_dart');

// The system `dart` on PATH is broken on the build machine; prefer the pinned
// toolchain when it is present (see CLAUDE.md, "Local environment notes").
const LOCAL_DART = path.join(
  ROOT,
  '.toolchain',
  'dart-sdk',
  'bin',
  process.platform === 'win32' ? 'dart.exe' : 'dart'
);
const DART = fs.existsSync(LOCAL_DART) ? LOCAL_DART : 'dart';

const run = (label, cmd, args, cwd) => {
  console.log(`\n== ${label}`);
  execFileSync(cmd, args, { cwd: cwd || ROOT, stdio: 'inherit' });
};

run('sync content', process.execPath, [path.join(__dirname, 'sync_content.js')]);

run(
  'compile engine to js',
  DART,
  ['compile', 'js', '-O2', '-o', path.join(ROOT, 'frontend', 'editor', 'public', 'engine.js'),
   path.join('web', 'engine_web.dart')],
  ENGINE
);

run(
  'export dart display lists',
  DART,
  ['run', path.join('bin', 'export_scene.dart'),
   path.join(ROOT, 'content'), path.join(ROOT, 'build', 'scenes')],
  ENGINE
);

run('verify js == dart', process.execPath, [path.join(__dirname, 'verify_js.js')]);

console.log('\nviewer ready: serve frontend/editor/public/ and open viewer.html');
