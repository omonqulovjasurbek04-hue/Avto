import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authMiddleware } from "./auth.middleware.mjs";
import { findJsonUser, findJsonUserById, createJsonUser } from "../db.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const secretPath = path.join(__dirname, "../../.jwt_secret");
  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, "utf8").trim();
    }
    const secret = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(secretPath, secret, { mode: 0o600 });
    return secret;
  } catch {
    return crypto.randomBytes(32).toString("hex");
  }
}

export const JWT_SECRET = getJwtSecret();
const SALT_ROUNDS = 10;

export const authRouter = Router();

let prisma = null;
async function getDb() {
  if (!prisma && process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      prisma = new PrismaClient();
    } catch {
      return null;
    }
  }
  return prisma;
}

authRouter.post("/register", async (req, res) => {
  try {
    const { phone, email, password, name } = req.body ?? {};

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" });
    }

    if (!phone && !email) {
      return res.status(400).json({ error: "Telefon nomer yoki email kiritilishi shart" });
    }

    const conditions = [];
    if (phone) conditions.push({ phone });
    if (email) conditions.push({ email });

    const db = await getDb();

    if (db) {
      const existing = await db.user.findFirst({
        where: { OR: conditions },
      });
      if (existing) return res.status(409).json({ error: "Bunday foydalanuvchi allaqachon mavjud" });

      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await db.user.create({ data: { phone, email, password: hashed, name } });

      const token = jwt.sign({ userId: user.id, phone: user.phone, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: "30d" });

      return res.status(201).json({
        token,
        user: { id: user.id, phone: user.phone, email: user.email, name: user.name, role: user.role || 'USER' },
      });
    } else {
      // JSON Fallback
      const existing = findJsonUser({ phone, email });
      if (existing) return res.status(409).json({ error: "Bunday foydalanuvchi allaqachon mavjud" });

      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await createJsonUser({ phone, email, password: hashed, name });

      const token = jwt.sign({ userId: user.id, phone: user.phone, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: "30d" });

      return res.status(201).json({
        token,
        user: { id: user.id, phone: user.phone, email: user.email, name: user.name, role: user.role || 'USER' },
      });
    }
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Ro'yxatdan o'tishda xatolik yuz berdi" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { phone, email, password } = req.body ?? {};

    if (!password || (!phone && !email)) {
      return res.status(400).json({ error: "Telefon/email va parol kiritilishi shart" });
    }

    const conditions = [];
    if (phone) conditions.push({ phone });
    if (email) conditions.push({ email });

    const db = await getDb();
    let user = null;

    if (db) {
      user = await db.user.findFirst({ where: { OR: conditions } });
    } else {
      user = findJsonUser({ phone, email });
    }

    if (!user) return res.status(401).json({ error: "Telefon/email yoki parol xato" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Telefon/email yoki parol xato" });

    const token = jwt.sign({ userId: user.id, phone: user.phone, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      user: { id: user.id, phone: user.phone, email: user.email, name: user.name, role: user.role || 'USER' },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Kirishda xatolik yuz berdi" });
  }
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    let user = null;

    if (db) {
      user = await db.user.findUnique({ where: { id: req.userId } });
    } else {
      user = findJsonUserById(req.userId);
    }

    if (!user) return res.status(404).json({ error: "Foydalanuvchi topilmadi" });

    res.json({ id: user.id, phone: user.phone, email: user.email, name: user.name, role: user.role || 'USER' });
  } catch (err) {
    res.status(401).json({ error: "Yaroqsiz token" });
  }
});
