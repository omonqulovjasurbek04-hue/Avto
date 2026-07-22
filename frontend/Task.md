# 🚗 AVTO (YHQ) — Frontend To'liq Strukturasi va Rivojlanish Rejasi

> Web (React+Vite) + Mobile (Expo) + Flutter App + Content Editor (React)

---

## 1. Arxitektura

```
frontend/
├── web/              ← React + Vite SPA (6 sahifa: Home, Lessons, Practice, Exam, Analytics, Admin)
│   ├── src/
│   │   ├── components/    ← ScenarioPlayer, PlaybackBar, OptionsList, OutcomeBanner, RuleExplanation
│   │   ├── pages/         ← 6 ta sahifa komponenti
│   │   ├── hooks/         ← useEngine, useScenarios, useProgress, useTimer
│   │   ├── services/      ← api.js (fetch wrapper), i18n.js (til boshqaruvi)
│   │   └── context/       ← AppContext (lang state)
│   └── public/
│       └── engine.js      ← Pure JS engine (shared/engine-js dan sync)
│
├── app/              ← Flutter (Drift SQLite, Riverpod)
│   └── lib/
│       ├── database/      ← Tables (UserProgress, Answer, ExamAttempt) + DAOs
│       ├── providers/     ← Riverpod providers
│       └── services/      ← sync_service, auth_service, engine_service
│
├── mobile/           ← Expo React Native (WebView engine)
├── editor/           ← React content editor (Phase 6)
└── Task.md
```

## 2. Engine JS (@yhq/engine — Pure JS, dart2js emas!)

```
shared/engine-js/
├── src/
│   ├── core.js            ← Vec2, OBB, constants (LANE_WIDTH=60, VEHICLE_LENGTH=90, TICK_DT=1/60)
│   ├── layout.js          ← Road layout derivation (yo'llar, yo'laklar, stop pozitsiyalari)
│   ├── trajectory.js      ← Bézier curve generation + arc-length parameterization
│   ├── simulation.js      ← 60fps tick simulation + OBB collision detection
│   ├── outcome.js         ← 6 outcome classifiers (collision, priority_violation, sign_violation, marking_violation, unnecessary_wait, unsafe_but_legal)
│   ├── scene_builder.js   ← Display list generation (fillPolygon, strokePath, fillCircle)
│   ├── renderer.js        ← Canvas 2D rendering
│   ├── api.js             ← Public API (sceneInfo, buildFrame, optionFrame, buildScene)
│   └── build.mjs          ← Bundle builder → engine.js
│
├── engine.js              ← Built bundle (14.5 KB, standalone, pure JS)
├── index.mjs              ← Node.js entry
├── load.node.mjs          ← Node.js engine loader
├── renderer.mjs           ← Canvas 2D renderer (ES module)
└── types.d.ts             ← TypeScript type definitions
```

### Public API (window.__yhqEngine)

| Function | Input | Output |
|---|---|---|
| `sceneInfo(json)` | Scenario JSON string | `{ options, duration, warnings }` |
| `buildFrame(json, t)` | Scenario JSON + time (s) | `{ ops: [...] }` (correct answer) |
| `optionFrame(json, optId, t)` | Scenario JSON + option ID + time | `{ ops: [...] }` (user answer) |
| `buildScene(json)` | Scenario JSON | `{ ops: [...] }` (t=0 preview) |
| `version` | - | `"0.1.0"` |

### Canvas Renderer (window.__yhqDraw)

```javascript
// 3 primitiv:
// - fillPolygon { type, points: Vec2[], colour: ARGB }
// - strokePath  { type, points: Vec2[], colour: ARGB, width, dash? }
// - fillCircle  { type, centre: Vec2, radius, colour: ARGB }

window.__yhqDraw(ctx, frame, { size: 900 });
```

### Engine Build

```bash
node shared/engine-js/build.mjs  # → shared/engine-js/engine.js
```

### Enginening algoritmi:

```
Scenario JSON
  → deriveLayout() → yo'llar, yo'laklar geometriyasi
  → buildTrajectory() → Bézier egri chiziqlar (to'g'ri, o'ng, chap, U-turn)
  → simulateOrder() → 60 FPS tick, actor release sequencing
  → OBB collision detection (SAT algorithm)
  → classifyOption() → 6 outcome type
  → buildScene() → display list: fillPolygon / strokePath / fillCircle
  → drawDisplayList(ctx, frame) → Canvas 2D
```

## 3. Database

### Flutter — Drift SQLite (frontend/app/lib/database/)

| Table | Fields |
|---|---|
| `UserProgress` | id, correctAnswers, wrongAnswers, lastSyncAt |
| `Answer` | id, scenarioId, optionId, isCorrect, outcomeType, answeredAt, userId |
| `ExamAttempt` | id, score, total, passed, durationSeconds, createdAt, userId |

### Backend — PostgreSQL/Prisma (backend/prisma/schema.prisma)

| Table | Fields |
|---|---|
| `User` | id (uuid), phone?, email?, password, name?, createdAt |
| `Answer` | id (uuid), userId, scenarioId, optionId, isCorrect, outcomeType, answeredAt |
| `ExamAttempt` | id (uuid), userId, score, total, passed, durationSeconds, details (Json?) |
| `Scenario` | id, topic?, sceneType? |
| `Lesson` | id, title, topic?, ruleCode? |

### Auth (JWT)
- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` (Bearer) → user ma'lumoti
- Auth middleware: `authMiddleware`, `optionalAuth`

## 4. Ishlab Chiqish Buyruqlari

```bash
# Engine build
cd shared/engine-js && node build.mjs

# Web app
cd frontend/web && npm run dev

# Backend
cd backend && npm run dev

# Engine test
cd engine_dart && dart pub get && dart test

# Schema codegen
node tools/codegen.js

# Content validate
node tools/validate.js content

# Database
cd backend && npx prisma generate && npx prisma db push
```
