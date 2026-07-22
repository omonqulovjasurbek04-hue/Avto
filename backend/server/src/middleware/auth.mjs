// Authentication middleware.
// Extracts JWT from Authorization header, verifies it, and attaches user to req.
// Also checks session validity in the database.
import { verifyToken } from "../utils/jwt.mjs";
import { prisma } from "../config/database.mjs";

/**
 * Authenticate request via Bearer token.
 * Sets req.user = { id, email, role } on success.
 * Returns 401 on missing/invalid token.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Verify session exists in DB (allows logout to invalidate tokens)
  prisma.session
    .findFirst({
      where: {
        userId: payload.id,
        token,
        expiresAt: { gt: new Date() },
      },
    })
    .then((session) => {
      if (!session) {
        return res.status(401).json({ error: "Session expired or revoked" });
      }
      req.user = { id: payload.id, email: payload.email, role: payload.role };
      req.token = token;
      next();
    })
    .catch(() => {
      return res.status(500).json({ error: "Authentication check failed" });
    });
}

/**
 * Require admin role. Must be used AFTER authenticate middleware.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
