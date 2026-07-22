import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth.middleware.mjs";

const JWT_SECRET = process.env.JWT_SECRET || "yhq-dev-secret-change-in-production";
const SALT_ROUNDS = 10;

export const authRouter = Router();

let prisma = null;
async function getDb() {
  if (!prisma) {
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
    const { phone, email, password, name } = req.body;
    if (!password || (!phone && !email)) {
      return res.status(400).json({ error: "Phone/email and password are required" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available. Configure DATABASE_URL in .env" });
    }

    const existing = await db.user.findFirst({
      where: { OR: [phone ? { phone } : {}, email ? { email } : {}].filter(Boolean) },
    });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await db.user.create({ data: { phone, email, password: hashed, name } });

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      token,
      user: { id: user.id, phone: user.phone, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    if (!password || (!phone && !email)) {
      return res.status(400).json({ error: "Phone/email and password are required" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available. Configure DATABASE_URL in .env" });
    }

    const user = await db.user.findFirst({
      where: { OR: [phone ? { phone } : {}, email ? { email } : {}].filter(Boolean) },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      user: { id: user.id, phone: user.phone, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database not available" });

    const user = await db.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ id: user.id, phone: user.phone, email: user.email, name: user.name });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});
