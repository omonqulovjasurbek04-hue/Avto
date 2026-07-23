// Admin routes (all require admin role).
// POST   /api/admin/scenarios     — Ssenariy yaratish/yangilash
// DELETE /api/admin/scenarios/:id — Ssenariy o'chirish
// POST   /api/admin/lessons       — Darslik yaratish/yangilash
// DELETE /api/admin/lessons/:id   — Darslik o'chirish
// GET    /api/admin/validate      — Barcha contentni tekshirish
// GET    /api/admin/stats         — Tizim statistikasi
// GET    /api/admin/users         — Foydalanuvchilar ro'yxati
import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.mjs";
import { adminLimiter } from "../middleware/rate-limit.mjs";
import * as scenarioService from "../services/scenario.service.mjs";
import * as lessonService from "../services/lesson.service.mjs";
import { sceneInfo, engine } from "../engine.mjs";
import { prisma } from "../config/database.mjs";

export const adminRoutes = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// All admin routes require authentication + admin role + rate limiting
adminRoutes.use(authenticate, requireAdmin, adminLimiter);

// ── Scenario CRUD ────────────────────────────────────────────

adminRoutes.post("/scenarios", (req, res) => {
  try {
    const data = req.body ?? {};
    if (!data.question || !data.question.text || !data.question.text.uz) {
      return res.status(400).json({ error: "Savol matni (Uzbek) kiritilishi shart" });
    }
    const saved = scenarioService.saveScenario(data);
    res.json({ ok: true, scenario: saved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

adminRoutes.delete("/scenarios/:id", (req, res) => {
  const ok = scenarioService.deleteScenario(req.params.id);
  if (!ok) return res.status(404).json({ error: "Ssenariy topilmadi" });
  res.json({ ok: true });
});

// ── Lesson CRUD ──────────────────────────────────────────────

adminRoutes.post("/lessons", (req, res) => {
  try {
    const data = req.body ?? {};
    if (!data.title || !data.description) {
      return res.status(400).json({ error: "Darslik sarlavhasi va tavsifi kiritilishi shart" });
    }
    const saved = lessonService.saveLesson(data);
    res.json({ ok: true, lesson: saved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

adminRoutes.delete("/lessons/:id", (req, res) => {
  const ok = lessonService.deleteLesson(req.params.id);
  if (!ok) return res.status(404).json({ error: "Darslik topilmadi" });
  res.json({ ok: true });
});

// ── Content Validation ───────────────────────────────────────

adminRoutes.get("/validate", (_req, res) => {
  const scenarios = scenarioService.listScenarios();
  const results = [];
  let validCount = 0;
  let warningCount = 0;

  for (const item of scenarios) {
    const raw = scenarioService.getRawScenario(item.id);
    if (!raw) {
      results.push({ id: item.id, valid: false, errors: ["Fayl topilmadi"] });
      continue;
    }
    try {
      const info = sceneInfo(raw);
      const warnings = info.warnings || [];
      const hasErrors = !info.options || Object.keys(info.options).length === 0;
      if (warnings.length > 0) warningCount += 1;
      if (!hasErrors) validCount += 1;
      results.push({
        id: item.id,
        valid: !hasErrors,
        warnings,
        optionCount: Object.keys(info.options || {}).length,
        duration: info.duration,
      });
    } catch (err) {
      results.push({ id: item.id, valid: false, errors: [err.message] });
    }
  }

  res.json({
    total: scenarios.length,
    valid: validCount,
    warnings: warningCount,
    scenarios: results,
    engineVersion: engine.version,
  });
});

// ── System Stats ─────────────────────────────────────────────

adminRoutes.get(
  "/stats",
  wrap(async (_req, res) => {
    const [scenarioCount, lessonCount, userCount, answerCount, examCount] = await Promise.all([
      scenarioService.listScenarios().length,
      lessonService.listLessons().length,
      prisma.user.count(),
      prisma.answer.count(),
      prisma.examAttempt.count(),
    ]);

    res.json({
      scenariosCount: scenarioCount,
      lessonsCount: lessonCount,
      usersCount: userCount,
      answersCount: answerCount,
      examsCount: examCount,
      engineVersion: engine.version,
      dbMode: "postgresql",
    });
  }),
);

// ── Users List ───────────────────────────────────────────────

adminRoutes.get(
  "/users",
  wrap(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locale: true,
        createdAt: true,
        _count: { select: { answers: true, examAttempts: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(users);
  }),
);
