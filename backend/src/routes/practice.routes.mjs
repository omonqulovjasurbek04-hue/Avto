// Practice routes — xavfsiz javob tekshirish
// GET /api/categories/:id/questions dan isCorrect YASHIRILGAN
// Bu endpoint faqat tanlangan javobni tekshiradi
import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.mjs";
import { optionalAuth } from "../middleware/auth.mjs";
import * as practiceService from "../services/practice.service.mjs";

export const practiceRoutes = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const checkSchema = z.object({
  questionId: z.string().uuid(),
  answerId: z.string().uuid(),
});

practiceRoutes.post(
  "/check",
  optionalAuth,
  validate({ body: checkSchema }),
  wrap(async (req, res) => {
    const { isCorrect, correctAnswerId } = await practiceService.checkAnswer(
      req.body.questionId,
      req.body.answerId,
    );
    res.json({ isCorrect, correctAnswerId });
  }),
);
