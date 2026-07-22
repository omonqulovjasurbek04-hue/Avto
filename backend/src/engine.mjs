import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BUNDLE_PATH = fileURLToPath(new URL("../public/engine.js", import.meta.url));

let _engine = null;

function loadEngine() {
  if (_engine) return _engine;

  try {
    const code = readFileSync(BUNDLE_PATH, "utf8");

    if (typeof globalThis.self === "undefined") globalThis.self = globalThis;

    (0, eval)(code);

    const api = globalThis.__yhqEngine;
    if (!api) throw new Error("engine bundle loaded but no __yhqEngine found");

    _engine = api;
    return api;
  } catch (err) {
    throw new Error(`Failed to load engine: ${err.message}`);
  }
}

export const engine = loadEngine();

export class EngineError extends Error {
  constructor(message) {
    super(message);
    this.name = "EngineError";
    this.status = 422;
  }
}

function unwrap(raw) {
  if (raw && typeof raw === "object" && "error" in raw) {
    throw new EngineError(String(raw.error));
  }
  return raw;
}

export function sceneInfo(src) {
  const result = engine.sceneInfo(src);
  return unwrap(typeof result === "string" ? JSON.parse(result) : result);
}

export function frame(src, { t = 0, option = null } = {}) {
  const raw = option == null
    ? engine.buildFrame(src, t)
    : engine.optionFrame(src, option, t);
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  return unwrap(parsed);
}
