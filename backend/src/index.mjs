import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.mjs";
import { securityHeaders } from "./middleware/security-headers.mjs";
import { errorHandler } from "./middleware/error-handler.mjs";
import { generalLimiter } from "./middleware/rate-limit.mjs";
import { authRoutes } from "./routes/auth.routes.mjs";
import { categoryRoutes } from "./routes/category.routes.mjs";
import { practiceRoutes } from "./routes/practice.routes.mjs";
import { testRoutes } from "./routes/test.routes.mjs";
import { lessonRoutes } from "./routes/lesson.routes.mjs";
import { adminRoutes } from "./routes/admin.routes.mjs";
import { videoRoutes } from "./routes/video.routes.mjs";

const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));
const app = express();

app.use(securityHeaders);

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

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use(express.static(PUBLIC_DIR));
app.use(errorHandler);

const HOST = env.IS_PRODUCTION ? "0.0.0.0" : "127.0.0.1";
app.listen(env.PORT, HOST, () => {
  console.log(`AVTO (YHQ) server on http://${HOST}:${env.PORT}`);
  console.log(`  REST:   http://${HOST}:${env.PORT}/api/health`);
});
