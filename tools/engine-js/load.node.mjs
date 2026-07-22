// Loads the compiled Dart engine under Node.
//
// The bundle is dart2js output built for browsers: it reaches for `self` and
// hands its exports to a host-provided `__engineRegister` hook (see
// engine_dart/web/engine_web.dart and the repo README for why it does not
// assign globals directly). We give it both and capture the registration.
//
// The result is memoised: the bundle registers global functions once per
// process, so re-evaluating it is wasteful and pointless.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let cached = null;

/** @returns {import("./types.d.ts").EngineApi} */
export function loadEngineNode() {
  if (cached) return cached;

  const bundlePath = fileURLToPath(new URL("./engine.js", import.meta.url));
  let code;
  try {
    code = readFileSync(bundlePath, "utf8");
  } catch {
    throw new Error(
      "engine bundle missing at shared/engine-js/engine.js — run:\n" +
        "  node tools/build_viewer.js && node tools/sync_engine.js",
    );
  }

  // Browser globals the bundle expects.
  if (typeof globalThis.self === "undefined") globalThis.self = globalThis;

  let api = null;
  const prev = globalThis.__engineRegister;
  globalThis.__engineRegister = (buildScene, buildFrame, sceneInfo, optionFrame, version) => {
    api = { buildScene, buildFrame, sceneInfo, optionFrame, version };
  };
  try {
    // Indirect eval so the bundle runs in global scope, as in a <script> tag.
    (0, eval)(code);
  } finally {
    globalThis.__engineRegister = prev;
  }

  if (!api) throw new Error("engine bundle loaded but never called __engineRegister");
  cached = api;
  return api;
}
