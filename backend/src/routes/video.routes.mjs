import { Router } from "express";
import { authenticate } from "../middleware/auth.mjs";
import { prisma } from "../config/database.mjs";
import multer from "multer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const VIDEOS_DIR = fileURLToPath(new URL("../../public/videos/", import.meta.url));
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      cb(new Error("Faqat video fayllar ruxsat etilgan"));
      return;
    }
    cb(null, true);
  },
});

export const videoRoutes = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

videoRoutes.use(authenticate);

videoRoutes.post(
  "/upload",
  upload.single("video"),
  wrap(async (req, res) => {
    const { type, duration, questionId } = req.body;
    if (!req.file) return res.status(400).json({ error: "Video fayl talab qilinadi" });
    if (!["correct", "wrong"].includes(type)) return res.status(400).json({ error: "type correct yoki wrong bo'lishi kerak" });

    const video = await prisma.video.create({
      data: {
        type,
        url: `/videos/${req.file.filename}`,
        duration: parseInt(duration) || 0,
        thumbnailUrl: req.body.thumbnailUrl || null,
      },
    });

    if (questionId) {
      await prisma.answer.updateMany({
        where: { questionId },
        data: { videoId: video.id },
      });
    }

    res.json(video);
  }),
);

videoRoutes.get(
  "/",
  wrap(async (_req, res) => {
    const videos = await prisma.video.findMany({ orderBy: { createdAt: "desc" } });
    res.json(videos);
  }),
);
