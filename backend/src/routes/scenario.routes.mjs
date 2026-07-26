import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.mjs";
import * as scenarioService from "../services/scenario.service.mjs";

const frameQuerySchema = z.object({
  t: z.string().transform(Number).pipe(z.number().min(0)),
  option: z.string().optional(),
});

export const scenarioRoutes = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/scenarios - Get all scenarios
scenarioRoutes.get("/", wrap(async (req, res) => {
  const { topic } = req.query;
  const scenarios = await scenarioService.listScenarios({ topic });
  res.json(scenarios);
}));

// GET /api/scenarios/:id - Get specific scenario
scenarioRoutes.get("/:id", wrap(async (req, res) => {
  const scenario = await scenarioService.getScenario(req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json(scenario);
}));

// GET /api/scenarios/:id/info - Get scenario info (duration, options)
scenarioRoutes.get("/:id/info", wrap(async (req, res) => {
  const info = await scenarioService.getScenarioInfo(req.params.id);
  if (!info) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json(info);
}));

// GET /api/scenarios/:id/frame - Get frame data
scenarioRoutes.get("/:id/frame", validate({ query: frameQuerySchema }), wrap(async (req, res) => {
  const { t, option } = req.query;
  const frame = await scenarioService.getFrame(req.params.id, t, option);
  if (!frame) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json(frame);
}));