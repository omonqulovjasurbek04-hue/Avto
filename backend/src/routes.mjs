import { Router } from "express";
import { listScenarios, scenario, rawScenario, saveScenario, deleteScenario } from "./content.mjs";
import { sceneInfo, frame, engine } from "./engine.mjs";
import { getUserProgress, saveAnswer, saveExamResult, dbType } from "./db.mjs";
import { listLessons, getLessonById, saveLesson, deleteLesson } from "./lessons.mjs";
import { authRouter } from "./auth/auth.routes.mjs";
import { authMiddleware, optionalAuth } from "./auth/auth.middleware.mjs";

export const api = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Auth routes
api.use("/auth", authRouter);

// Health
api.get("/health", (_req, res) => {
  res.json({ ok: true, engine: engine?.version ?? "dev", db: dbType });
});

// Scenarios
api.get("/scenarios", (req, res) => {
  let items = listScenarios();
  if (req.query.topic) items = items.filter((s) => s.topic === req.query.topic);
  if (req.query.type) items = items.filter((s) => s.type === req.query.type);
  res.json(items);
});

api.get("/scenarios/:id", (req, res) => {
  const s = scenario(req.params.id);
  if (!s) return res.status(404).json({ error: "scenario not found" });
  res.json(s);
});

api.get("/scenarios/:id/info", wrap((req, res) => {
  const raw = rawScenario(req.params.id);
  if (!raw) return res.status(404).json({ error: "scenario not found" });
  res.json(sceneInfo(raw));
}));

api.get("/scenarios/:id/frame", wrap((req, res) => {
  const raw = rawScenario(req.params.id);
  if (!raw) return res.status(404).json({ error: "scenario not found" });
  const tRaw = Number(req.query.t ?? 0);
  const t = Number.isFinite(tRaw) ? tRaw : 0;
  const option = req.query.option ? String(req.query.option) : null;
  res.json(frame(raw, { t, option }));
}));

// Lessons
api.get("/lessons", (_req, res) => res.json(listLessons()));
api.get("/lessons/:id", (req, res) => {
  const lesson = getLessonById(req.params.id);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  res.json(lesson);
});

// Progress (user-scoped, uses optionalAuth to allow JWT-derived userId)
api.get("/progress/:userId", optionalAuth, async (req, res) => {
  if (req.userId && req.params.userId !== req.userId && req.params.userId !== "user-web") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const p = await getUserProgress(req.params.userId);
  res.json(p);
});

api.post("/progress/:userId/answer", optionalAuth, wrap(async (req, res) => {
  if (req.userId && req.params.userId !== req.userId && req.params.userId !== "user-web") {
    return res.status(403).json({ error: "Forbidden" });
  }

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
    scenarioId, optionId,
    correct: !!outcome.clean,
    outcome: outcome.clean ? null : outcome.type ?? null,
  });

  res.json({
    correct: !!outcome.clean,
    outcome: outcome.clean ? null : outcome.type,
    rule: scenario(scenarioId)?.resolution?.rule ?? null,
    progress,
  });
}));

// Exams
api.get("/exams/generate", (_req, res) => {
  const all = listScenarios();
  const count = Math.min(20, all.length);
  const selected = shuffle(all).slice(0, count);
  res.json({
    examId: `exam-gen-${Date.now()}`,
    timeLimitSeconds: 1500,
    questions: selected.map((s) => s.id),
  });
});

api.post("/exams/:userId/submit", optionalAuth, wrap(async (req, res) => {
  if (req.userId && req.params.userId !== req.userId && req.params.userId !== "user-web") {
    return res.status(403).json({ error: "Forbidden" });
  }

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
      const outcome = sceneInfo(raw).options[item.optionId];
      if (outcome && outcome.clean) { isCorrect = true; score += 1; }
      else if (outcome) outcomeType = outcome.type;
    }
    detailed.push({ scenarioId: item.scenarioId, optionId: item.optionId, correct: isCorrect, outcome: outcomeType });
  }

  const total = answers.length;
  const passed = total > 0 && score >= Math.ceil(total * 0.9);
  const result = await saveExamResult(req.params.userId, {
    score, total, passed,
    durationSeconds: durationSeconds || 0,
    details: detailed,
  });

  res.json({ passed, score, total, result });
}));

// Admin — all protected by authMiddleware
api.post("/admin/scenarios", authMiddleware, (req, res) => {
  try {
    const data = req.body ?? {};
    if (!data.question || !data.question.text || !data.question.text.uz) {
      return res.status(400).json({ error: "Savol matni (Uzbek) kiritilishi shart" });
    }
    const saved = saveScenario(data);
    res.json({ ok: true, scenario: saved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

api.delete("/admin/scenarios/:id", authMiddleware, (req, res) => {
  const ok = deleteScenario(req.params.id);
  if (!ok) return res.status(404).json({ error: "scenario not found" });
  res.json({ ok: true });
});

api.post("/admin/lessons", authMiddleware, (req, res) => {
  try {
    const data = req.body ?? {};
    if (!data.title || !data.description) {
      return res.status(400).json({ error: "Darslik sarlavhasi va tavsifi kiritilishi shart" });
    }
    const saved = saveLesson(data);
    res.json({ ok: true, lesson: saved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

api.delete("/admin/lessons/:id", authMiddleware, (req, res) => {
  const ok = deleteLesson(req.params.id);
  if (!ok) return res.status(404).json({ error: "lesson not found" });
  res.json({ ok: true });
});

api.get("/admin/validate", authMiddleware, (_req, res) => {
  const scenarios = listScenarios();
  const results = [];
  let validCount = 0;
  let warningCount = 0;

  for (const item of scenarios) {
    const raw = rawScenario(item.id);
    if (!raw) { results.push({ id: item.id, valid: false, errors: ["Missing file"] }); continue; }
    try {
      const info = sceneInfo(raw);
      const warnings = info.warnings || [];
      const hasErrors = !info.options || Object.keys(info.options).length === 0;
      if (warnings.length > 0) warningCount += 1;
      if (!hasErrors) validCount += 1;
      results.push({ id: item.id, valid: !hasErrors, warnings, optionCount: Object.keys(info.options || {}).length, duration: info.duration });
    } catch (err) {
      results.push({ id: item.id, valid: false, errors: [err.message] });
    }
  }

  res.json({ total: scenarios.length, valid: validCount, warnings: warningCount, scenarios: results, engineVersion: engine?.version ?? "dev" });
});

api.get("/admin/stats", authMiddleware, async (_req, res) => {
  const scenarios = listScenarios();
  const lessons = listLessons();
  const userProgress = await getUserProgress("user-web");
  res.json({
    scenariosCount: scenarios.length,
    lessonsCount: lessons.length,
    userAnswersCount: userProgress?.answers?.length ?? 0,
    userExamsCount: userProgress?.exams?.length ?? 0,
    engineVersion: engine?.version ?? "dev",
    dbMode: dbType,
  });
});
