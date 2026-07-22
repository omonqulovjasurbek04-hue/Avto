#!/usr/bin/env node
/**
 * Proves the JS build of the engine agrees with the Dart VM build.
 *
 *   dart run bin/export_scene.dart ../content ../build/scenes   (in engine_dart)
 *   node tools/verify_js.js
 *
 * The editor previews scenes with the compiled-to-JS engine while the app uses
 * the Dart one. If they ever diverge, an author would sign off on a preview the
 * student never sees. This catches that at build time.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ENGINE_JS = path.join(ROOT, 'frontend', 'editor', 'public', 'engine.js');
const CONTENT = path.join(ROOT, 'content');
const EXPECTED = path.join(ROOT, 'build', 'scenes');

for (const [label, p] of [['engine.js', ENGINE_JS], ['exported scenes', EXPECTED]]) {
  if (!fs.existsSync(p)) {
    console.error(`missing ${label}: ${path.relative(ROOT, p)}`);
    console.error('run the dart compile / export steps first (see README)');
    process.exit(2);
  }
}

// dart2js targets a browser; give it just enough of one to load, plus the
// registration hook the bundle calls on startup (see web/engine_web.dart).
const sandbox = { document: { currentScript: {}, scripts: [] } };
vm.createContext(sandbox);
vm.runInContext(
  `globalThis.self = globalThis; globalThis.window = globalThis;
   globalThis.__engineRegister = (buildScene, buildFrame, sceneInfo, optionFrame, version) => {
     globalThis.engineBuildScene = buildScene;
     globalThis.engineBuildFrame = buildFrame;
     globalThis.engineSceneInfo = sceneInfo;
     globalThis.engineOptionFrame = optionFrame;
     globalThis.engineVersion = version;
   };`,
  sandbox
);
vm.runInContext(fs.readFileSync(ENGINE_JS, 'utf8'), sandbox, { filename: 'engine.js' });

if (typeof sandbox.engineBuildFrame !== 'function') {
  console.error('engine.js loaded but never called __engineRegister.');
  console.error('dart2js drops interop global writes at -O1+; see web/engine_web.dart.');
  process.exit(1);
}

// Canonical JSON: key order is an artifact of the encoder, not the scene.
const canon = (v) =>
  JSON.stringify(v, (_, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]]))
      : x
  );

let failures = 0;
let opCount = 0;
let frameCount = 0;
const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.json')).sort();

for (const file of files) {
  const scenario = fs.readFileSync(path.join(CONTENT, file), 'utf8');
  const id = JSON.parse(scenario).id;

  const expectedPath = path.join(EXPECTED, `${id}.json`);
  if (!fs.existsSync(expectedPath)) {
    console.log(`FAIL  ${id}: no exported baseline at ${path.relative(ROOT, expectedPath)}`);
    failures++;
    continue;
  }
  // The Dart baseline is a sequence of frames along the playback; the JS build
  // must reproduce each one at the same time.
  const dartFrames = JSON.parse(fs.readFileSync(expectedPath, 'utf8')).frames;

  let sceneOk = true;
  let sceneOps = 0;
  for (const dartFrame of dartFrames) {
    const t = dartFrame.t;
    const fromJs = JSON.parse(sandbox.engineBuildFrame(scenario, t));
    if (fromJs.error) {
      console.log(`FAIL  ${id} @t=${t}: engine error: ${fromJs.error}`);
      sceneOk = false;
      break;
    }

    if (canon(fromJs) !== canon(dartFrame)) {
      console.log(`FAIL  ${id} @t=${t}: JS and Dart frames differ`);
      if (fromJs.ops.length !== dartFrame.ops.length) {
        console.log(`        op count: js=${fromJs.ops.length} dart=${dartFrame.ops.length}`);
      } else {
        for (let i = 0; i < fromJs.ops.length; i++) {
          if (canon(fromJs.ops[i]) !== canon(dartFrame.ops[i])) {
            console.log(`        first difference at op ${i}:`);
            console.log(`          js:   ${canon(fromJs.ops[i]).slice(0, 160)}`);
            console.log(`          dart: ${canon(dartFrame.ops[i]).slice(0, 160)}`);
            break;
          }
        }
      }
      sceneOk = false;
      break;
    }
    sceneOps += fromJs.ops.length;
    frameCount++;
  }

  if (sceneOk) {
    opCount += sceneOps;
    console.log(`ok    ${id}  (${dartFrames.length} frames, ${sceneOps} ops identical)`);
  } else {
    failures++;
  }
}

console.log(
  `\n${files.length} scenario(s), ${frameCount} frame(s), ` +
    `${opCount} draw ops verified, ${failures} mismatch(es)`
);
process.exit(failures > 0 ? 1 : 0);
