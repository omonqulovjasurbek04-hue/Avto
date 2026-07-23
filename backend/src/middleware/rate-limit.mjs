// Rate limiting configuration.
// Different tiers for general API, auth endpoints, and admin endpoints.
import rateLimit from "express-rate-limit";
import { env } from "../config/env.mjs";

/**
 * General API rate limiter: 100 requests per 15 minutes.
 */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

/**
 * Auth endpoint rate limiter: 10 requests per 15 minutes.
 * Protects against brute-force login/register attempts.
 */
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

/**
 * Admin endpoint rate limiter: 30 requests per 15 minutes.
 */
export const adminLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin requests. Please try again later." },
});
