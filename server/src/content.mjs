// Scenario content. The canonical source stays /content at the repo root — the
// single source of truth the Dart engine, validator and editor all use. The
// server reads it directly rather than keeping a second copy.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const CONTENT_DIR = fileURLToPath(new URL("../../content/", import.meta.url));

/** Raw scenario JSON *string* by id (what the engine wants). */
export function rawScenario(id) {
  if (!/^[\w-]+$/.test(id)) return null; // no path traversal
  try {
    return readFileSync(path.join(CONTENT_DIR, `${id}.json`), "utf8");
  } catch {
    return null;
  }
}

/** Parsed scenario object by id, or null. */
export function scenario(id) {
  const raw = rawScenario(id);
  return raw == null ? null : JSON.parse(raw);
}

/** Lightweight list for browsing: id, scene type, topic, localized question. */
export function listScenarios() {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const s = JSON.parse(readFileSync(path.join(CONTENT_DIR, f), "utf8"));
      return {
        id: f.replace(/\.json$/, ""),
        type: s.scene?.type,
        topic: s.topic,
        question: s.question?.text ?? {},
      };
    });
}
