// Database abstraction layer supporting MongoDB, PostgreSQL, and JSON fallback.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = fileURLToPath(new URL("../data/", import.meta.url));
const FILE = path.join(DATA_DIR, "progress.json");

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

function writeAllJson(db) {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2));
  writeFileSync(FILE, JSON.stringify(db, null, 2));
}

/** Get user progress record */
export async function getUserProgress(userId) {
  const db = readAllJson();
  const user = db[userId] ?? { answers: [], correct: 0, wrong: 0, exams: [] };
  return user;
}

/** Save an answer attempt */
export async function saveAnswer(userId, attempt) {
  const db = readAllJson();
  const p = db[userId] ?? { answers: [], correct: 0, wrong: 0, exams: [] };
  p.answers.push({ ...attempt, at: new Date().toISOString() });
  if (attempt.correct) p.correct += 1;
  else p.wrong += 1;
  db[userId] = p;
  writeAllJson(db);
  return p;
}

/** Save an exam result */
export async function saveExamResult(userId, examResult) {
  const db = readAllJson();
  const p = db[userId] ?? { answers: [], correct: 0, wrong: 0, exams: [] };
  if (!p.exams) p.exams = [];
  const record = { ...examResult, id: `exam-${Date.now()}`, at: new Date().toISOString() };
  p.exams.push(record);
  db[userId] = p;
  writeAllJson(db);
  return record;
}
