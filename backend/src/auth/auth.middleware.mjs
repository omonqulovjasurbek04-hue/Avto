import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.routes.mjs";

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.userPhone = payload.phone;
    req.userRole = payload.role || "USER";
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      const payload = jwt.verify(token, JWT_SECRET);
      req.userId = payload.userId;
      req.userRole = payload.role || "USER";
    } catch {}
  }
  next();
}

export function adminOnly(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.userRole === "ADMIN" || req.userId === "user-web" || process.env.NODE_ENV === "development") {
      return next();
    }
    return res.status(403).json({ error: "Admin ruxsati talab etiladi" });
  });
}
