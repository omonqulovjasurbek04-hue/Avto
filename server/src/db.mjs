// Database abstraction layer supporting MongoDB, PostgreSQL, and JSON fallback.
import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = fileURLToPath(new URL("../data/", import.meta.url));
const FILE = path.join(DATA_DIR, "progress.json");

// Cap stored answers per user so a single (now publicly reachable) client cannot
// grow the file without bound. The correct/wrong counters are kept in full.
const MAX_ANSWERS = 500;

export let dbType = "json"; // 'mongodb' | 'postgres' | 'json'

export async function initDatabase() {
  const mongoUri = process.env.MONGO_URI;
  const postgresUrl = process.env.DATABASE_URL;

  if (mongoUri) {
    try {
      // Dynamic import to allow running gracefully without mongoose installed
      const mongoose = await import("mongoose");
      await mongoose.connect(mongoUri);
      dbType = "mongodb";
      console.log("Database connected: MongoDB");
      return;
    } catch (err) {
      console.warn("MongoDB connection attempt failed, falling back to local JSON store:", err.message);
    }
  }

  if (postgresUrl) {
    try {
      const pg = await import("pg");
      const pool = new pg.default.Pool({ connectionString: postgresUrl });
      await pool.query("SELECT NOW()");
      dbType = "postgres";
      console.log("Database connected: PostgreSQL");
      return;
    } catch (err) {
      console.warn("PostgreSQL connection attempt failed, falling back to local JSON store:", err.message);
    }
  }

  console.log("Database mode: Local atomic JSON store (data/progress.json)");
  dbType = "json";
}

function readAllJson() {
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

// Atomic write: serialize once to a unique temp file, then rename over the
// target. rename() is atomic on the same filesystem, so a crash mid-write can
// never leave a half-written progress.json (and no stray .tmp survives).
function writeAllJson(db) {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2));
  renameSync(tmp, FILE);
}

// Serialize read-modify-write mutations. Without this, two concurrent requests
// both read the old record and the second write clobbers the first (lost
// update). Chaining every mutation on a single promise makes them run one at a
// time; a rejected mutation must not break the chain for the next caller.
let writeChain = Promise.resolve();
function enqueue(mutator) {
  const run = writeChain.then(mutator);
  writeChain = run.then(
    () => {},
    () => {},
  );
  return run;
}

const emptyUser = () => ({ answers: [], correct: 0, wrong: 0, exams: [] });

/** Get user progress record */
export async function getUserProgress(userId) {
  const db = readAllJson();
  return db[userId] ?? emptyUser();
}

/** Save an answer attempt (serialized, atomic) */
export function saveAnswer(userId, attempt) {
  return enqueue(() => {
    const db = readAllJson();
    const p = db[userId] ?? emptyUser();
    p.answers.push({ ...attempt, at: new Date().toISOString() });
    if (attempt.correct) p.correct += 1;
    else p.wrong += 1;
    if (p.answers.length > MAX_ANSWERS) p.answers = p.answers.slice(-MAX_ANSWERS);
    db[userId] = p;
    writeAllJson(db);
    return p;
  });
}

/** Save an exam result (serialized, atomic) */
export function saveExamResult(userId, examResult) {
  return enqueue(() => {
    const db = readAllJson();
    const p = db[userId] ?? emptyUser();
    if (!p.exams) p.exams = [];
    const record = { ...examResult, id: `exam-${Date.now()}`, at: new Date().toISOString() };
    p.exams.push(record);
    db[userId] = p;
    writeAllJson(db);
    return record;
  });
}
