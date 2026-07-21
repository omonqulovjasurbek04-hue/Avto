// The engine, shared across every request. Loading it evaluates the dart2js
// bundle once; the returned functions are pure (JSON in, JSON out), so a single
// instance serves all requests. See @yhq/engine for how loading works.
import { loadEngineNode } from "@yhq/engine/node";

export const engine = loadEngineNode();

/** Parsed scene metadata for a scenario JSON string. */
export function sceneInfo(src) {
  return JSON.parse(engine.sceneInfo(src));
}

/** A single correct-answer or per-option frame, as a plain object. */
export function frame(src, { t = 0, option = null } = {}) {
  const raw = option == null ? engine.buildFrame(src, t) : engine.optionFrame(src, option, t);
  return JSON.parse(raw);
}
