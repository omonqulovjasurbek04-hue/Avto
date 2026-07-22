// Environment configuration with validation.
// Loads .env file and validates required variables.
// In production, JWT_SECRET MUST be set or the server refuses to start.
// In development, a random ephemeral secret is generated with a warning.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Load .env file manually (no dependency on dotenv at import time)
const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// ── Resolve JWT secret securely ──────────────────────────────
function resolveJwtSecret() {
  // 1. Environment variable (preferred)
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  // 2. Local file (for dev/CI setups)
  const secretFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../jwt_secret.txt");
  if (existsSync(secretFile)) {
    const fileSecret = readFileSync(secretFile, "utf8").trim();
    if (fileSecret.length > 0) return fileSecret;
  }

  // 3. Production — refuse to start without a secret
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET environment variable is required in production.");
    process.exit(1);
  }

  // 4. Development — generate ephemeral secret with loud warning
  const ephemeral = randomBytes(32).toString("hex");
  console.warn("⚠️  WARNING: Generating ephemeral JWT secret. Instance-isolated! Sessions will not survive restart.");
  console.warn("   Set JWT_SECRET in .env or environment for persistence.");
  return ephemeral;
}

export const env = Object.freeze({
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // JWT
  JWT_SECRET: resolveJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Server
  PORT: Number(process.env.PORT) || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS || "",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900_000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
});
