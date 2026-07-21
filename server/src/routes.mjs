// REST API endpoints for scenarios, engine frames, user progress, exams, and stats.
import { Router } from "express";
import { listScenarios, scenario, rawScenario } from "./content.mjs";
import { sceneInfo, frame, engine } from "./engine.mjs";
import { getUserProgress, saveAnswer, saveExamResult, dbType } from "./db.mjs";

export const api = Router();

api.get("/health", (_req, res) => {
  res.json({ ok: true, engine: engine.version, db: dbType });
});

// Browse scenario list (supports optional ?topic= or ?type= filtering)
api.get("/scenarios", (req, res) => {
  let items = listScenarios();
  if (req.query.topic) {
    items = items.filter((s) => s.topic === req.query.topic);
  }
  if (req.query.type) {
    items = items.filter((s) => s.type === req.query.type);
  }
  res.json(items);
});

// Full scenario JSON
api.get("/scenarios/:id", (req, res) => {
  const s = scenario(req.params.id);
  if (!s) return res.status(404).json({ error: "scenario not found" });
  res.json(s);
});

// Engine-computed metadata: correct-answer duration + per-option outcomes
api.get("/scenarios/:id/info", (req, res) => {
  const raw = rawScenario(req.params.id);
  if (!raw) return res.status(404).json({ error: "scenario not found" });
  res.json(sceneInfo(raw));
});

// Single frame thumbnail / preview: ?t=<sec>&option=<id>
api.get("/scenarios/:id/frame", (req, res) => {
  const raw = rawScenario(req.params.id);
  if (!raw) return res.status(404).json({ error: "scenario not found" });
  const t = Number(req.query.t ?? 0);
  const option = req.query.option ? String(req.query.option) : null;
  res.json(frame(raw, { t, option }));
});

// Get user progress & statistics
api.get("/progress/:userId", async (req, res) => {
  const p = await getUserProgress(req.params.userId);
  res.json(p);
});

// Record an answer (Engine evaluates correctness)
api.post("/progress/:userId/answer", async (req, res) => {
  const { scenarioId, optionId } = req.body ?? {};
  if (!scenarioId || !optionId) {
    return res.status(400).json({ error: "scenarioId and optionId are required" });
  }
  const raw = rawScenario(scenarioId);
  if (!raw) return res.status(404).json({ error: "scenario not found" });

  const info = sceneInfo(raw);
  const outcome = info.options[optionId];
  if (!outcome) return res.status(400).json({ error: "unknown optionId" });

  const progress = await saveAnswer(req.params.userId, {
    scenarioId,
    optionId,
    correct: !!outcome.clean,
    outcome: outcome.clean ? null : outcome.type ?? null,
  });

  res.json({
    correct: !!outcome.clean,
    outcome: outcome.clean ? null : outcome.type,
    rule: scenario(scenarioId)?.resolution?.rule ?? null,
    progress,
  });
});

// Generate random Exam setup (e.g. 20 scenarios, or all available if fewer)
api.get("/exams/generate", (_req, res) => {
  const all = listScenarios();
  // Shuffle array deterministically or randomly
  const shuffled = [...all].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 20);
  res.json({
    examId: `exam-gen-${Date.now()}`,
    timeLimitSeconds: 1200, // 20 minutes
    questions: selected.map((s) => s.id),
  });
});

// Submit exam completion
api.post("/exams/:userId/submit", async (req, res) => {
  const { answers, durationSeconds } = req.body ?? {};
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "answers array is required" });
  }

  let score = 0;
  const detailed = [];

  for (const item of answers) {
    const raw = rawScenario(item.scenarioId);
    let isCorrect = false;
    let outcomeType = null;
    if (raw) {
      const info = sceneInfo(raw);
      const outcome = info.options[item.optionId];
      if (outcome && outcome.clean) {
        isCorrect = true;
        score += 1;
      } else if (outcome) {
        outcomeType = outcome.type;
      }
    }
    detailed.push({
      scenarioId: item.scenarioId,
      optionId: item.optionId,
      correct: isCorrect,
      outcome: outcomeType,
    });
  }

  const passed = score >= 18; // 18/20 is passing score in Uzbekistan YHQ
  const result = await saveExamResult(req.params.userId, {
    score,
    total: answers.length,
    passed,
    durationSeconds: durationSeconds || 0,
    details: detailed,
  });

  res.json({ passed, score, total: answers.length, result });
});
