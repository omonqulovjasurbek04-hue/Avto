import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.mjs";
import { authenticate } from "../middleware/auth.mjs";
import { authLimiter } from "../middleware/rate-limit.mjs";
import * as authService from "../services/auth.service.mjs";

const passwordSchema = z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak").max(128);

const registerSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: passwordSchema,
  name: z.string().min(1).max(100).trim().optional(),
  locale: z.enum(["uz", "ru", "en"]).optional().default("uz"),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const authRoutes = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

authRoutes.post("/register", authLimiter, validate({ body: registerSchema }), wrap(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user, token });
}));

authRoutes.post("/login", authLimiter, validate({ body: loginSchema }), wrap(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ user, token });
}));

authRoutes.get("/me", authenticate, wrap(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ user });
}));

authRoutes.post("/logout", authenticate, wrap(async (req, res) => {
  await authService.logout(req.user.id, req.token);
  res.json({ ok: true });
}));

authRoutes.post("/logout-all", authenticate, wrap(async (req, res) => {
  await authService.logoutAll(req.user.id);
  res.json({ ok: true });
}));

authRoutes.post("/change-password", authenticate, authLimiter, validate({ body: changePasswordSchema }), wrap(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.json({ ok: true });
}));
