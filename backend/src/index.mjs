// YHQ platform server: REST API + static hosting of the engine bundle and the
// mobile player page. Start: npm run dev --workspace @yhq/server
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { api } from "./routes.mjs";
import { engine } from "./engine.mjs";
import { initDatabase, dbType } from "./db.mjs";

const PORT = Number(process.env.PORT ?? 4000);
const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));

const app = express();
// Restrict origins when CORS_ORIGINS is set (comma-separated). Default is open,
// for local dev; set it in production now that the API can be tunneled publicly.
const corsOrigins = process.env.CORS_ORIGINS;
app.use(cors(corsOrigins ? { origin: corsOrigins.split(",").map((s) => s.trim()) } : {}));
app.use(express.json({ limit: "256kb" }));

app.use("/api", api);

// The base URL opens the engine-driven player. landing.html (welcome + real
// progress) and index.html (scenario grid) are the other two functional pages.
app.get("/", (_req, res) => res.redirect("/player.html"));

// Serves the engine bundle, the three pages, the PWA manifest and service
// worker (offline install), all from one origin as the API above.
app.use(express.static(PUBLIC_DIR));

// Error handler (registered last). The engine's EngineError carries status 422
// (bad scenario/option); everything else is a 500. Never leak a stack to the
// client, but log server faults.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || "internal error" });
});

// Bind to 0.0.0.0 so a phone on the same Wi-Fi can reach it.
app.listen(PORT, "0.0.0.0", async () => {
  await initDatabase();
  console.log(`YHQ server on http://0.0.0.0:${PORT}  (engine ${engine.version}, db: ${dbType})`);
  console.log(`  REST:   http://localhost:${PORT}/api/health`);
  console.log(`  player: http://localhost:${PORT}/player.html`);
});
