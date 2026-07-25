import { Router } from "express";
import * as categoryService from "../services/category.service.mjs";

export const categoryRoutes = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

categoryRoutes.get(
  "/",
  wrap(async (_req, res) => {
    res.json(await categoryService.listCategories());
  }),
);

categoryRoutes.get(
  "/:id",
  wrap(async (req, res) => {
    const cat = await categoryService.getCategory(req.params.id);
    if (!cat) return res.status(404).json({ error: "Kategoriya topilmadi" });
    res.json(cat);
  }),
);

categoryRoutes.get(
  "/:id/questions",
  wrap(async (req, res) => {
    const questions = await categoryService.getCategoryQuestions(req.params.id);
    res.json(questions);
  }),
);
