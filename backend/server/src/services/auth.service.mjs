// Authentication service.
// Handles registration, login, logout, password change, and profile retrieval.
// All password operations use bcrypt. Tokens are JWTs with database-backed sessions.
import { prisma } from "../config/database.mjs";
import { hashPassword, comparePassword } from "../utils/password.mjs";
import { signToken } from "../utils/jwt.mjs";
import { env } from "../config/env.mjs";

/**
 * Parse JWT_EXPIRES_IN to a Date for session expiry.
 * @returns {Date}
 */
function sessionExpiryDate() {
  const duration = env.JWT_EXPIRES_IN || "7d";
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return new Date(Date.now() + 7 * 86400_000);
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { s: 1000, m: 60_000, h: 3600_000, d: 86400_000 }[unit] || 86400_000;
  return new Date(Date.now() + num * ms);
}

/**
 * Register a new user.
 * @param {{ email: string, password: string, name?: string, locale?: string }} data
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function register({ email, password, name, locale }) {
  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Bu email allaqachon ro'yxatdan o'tgan");
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
      locale: locale || "uz",
    },
    select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true },
  });

  // Create JWT and session
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: sessionExpiryDate(),
    },
  });

  return { user, token };
}

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, locale: true, passwordHash: true, createdAt: true },
  });

  if (!user) {
    const err = new Error("Email yoki parol noto'g'ri");
    err.status = 401;
    throw err;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Email yoki parol noto'g'ri");
    err.status = 401;
    throw err;
  }

  // Create JWT and session
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: sessionExpiryDate(),
    },
  });

  // Never return passwordHash to the client
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

/**
 * Logout — invalidate a specific session.
 * @param {string} userId
 * @param {string} token
 */
export async function logout(userId, token) {
  await prisma.session.deleteMany({
    where: { userId, token },
  });
}

/**
 * Logout from all devices — invalidate all sessions.
 * @param {string} userId
 */
export async function logoutAll(userId) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Get user profile (never returns passwordHash).
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true, updatedAt: true },
  });
  if (!user) {
    const err = new Error("Foydalanuvchi topilmadi");
    err.status = 404;
    throw err;
  }
  return user;
}

/**
 * Change password.
 * Invalidates all existing sessions after password change.
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    const err = new Error("Foydalanuvchi topilmadi");
    err.status = 404;
    throw err;
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    const err = new Error("Joriy parol noto'g'ri");
    err.status = 401;
    throw err;
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Invalidate all sessions after password change
  await prisma.session.deleteMany({ where: { userId } });
}

/**
 * Clean up expired sessions (can be called periodically).
 */
export async function cleanExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
