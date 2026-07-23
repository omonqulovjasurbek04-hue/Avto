// Scenario content. The canonical source stays /content at the repo root — the
// single source of truth the Dart engine, validator and editor all use. The
// server reads it directly rather than keeping a second copy.
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const CONTENT_DIR = fileURLToPath(new URL("../../content/", import.meta.url));

function safePath(id) {
  if (!id || !/^[\w-]+$/.test(id)) return null;
  const target = path.join(CONTENT_DIR, `${id}.json`);
  const resolved = path.resolve(target);
  const base = path.resolve(CONTENT_DIR);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    return null;
  }
  return resolved;
}

/** Raw scenario JSON *string* by id (what the engine wants). */
export function rawScenario(id) {
  const file = safePath(id);
  if (!file) return null;
  try {
    return readFileSync(file, "utf8");
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
      try {
        const s = JSON.parse(readFileSync(path.join(CONTENT_DIR, f), "utf8"));
        return {
          id: f.replace(/\.json$/, ""),
          type: s.scene?.type,
          topic: s.topic,
          question: s.question?.text ?? {},
          correct: s.question?.correct ?? "A",
          ruleCode: s.resolution?.rule?.code ?? "",
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/** Save or update scenario */
export function saveScenario(scenarioData) {
  if (!scenarioData.id) {
    const existing = listScenarios();
    const count = existing.length + 1;
    scenarioData.id = `sc-${String(count).padStart(4, "0")}`;
  }
  const file = safePath(scenarioData.id);
  if (!file) throw new Error("Invalid scenario ID format");
  writeFileSync(file, JSON.stringify(scenarioData, null, 2));
  return scenarioData;
}

/** Delete scenario */
export function deleteScenario(id) {
  const file = safePath(id);
  if (!file) return false;
  if (existsSync(file)) {
    unlinkSync(file);
    return true;
  }
  return false;
}
