// Authentication routes.
// POST /api/auth/register — Ro'yxatdan o'tish
// POST /api/auth/login    — Kirish
// GET  /api/auth/me       — Profil olish (auth required)
// POST /api/auth/logout   — Chiqish (auth required)
// POST /api/auth/change-password — Parol o'zgartirish (auth required)
import { Router } from "express";
import { validate } from "../middleware/validate.mjs";
import { authenticate } from "../middleware/auth.mjs";
import { authLimiter } from "../middleware/rate-limit.mjs";
import { registerSchema, loginSchema, changePasswordSchema } from "../schemas/auth.schema.mjs";
import * as authService from "../services/auth.service.mjs";

export const authRoutes = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Register
authRoutes.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  wrap(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ user, token });
  }),
);

// Login
authRoutes.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  wrap(async (req, res) => {
    const { user, token } = await authService.login(req.body);
    res.json({ user, token });
  }),
);

// Get profile (authenticated)
authRoutes.get(
  "/me",
  authenticate,
  wrap(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  }),
);

// Logout (authenticated)
authRoutes.post(
  "/logout",
  authenticate,
  wrap(async (req, res) => {
    await authService.logout(req.user.id, req.token);
    res.json({ ok: true });
  }),
);

// Logout from all devices (authenticated)
authRoutes.post(
  "/logout-all",
  authenticate,
  wrap(async (req, res) => {
    await authService.logoutAll(req.user.id);
    res.json({ ok: true });
  }),
);

// Change password (authenticated)
authRoutes.post(
  "/change-password",
  authenticate,
  authLimiter,
  validate({ body: changePasswordSchema }),
  wrap(async (req, res) => {
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.json({ ok: true, message: "Parol muvaffaqiyatli o'zgartirildi. Barcha sessiyalar yakunlandi." });
  }),
);
