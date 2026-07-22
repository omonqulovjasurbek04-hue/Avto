// The engine, shared across every request. Loading it evaluates the dart2js
// bundle once; the returned functions are pure (JSON in, JSON out), so a single
// instance serves all requests. See @yhq/engine for how loading works.
import { loadEngineNode } from "@yhq/engine/node";

export const engine = loadEngineNode();

/** Thrown when the engine returns its {error} sentinel (bad scenario/option). */
export class EngineError extends Error {
  constructor(message) {
    super(message);
    this.name = "EngineError";
    this.status = 422;
  }
}

// The engine_web bundle catches everything and returns {"error": "..."} rather
// than a valid frame/info (see engine_dart/web/engine_web.dart). Callers must
// not treat that shape as a result — surface it as an error instead.
function unwrap(raw) {
  const parsed = JSON.parse(raw);
  if (parsed && typeof parsed === "object" && "error" in parsed) {
    throw new EngineError(String(parsed.error));
  }
  return parsed;
}

/** Parsed scene metadata for a scenario JSON string. */
export function sceneInfo(src) {
  return unwrap(engine.sceneInfo(src));
}

/** A single correct-answer or per-option frame, as a plain object. */
export function frame(src, { t = 0, option = null } = {}) {
  const raw = option == null ? engine.buildFrame(src, t) : engine.optionFrame(src, option, t);
  return unwrap(raw);
}
