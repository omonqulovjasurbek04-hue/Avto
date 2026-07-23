// Exam routes (all authenticated).
// GET  /api/exams/generate — 20 ta random savol
// POST /api/exams/submit   — Imtihon natijasini yuborish
// GET  /api/exams/history  — Barcha imtihon natijalari
import { Router } from "express";
import { authenticate } from "../middleware/auth.mjs";
import { validate } from "../middleware/validate.mjs";
import { examSubmitSchema } from "../schemas/exam.schema.mjs";
import * as examService from "../services/exam.service.mjs";

export const examRoutes = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// All exam routes require authentication
examRoutes.use(authenticate);

// Generate exam questions
examRoutes.get("/generate", (_req, res) => {
  res.json(examService.generateExam());
});

// Submit exam
examRoutes.post(
  "/submit",
  validate({ body: examSubmitSchema }),
  wrap(async (req, res) => {
    const result = await examService.submitExam(req.user.id, req.body);
    res.json(result);
  }),
);

// Get exam history
examRoutes.get(
  "/history",
  wrap(async (req, res) => {
    const history = await examService.getExamHistory(req.user.id);
    res.json(history);
  }),
);
