// Database abstraction layer supporting PostgreSQL via Prisma and JSON fallback.
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = fileURLToPath(new URL("../data/", import.meta.url));
const FILE = path.join(DATA_DIR, "progress.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const MAX_ANSWERS = 500;

export let dbType = "json"; // 'postgres' | 'json'

export async function initDatabase() {
  const postgresUrl = process.env.DATABASE_URL;

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

  console.log("Database mode: Local atomic JSON store (data/progress.json & data/users.json)");
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
  const tmp = `${FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2));
  renameSync(tmp, FILE);
}

function readUsersJson() {
  try {
    if (!existsSync(USERS_FILE)) return [];
    return JSON.parse(readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeUsersJson(users) {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${USERS_FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(users, null, 2));
  renameSync(tmp, USERS_FILE);
}

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

/** JSON User Fallback Store */
export function findJsonUser({ phone, email }) {
  const users = readUsersJson();
  return users.find((u) => (phone && u.phone === phone) || (email && u.email === email)) || null;
}

export function findJsonUserById(id) {
  const users = readUsersJson();
  return users.find((u) => u.id === id) || null;
}

export function createJsonUser(userData) {
  return enqueue(() => {
    const users = readUsersJson();
    const newUser = {
      id: `user-${Date.now()}`,
      phone: userData.phone || null,
      email: userData.email || null,
      password: userData.password,
      name: userData.name || null,
      role: userData.role || 'USER',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsersJson(users);
    return newUser;
  });
}
