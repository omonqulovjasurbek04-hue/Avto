// JWT token utilities.
// Signs and verifies JWT tokens with strict algorithm enforcement.
// The 'none' algorithm is explicitly rejected. Only HS256 is accepted.
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.mjs";

const ALGORITHM = "HS256";
const HEADER = { alg: ALGORITHM, typ: "JWT" };

// ── Helpers ──────────────────────────────────────────────────

function base64UrlEncode(data) {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str) {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function hmacSign(input, secret) {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

/**
 * Parse a duration string like "7d", "24h", "30m" to seconds.
 * @param {string} duration
 * @returns {number}
 */
function parseDuration(duration) {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 7 * 24 * 3600; // default 7 days
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s": return num;
    case "m": return num * 60;
    case "h": return num * 3600;
    case "d": return num * 86400;
    default: return 7 * 86400;
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Sign a JWT token.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} Signed JWT
 */
export function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseDuration(env.JWT_EXPIRES_IN);

  const tokenPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const headerEncoded = base64UrlEncode(HEADER);
  const payloadEncoded = base64UrlEncode(tokenPayload);
  const signature = hmacSign(`${headerEncoded}.${payloadEncoded}`, env.JWT_SECRET);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Verify and decode a JWT token.
 * Rejects 'none' algorithm. Only accepts HS256.
 * @param {string} token
 * @returns {{ id: string, email: string, role: string, iat: number, exp: number }}
 * @throws {Error} If token is invalid, expired, or uses wrong algorithm
 */
export function verifyToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Token is required");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed token");
  }

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

  // Decode and validate header
  let header;
  try {
    header = JSON.parse(base64UrlDecode(headerEncoded));
  } catch {
    throw new Error("Invalid token header");
  }

  // CRITICAL: Reject 'none' algorithm and enforce HS256 only
  if (!header.alg || header.alg.toLowerCase() === "none") {
    throw new Error("Algorithm 'none' is not allowed");
  }
  if (header.alg !== ALGORITHM) {
    throw new Error(`Unsupported algorithm: ${header.alg}. Only ${ALGORITHM} is accepted.`);
  }

  // Verify signature using timing-safe comparison
  const expectedSignature = hmacSign(`${headerEncoded}.${payloadEncoded}`, env.JWT_SECRET);
  const sigBuf = Buffer.from(signatureEncoded, "utf8");
  const expectedBuf = Buffer.from(expectedSignature, "utf8");

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error("Invalid token signature");
  }

  // Decode payload
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadEncoded));
  } catch {
    throw new Error("Invalid token payload");
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token has expired");
  }

  return payload;
}
