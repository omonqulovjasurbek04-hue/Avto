# AVTO (YHQ) — Backend

Express REST API + PostgreSQL/Prisma + JWT Auth + pure JS scenario engine.

---

## Architecture

```
backend/
├── prisma/
│   └── schema.prisma          ← PostgreSQL models (User, Answer, ExamAttempt, Scenario, Lesson)
├── src/
│   ├── index.mjs              ← Express server entry (port 4000, CORS, static, error handler)
│   ├── routes.mjs             ← All API routes (auth, scenarios, lessons, progress, exams, admin)
│   ├── engine.mjs             ← Pure JS engine loader from public/engine.js
│   ├── content.mjs            ← Scenario CRUD from ../../content/*.json (20 files)
│   ├── lessons.mjs            ← Lesson CRUD from data/lessons/*.json (4 seed lessons)
│   ├── db.mjs                 ← DB abstraction: JSON file fallback (data/progress.json)
│   └── auth/
│       ├── auth.routes.mjs    ← /api/auth/register, login, /me (JWT, bcrypt)
│       └── auth.middleware.mjs ← authMiddleware (required), optionalAuth (optional)
├── public/
│   ├── engine.js              ← Pure JS scenario engine (0.1.0, from shared/engine-js)
│   ├── player.html, index.html, landing.html
│   ├── sw.js, manifest.webmanifest, icon.svg
│   └── videos/                ← Video content
├── data/
│   ├── progress.json          ← [Runtime] JSON fallback user progress store
│   └── lessons/               ← [Runtime] Lesson JSON files (lesson-01..04)
├── .env.example               ← Template: PORT, JWT_SECRET, DATABASE_URL, CORS_ORIGINS
├── package.json               ← type: module, deps: express, cors, bcryptjs, jsonwebtoken
└── Task.md
```

## Pure JS Engine (not Dart)

`engine.mjs` reads `public/engine.js` (from `shared/engine-js/`), evaluates it, and exposes:
- `sceneInfo(src)` — classify options (clean/outcome type), return duration + warnings
- `frame(src, {t, option})` — render frame at time `t`, optionally for a wrong option
- `engine.version` — `"0.1.0"`

No Dart SDK needed. No `@yhq/engine` npm dependency. No `loadEngineNode()`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | - | Server health + engine version + db mode |
| POST | `/api/auth/register` | - | Register with phone + password (returns JWT) |
| POST | `/api/auth/login` | - | Login (returns JWT) |
| GET | `/api/auth/me` | Bearer | Current user info |
| GET | `/api/scenarios` | - | List all (filter: ?topic=, ?type=) |
| GET | `/api/scenarios/:id` | - | Full scenario JSON |
| GET | `/api/scenarios/:id/info` | - | Engine outcome classification |
| GET | `/api/scenarios/:id/frame` | - | Frame ops (?t=5, &option=o1) |
| GET | `/api/lessons` | - | List all lessons |
| GET | `/api/lessons/:id` | - | Lesson detail |
| GET | `/api/progress/:userId` | optionalAuth | User progress stats |
| POST | `/api/progress/:userId/answer` | optionalAuth | Record answer + engine evaluation |
| GET | `/api/exams/generate` | - | Generate 20-question exam |
| POST | `/api/exams/:userId/submit` | optionalAuth | Submit exam, auto-grade |
| POST | `/api/admin/scenarios` | Bearer | Create/update scenario |
| DELETE | `/api/admin/scenarios/:id` | Bearer | Delete scenario |
| POST | `/api/admin/lessons` | Bearer | Create/update lesson |
| DELETE | `/api/admin/lessons/:id` | Bearer | Delete lesson |
| GET | `/api/admin/validate` | Bearer | Engine validation for all scenarios |
| GET | `/api/admin/stats` | Bearer | System statistics |

## Auth Flow

1. **Register** → `POST /api/auth/register` with `{phone, password, name?}`
2. **Login** → `POST /api/auth/login` with `{phone, password}`
3. Both return `{token, user: {id, phone, email, name}}`
4. Use token as `Authorization: Bearer <token>` for protected routes
5. Auth requires PostgreSQL (Prisma) — without `DATABASE_URL`, auth returns 503

### Middleware
- `authMiddleware` — required for admin routes and `/me`
- `optionalAuth` — extracts user if token present, doesn't reject if not

## Database

### Primary: PostgreSQL via Prisma

Models:
- `User` — id, phone (unique), email (unique), password (bcrypt), name
- `Answer` — id, userId, scenarioId, optionId, isCorrect, outcomeType
- `ExamAttempt` — id, userId, score, total, passed, durationSeconds, details (JSON)
- `Scenario` — id, topic, sceneType (cached metadata from /content/)
- `Lesson` — id, title, topic, ruleCode

Setup:
```bash
cp .env.example .env    # Set DATABASE_URL
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push to PostgreSQL
npm run dev
```

### Fallback: JSON files

When `DATABASE_URL` is not set, user progress, answers, and exams are stored in `data/progress.json`. Auth (register/login) requires PostgreSQL — falls back to 503.

## Database Organization

| Data | Storage | Path |
|------|---------|------|
| Scenario content (source of truth) | JSON files | `/content/sc-*.json` (20 files) |
| Scenario list + engine metadata | API-generated | from engine at runtime |
| User auth + JWT | PostgreSQL (Prisma) | `DATABASE_URL` required |
| User progress, answers, exams | JSON file | `data/progress.json` (or PostgreSQL) |
| Lessons | JSON files | `data/lessons/lesson-*.json` (4 files) |

## How the Engine Works

1. `engine.mjs` loads `public/engine.js` using `(0, eval)(code)` into `globalThis.__yhqEngine`
2. `sceneInfo(src)` parses scenario JSON, simulates all options, returns `{options: {A, B, C, D, o1, o2, ...}, duration, warnings}`
3. `frame(src, {t, option})` renders frame as display list: `[{type: "fillPolygon"|"strokePath"|"fillCircle", points, colour, width, dash}]`
4. Client (web/mobile) renders the display list on Canvas 2D

## Content Sources

- **Scenarios**: `../../content/` (repo root) — 20 JSON scenario files, `sc-0001` through `sc-0020`
- **Lessons**: `data/lessons/` — 4 seed lessons auto-created on first read

## Session Summary (Jul 2026)

### What was built
- **engine.mjs**: Replaced old `@yhq/engine/node` dart2js loader with pure JS engine loader from `public/engine.js`
- **auth.routes.mjs**: JWT register/login/me with import ordering fix, Prisma error handling, 503 fallback
- **routes.mjs**: Added authMiddleware to admin routes, optionalAuth to user-scoped routes, engine.version fallback
- **content.mjs**: Fixed content path from `../../../content/` to `../../content/` (was resolving one level too high)

### Verified
- `npm install` passes (120 packages, 0 vulnerabilities)
- `npm run dev` starts on port 4000 with engine 0.1.0
- `/api/health` → OK engine=0.1.0 db=json
- `/api/scenarios` → 20 items with correct metadata
- `/api/scenarios/sc-0001/info` → options D/o1/o2, duration 10.0s
- `/api/scenarios/sc-0001/frame?t=0&option=D` → 20 ops (fillPolygon, strokePath, fillCircle)
- `/api/lessons` → 4 items
- `/api/exams/generate` → 20 questions
- `/api/progress/user-web/answer` → correct answer recording with outcome classification
- Auth → 503 (no PostgreSQL, expected dev behavior)
