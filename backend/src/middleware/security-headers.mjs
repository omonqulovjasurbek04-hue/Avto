// Security headers middleware.
// Sets HTTP headers to prevent common web vulnerabilities.
import { env } from "../config/env.mjs";

/**
 * Adds security headers to every response.
 */
export function securityHeaders(req, res, next) {
  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Disable legacy XSS filter (CSP is the proper mitigation)
  res.setHeader("X-XSS-Protection", "0");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'",
  );

  // Disable unnecessary browser features
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // HSTS (only in production with TLS)
  if (env.IS_PRODUCTION) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // Prevent caching of authenticated responses
  if (req.headers.authorization) {
    res.setHeader("Cache-Control", "no-store");
  }

  next();
}
