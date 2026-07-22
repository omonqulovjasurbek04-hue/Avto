// Unit tests for the server layer around the engine. Run: npm test --workspace @yhq/server
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { sceneInfo, frame, EngineError } from "../src/engine.mjs";
import { saveAnswer, getUserProgress } from "../src/db.mjs";

const CONTENT = fileURLToPath(new URL("../../../content/", import.meta.url));
const sc1 = readFileSync(path.join(CONTENT, "sc-0001.json"), "utf8");

test("engine classifies sc-0001: o1 clean, o2 collision", () => {
  const info = sceneInfo(sc1);
  assert.equal(info.options.o1.clean, true);
  assert.equal(info.options.o2.clean, false);
  assert.equal(info.options.o2.type, "collision");
  assert.ok(info.duration > 0);
});

test("frame() throws EngineError on an unknown option (no malformed 200)", () => {
  assert.throws(() => frame(sc1, { option: "NOPE" }), EngineError);
});

test("frame() returns a valid display list at t=0", () => {
  const f = frame(sc1, { t: 0 });
  assert.ok(Array.isArray(f.ops) && f.ops.length > 0);
  assert.ok(f.canvas > 0);
});

test("concurrent saveAnswer does not lose updates (serialized writes)", async () => {
  const uid = "test-concurrent-" + Date.now();
  await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      saveAnswer(uid, { scenarioId: "sc-0001", optionId: "o1", correct: i % 2 === 0 }),
    ),
  );
  const p = await getUserProgress(uid);
  assert.equal(p.correct + p.wrong, 20, "every concurrent write must be counted");
});
