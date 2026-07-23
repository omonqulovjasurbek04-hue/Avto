// Centralized error handler middleware.
// Catches all errors from route handlers and returns consistent JSON responses.
// Never leaks stack traces or internal details to the client.
import { env } from "../config/env.mjs";

/**
 * Express error handling middleware (must have 4 parameters).
 * The engine's EngineError carries status 422 (bad scenario/option).
 * Validation errors carry status 400.
 * Everything else is a 500.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  // Log server errors (5xx), not client errors
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    if (!env.IS_PRODUCTION) {
      console.error(err.stack);
    }
  }

  // Never leak internal error details in production
  const message = status >= 500 && env.IS_PRODUCTION ? "Internal server error" : err.message || "Internal server error";

  res.status(status).json({ error: message });
}
