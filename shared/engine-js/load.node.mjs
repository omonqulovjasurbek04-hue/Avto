import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let cached = null;

export function loadEngineNode() {
  if (cached) return cached;

  const bundlePath = fileURLToPath(new URL("./engine.js", import.meta.url));
  let code;
  try {
    code = readFileSync(bundlePath, "utf8");
  } catch {
    throw new Error(
      "engine bundle missing at shared/engine-js/engine.js — run:\n  node shared/engine-js/build.mjs",
    );
  }

  if (typeof globalThis.self === "undefined") globalThis.self = globalThis;

  (0, eval)(code);

  const api = globalThis.__yhqEngine;
  if (!api) throw new Error("engine bundle loaded but __yhqEngine not found");

  cached = api;
  return api;
}
