import { Router } from "express";
import { z } from "zod";
import { authenticate, requireAdmin } from "../middleware/auth.mjs";
import { adminLimiter } from "../middleware/rate-limit.mjs";
import { validate } from "../middleware/validate.mjs";
import { prisma } from "../config/database.mjs";
import * as lessonService from "../services/lesson.service.mjs";

export const adminRoutes = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

adminRoutes.use(authenticate, requireAdmin, adminLimiter);

adminRoutes.get(
  "/stats",
  wrap(async (_req, res) => {
    const [categories, questions, answers, videos, testSessions, users] = await Promise.all([
      prisma.category.count(),
      prisma.question.count(),
      prisma.answer.count(),
      prisma.video.count(),
      prisma.testSession.count(),
      prisma.user.count(),
    ]);
    res.json({ categories, questions, answers, videos, testSessions, users });
  }),
);

adminRoutes.get(
  "/questions",
  wrap(async (_req, res) => {
    const questions = await prisma.question.findMany({
      include: { category: true, answers: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(questions);
  }),
);

// Question yaratish (answers bilan birga)
const createQuestionSchema = z.object({
  categoryId: z.string().uuid(),
  text: z.union([z.string(), z.object({}).passthrough()]),
  imageUrl: z.string().optional(),
  answers: z.array(z.object({
    text: z.union([z.string(), z.object({}).passthrough()]),
    isCorrect: z.boolean(),
    videoId: z.string().uuid().optional(),
  })).min(2, "Kamida 2 ta javob kiritilishi shart"),
});

adminRoutes.post(
  "/questions",
  validate({ body: createQuestionSchema }),
  wrap(async (req, res) => {
    const { categoryId, text, imageUrl, answers } = req.body;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ error: "Kategoriya topilmadi" });

    const correctCount = answers.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) return res.status(400).json({ error: "Aynan 1 ta to'g'ri javob bo'lishi kerak" });

    const question = await prisma.question.create({
      data: {
        categoryId,
        text: typeof text === "string" ? { uz: text, en: text } : text,
        imageUrl: imageUrl || null,
        answers: {
          create: answers.map((a) => ({
            text: typeof a.text === "string" ? { uz: a.text, en: a.text } : a.text,
            isCorrect: a.isCorrect,
            videoId: a.videoId || null,
          })),
        },
      },
      include: { answers: true, category: true },
    });

    res.status(201).json(question);
  }),
);

adminRoutes.patch(
  "/questions/:id",
  wrap(async (req, res) => {
    const data = req.body;
    try {
      const question = await prisma.question.update({
        where: { id: req.params.id },
        data: {
          ...(data.text && { text: typeof data.text === "string" ? { uz: data.text, en: data.text } : data.text }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        },
      });
      res.json(question);
    } catch {
      res.status(404).json({ error: "Savol topilmadi" });
    }
  }),
);

adminRoutes.delete(
  "/questions/:id",
  wrap(async (req, res) => {
    try {
      await prisma.question.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: "Savol topilmadi" });
    }
  }),
);

// Answer CRUD
adminRoutes.patch(
  "/answers/:id",
  wrap(async (req, res) => {
    const data = req.body;
    try {
      const answer = await prisma.answer.update({
        where: { id: req.params.id },
        data: {
          ...(data.text && { text: typeof data.text === "string" ? { uz: data.text, en: data.text } : data.text }),
          ...(data.isCorrect !== undefined && { isCorrect: data.isCorrect }),
          ...(data.videoId !== undefined && { videoId: data.videoId }),
        },
      });
      res.json(answer);
    } catch {
      res.status(404).json({ error: "Javob topilmadi" });
    }
  }),
);

adminRoutes.delete(
  "/answers/:id",
  wrap(async (req, res) => {
    try {
      await prisma.answer.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: "Javob topilmadi" });
    }
  }),
);

// Lesson CRUD
adminRoutes.get(
  "/lessons",
  wrap(async (_req, res) => {
    const lessons = lessonService.listLessons();
    res.json(lessons);
  }),
);

adminRoutes.post(
  "/lessons",
  wrap(async (req, res) => {
    const lesson = lessonService.saveLesson(req.body);
    res.json(lesson);
  }),
);

adminRoutes.delete(
  "/lessons/:id",
  wrap(async (req, res) => {
    const ok = lessonService.deleteLesson(req.params.id);
    if (!ok) return res.status(404).json({ error: "Darslik topilmadi" });
    res.json({ ok: true });
  }),
);

// Category CRUD
adminRoutes.post(
  "/categories",
  wrap(async (req, res) => {
    const data = req.body;
    if (!data.name || !data.slug) return res.status(400).json({ error: "name va slug kiritilishi shart" });
    const cat = await prisma.category.create({
      data: { name: typeof data.name === "string" ? { uz: data.name, en: data.name } : data.name, slug: data.slug },
    });
    res.json(cat);
  }),
);

adminRoutes.delete(
  "/categories/:id",
  wrap(async (req, res) => {
    try {
      await prisma.category.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: "Kategoriya topilmadi" });
    }
  }),
);

adminRoutes.post(
  "/videos/upload",
  wrap(async (req, res) => {
    const data = req.body;
    if (!data.url || !data.type) {
      return res.status(400).json({ error: "url va type kiritilishi shart" });
    }
    const video = await prisma.video.create({
      data: { url: data.url, type: data.type, duration: data.duration || 0, thumbnailUrl: data.thumbnailUrl },
    });
    res.json(video);
  }),
);

adminRoutes.get(
  "/videos",
  wrap(async (_req, res) => {
    const videos = await prisma.video.findMany({ orderBy: { createdAt: "desc" } });
    res.json(videos);
  }),
);

adminRoutes.get(
  "/users",
  wrap(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(users);
  }),
);
