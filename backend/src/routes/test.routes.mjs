import { Router } from "express";
import { authenticate } from "../middleware/auth.mjs";
import { validate } from "../middleware/validate.mjs";
import { z } from "zod";
import * as testService from "../services/test.service.mjs";

export const testRoutes = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

testRoutes.use(authenticate);

const startSchema = z.object({ categoryId: z.string().uuid() });
const answerSchema = z.object({ questionId: z.string().uuid(), answerId: z.string().uuid() });

testRoutes.post(
  "/start",
  validate({ body: startSchema }),
  wrap(async (req, res) => {
    const result = await testService.startTest(req.user.id, req.body.categoryId);
    res.json(result);
  }),
);

testRoutes.post(
  "/:id/answer",
  validate({ body: answerSchema }),
  wrap(async (req, res) => {
    const result = await testService.answerQuestion(req.params.id, req.user.id, req.body.questionId, req.body.answerId);
    res.json(result);
  }),
);

testRoutes.post(
  "/:id/finish",
  wrap(async (req, res) => {
    const result = await testService.finishTest(req.params.id, req.user.id);
    res.json(result);
  }),
);

testRoutes.get(
  "/history",
  wrap(async (req, res) => {
    res.json(await testService.getHistory(req.user.id));
  }),
);
