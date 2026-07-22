// Progress routes (all authenticated).
// GET  /api/progress        — Foydalanuvchi progressi
// GET  /api/progress/stats  — Faqat statistika
// POST /api/progress/answer — Javob yozish
import { Router } from "express";
import { authenticate } from "../middleware/auth.mjs";
import { validate } from "../middleware/validate.mjs";
import { answerSchema } from "../schemas/progress.schema.mjs";
import * as progressService from "../services/progress.service.mjs";
import * as scenarioService from "../services/scenario.service.mjs";
import { sceneInfo } from "../engine.mjs";

export const progressRoutes = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// All progress routes require authentication
progressRoutes.use(authenticate);

// Get full progress (answers + stats)
progressRoutes.get(
  "/",
  wrap(async (req, res) => {
    const progress = await progressService.getUserProgress(req.user.id);
    res.json(progress);
  }),
);

// Get stats only (lighter response)
progressRoutes.get(
  "/stats",
  wrap(async (req, res) => {
    const stats = await progressService.getProgressStats(req.user.id);
    res.json(stats);
  }),
);

// Record an answer (engine evaluates correctness — client never asserts it)
progressRoutes.post(
  "/answer",
  validate({ body: answerSchema }),
  wrap(async (req, res) => {
    const { scenarioId, optionId } = req.body;

    const raw = scenarioService.getRawScenario(scenarioId);
    if (!raw) return res.status(404).json({ error: "Ssenariy topilmadi" });

    const info = sceneInfo(raw); // throws EngineError → 422
    const outcome = info.options[optionId];
    if (!outcome) return res.status(400).json({ error: "Noma'lum optionId" });

    const isCorrect = !!outcome.clean;
    const outcomeType = isCorrect ? null : outcome.type ?? null;

    const answer = await progressService.saveAnswer(req.user.id, {
      scenarioId,
      optionId,
      isCorrect,
      outcome: outcomeType,
    });

    const scenario = scenarioService.getScenario(scenarioId);

    res.json({
      correct: isCorrect,
      outcome: outcomeType,
      rule: scenario?.resolution?.rule ?? null,
      answer,
    });
  }),
);
