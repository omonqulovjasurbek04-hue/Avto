// Scenario routes.
// GET /api/scenarios           — Barcha ssenariylar ro'yxati
// GET /api/scenarios/:id       — Bitta ssenariy (to'liq JSON)
// GET /api/scenarios/:id/info  — Engine metadata
// GET /api/scenarios/:id/frame — Frame/kadr olish
import { Router } from "express";
import * as scenarioService from "../services/scenario.service.mjs";
import { sceneInfo, frame } from "../engine.mjs";

export const scenarioRoutes = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// List scenarios (optional ?topic= or ?type= filtering)
scenarioRoutes.get("/", (req, res) => {
  const items = scenarioService.listScenarios({
    topic: req.query.topic,
    type: req.query.type,
  });
  res.json(items);
});

// Get full scenario JSON
scenarioRoutes.get("/:id", (req, res) => {
  const s = scenarioService.getScenario(req.params.id);
  if (!s) return res.status(404).json({ error: "Ssenariy topilmadi" });
  res.json(s);
});

// Engine-computed metadata: correct-answer duration + per-option outcomes
scenarioRoutes.get(
  "/:id/info",
  wrap((req, res) => {
    const raw = scenarioService.getRawScenario(req.params.id);
    if (!raw) return res.status(404).json({ error: "Ssenariy topilmadi" });
    res.json(sceneInfo(raw));
  }),
);

// Single frame: ?t=<sec>&option=<id>
scenarioRoutes.get(
  "/:id/frame",
  wrap((req, res) => {
    const raw = scenarioService.getRawScenario(req.params.id);
    if (!raw) return res.status(404).json({ error: "Ssenariy topilmadi" });
    const tRaw = Number(req.query.t ?? 0);
    const t = Number.isFinite(tRaw) ? tRaw : 0;
    const option = req.query.option ? String(req.query.option) : null;
    res.json(frame(raw, { t, option }));
  }),
);
