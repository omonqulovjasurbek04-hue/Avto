// Lesson routes.
// GET /api/lessons      — Barcha darsliklar
// GET /api/lessons/:id  — Bitta darslik
import { Router } from "express";
import * as lessonService from "../services/lesson.service.mjs";

export const lessonRoutes = Router();

// List all theory lessons
lessonRoutes.get("/", (_req, res) => {
  res.json(lessonService.listLessons());
});

// Get lesson by ID
lessonRoutes.get("/:id", (req, res) => {
  const lesson = lessonService.getLessonById(req.params.id);
  if (!lesson) return res.status(404).json({ error: "Darslik topilmadi" });
  res.json(lesson);
});
