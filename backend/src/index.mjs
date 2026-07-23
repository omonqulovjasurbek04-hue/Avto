// YHQ platform server: REST API + static hosting of the engine bundle and the
// mobile player page. Start: npm run dev --workspace @yhq/server
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { api } from "./routes.mjs";
import { engine } from "./engine.mjs";
import { initDatabase, dbType } from "./db.mjs";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));

const app = express();

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Restrict origins when CORS_ORIGINS is set (comma-separated). Default is open for local dev
const corsOrigins = process.env.CORS_ORIGINS;
app.use(cors(corsOrigins ? { origin: corsOrigins.split(",").map((s) => s.trim()) } : {}));
app.use(express.json({ limit: "256kb" }));

app.use("/api", api);

// The base URL opens the engine-driven player
app.get("/", (_req, res) => res.redirect("/player.html"));

// Serves the engine bundle, pages, PWA manifest
app.use(express.static(PUBLIC_DIR));

// Error handler (registered last)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || "internal error" });
});

app.listen(PORT, HOST, async () => {
  await initDatabase();
  console.log(`YHQ server on http://${HOST}:${PORT}  (engine ${engine.version}, db: ${dbType})`);
  console.log(`  REST:   http://${HOST}:${PORT}/api/health`);
  console.log(`  player: http://${HOST}:${PORT}/player.html`);
});
