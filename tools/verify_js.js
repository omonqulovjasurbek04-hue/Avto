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
const ENGINE_JS = path.join(ROOT, 'editor', 'public', 'engine.js');
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
   globalThis.__engineRegister = (buildScene, version) => {
     globalThis.engineBuildScene = buildScene;
     globalThis.engineVersion = version;
   };`,
  sandbox
);
vm.runInContext(fs.readFileSync(ENGINE_JS, 'utf8'), sandbox, { filename: 'engine.js' });

if (typeof sandbox.engineBuildScene !== 'function') {
  console.error('engine.js loaded but never called __engineRegister.');
  console.error('dart2js drops interop global writes at -O1+; see web/engine_web.dart.');
  process.exit(1);
}

let failures = 0;
let opCount = 0;
const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.json')).sort();

for (const file of files) {
  const scenario = fs.readFileSync(path.join(CONTENT, file), 'utf8');
  const id = JSON.parse(scenario).id;

  const fromJs = JSON.parse(sandbox.engineBuildScene(scenario));
  if (fromJs.error) {
    console.log(`FAIL  ${id}: engine error: ${fromJs.error}`);
    failures++;
    continue;
  }

  const expectedPath = path.join(EXPECTED, `${id}.json`);
  if (!fs.existsSync(expectedPath)) {
    console.log(`FAIL  ${id}: no exported baseline at ${path.relative(ROOT, expectedPath)}`);
    failures++;
    continue;
  }
  const fromDart = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));

  // Canonical JSON on both sides: key order is an artifact of the encoder,
  // not of the scene.
  const canon = (v) =>
    JSON.stringify(v, (_, x) =>
      x && typeof x === 'object' && !Array.isArray(x)
        ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]]))
        : x
    );

  if (canon(fromJs) !== canon(fromDart)) {
    console.log(`FAIL  ${id}: JS and Dart display lists differ`);
    if (fromJs.ops.length !== fromDart.ops.length) {
      console.log(`        op count: js=${fromJs.ops.length} dart=${fromDart.ops.length}`);
    } else {
      for (let i = 0; i < fromJs.ops.length; i++) {
        if (canon(fromJs.ops[i]) !== canon(fromDart.ops[i])) {
          console.log(`        first difference at op ${i}:`);
          console.log(`          js:   ${canon(fromJs.ops[i]).slice(0, 160)}`);
          console.log(`          dart: ${canon(fromDart.ops[i]).slice(0, 160)}`);
          break;
        }
      }
    }
    failures++;
    continue;
  }

  opCount += fromJs.ops.length;
  console.log(`ok    ${id}  (${fromJs.ops.length} ops identical)`);
}

console.log(
  `\n${files.length} scenario(s), ${opCount} draw ops verified, ${failures} mismatch(es)`
);
process.exit(failures > 0 ? 1 : 0);
