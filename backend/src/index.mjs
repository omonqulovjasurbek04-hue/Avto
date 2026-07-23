// AVTO (YHQ) Platform Server
// REST API + static hosting of the engine bundle.
// Start: npm run dev --workspace @yhq/server
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.mjs";
import { securityHeaders } from "./middleware/security-headers.mjs";
import { errorHandler } from "./middleware/error-handler.mjs";
import { generalLimiter } from "./middleware/rate-limit.mjs";
import { authRoutes } from "./routes/auth.routes.mjs";
import { scenarioRoutes } from "./routes/scenario.routes.mjs";
import { lessonRoutes } from "./routes/lesson.routes.mjs";
import { examRoutes } from "./routes/exam.routes.mjs";
import { progressRoutes } from "./routes/progress.routes.mjs";
import { adminRoutes } from "./routes/admin.routes.mjs";
import { engine } from "./engine.mjs";

const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));

const app = express();

// ── Global middleware ────────────────────────────────────────
app.use(securityHeaders);

// Restrict CORS origins in production
const corsOrigins = env.CORS_ORIGINS;
app.use(
  cors(
    corsOrigins
      ? { origin: corsOrigins.split(",").map((s) => s.trim()), credentials: true }
      : { credentials: true },
  ),
);
app.use(express.json({ limit: "256kb" }));
app.use(generalLimiter);

// ── API routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, engine: engine?.version ?? "dev" });
});

// ── Static files (engine bundle, player page) ────────────────
app.use(express.static(PUBLIC_DIR));

// ── Error handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
const HOST = env.IS_PRODUCTION ? "0.0.0.0" : "127.0.0.1";

app.listen(env.PORT, HOST, () => {
  console.log(`AVTO (YHQ) server on http://${HOST}:${env.PORT}`);
  console.log(`  REST:   http://${HOST}:${env.PORT}/api/health`);
  console.log(`  Engine: v${engine?.version ?? "dev"}`);
});
