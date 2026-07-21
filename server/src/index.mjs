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
app.use(cors()); // clients (web dev server, Expo) are on other origins
app.use(express.json());

app.use("/api", api);

// The base URL opens the engine-driven player. landing.html (welcome + real
// progress) and index.html (scenario grid) are the other two functional pages.
app.get("/", (_req, res) => res.redirect("/player.html"));

// Serves the engine bundle, the three pages, the PWA manifest and service
// worker (offline install), all from one origin as the API above.
app.use(express.static(PUBLIC_DIR));

// Bind to 0.0.0.0 so a phone on the same Wi-Fi can reach it.
app.listen(PORT, "0.0.0.0", async () => {
  await initDatabase();
  console.log(`YHQ server on http://0.0.0.0:${PORT}  (engine ${engine.version}, db: ${dbType})`);
  console.log(`  REST:   http://localhost:${PORT}/api/health`);
  console.log(`  player: http://localhost:${PORT}/player.html`);
});
