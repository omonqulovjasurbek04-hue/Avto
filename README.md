# AVTO (YHQ) — Driving Education Platform

Mobile app that teaches Uzbekistan's traffic rules (YHQ) by **playing the
student's answer as an animation** — showing the consequence of a wrong answer
(collision, priority violation, unnecessary wait), then the correct sequence
for comparison.

No animation is ever hand-authored. Each question is declarative scene data
(`content/*.json`); a deterministic engine derives geometry, trajectories,
timing and collisions from it.

---

## Tech stack

| Layer | Choice |
|---|---|
| Mobile app | Flutter (Dart, `CustomPainter`, stable) |
| Scenario engine (Dart) | `engine_dart/` — pure Dart, no Flutter imports |
| Scenario engine (JS) | `shared/engine-js/` — pure JS from 8 source modules |
| Local DB | Drift (SQLite) + Riverpod state |
| Backend | Express.js, port 4000, JWT auth |
| DB | JSON file fallback (dev) / PostgreSQL via Prisma (prod) |
| Web | React + Vite + Canvas 2D |
| Mobile (RN) | Expo + React Native + WebView engine |
| Schema | JSON Schema → codegen to Dart + TS |
| Payments | Payme + Click |
| Analytics | PostHog |

---

## Repository layout

```
schema/                  JSON Schema + generated types (source of truth)
engine_dart/             Pure Dart scenario engine — no Flutter imports
shared/engine-js/        Pure JS engine from src/ sources + build.mjs bundle
backend/                 Express REST API server (src/, prisma/, public/, data/)
frontend/
  app/                   Flutter app (depends on engine_dart)
  web/                   React + Vite SPA (ScenarioPlayer, Practice, Exam)
  mobile/                Expo + React Native (WebView engine player)
  editor/                React content editor (Phase 6 — form-based, no drag-drop)
content/                 20 scenario JSON files (sc-0001 .. sc-0020)
tools/                   codegen, validate, sync, verify scripts
docs/                    Design docs
```

---

## Engines

### `engine_dart/` — Original Dart engine

Pure Dart, verified headlessly. Implements layout derivation, Bézier
trajectories, OBB collision, 6 outcome classifiers, display list build.
Compiled to JS via dart2js for browser use.

### `shared/engine-js/` — Pure JS engine (new)

Standalone pure JavaScript reimplementation (no Dart SDK needed). Built from
8 source modules in `shared/engine-js/src/`:

| Module | File | Purpose |
|---|---|---|
| core | `core.js` | Vec2, OBB SAT collision, constants |
| layout | `layout.js` | Road layout from scenario JSON |
| trajectory | `trajectory.js` | Bézier curves, arc-length parameterisation |
| simulation | `simulation.js` | 60 fps tick, choreography, OBB collision |
| outcome | `outcome.js` | 6 outcome classifiers |
| scene_builder | `scene_builder.js` | Display list generation |
| renderer | `renderer.js` | Canvas 2D drawing (3 primitives) |
| api | `api.js` | Public API: sceneInfo, buildFrame, optionFrame, buildScene |

Build: `cd shared/engine-js && node build.mjs` → single `engine.js` (14.5 KB).

Bundled engine is synced to all consumers (backend/public/, frontend/web/public/,
frontend/mobile/assets/, frontend/editor/public/, tools/engine-js/).

---

## Backend server

| | |
|---|---|
| Runtime | `cd backend && npm run dev` → `http://localhost:4000` |
| Stack | Express.js, CORS, JWT auth, PostgreSQL/Prisma (opt) |
| Engine | Loads `public/engine.js` (pure JS, not dart2js) |
| Content | Reads `content/sc-*.json` directly from repo root |
| Auth | JWT register/login/me + authMiddleware for admin routes |

### API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Engine version, db mode |
| POST | `/api/auth/register` | — | `{ phone, password, name? }` → token |
| POST | `/api/auth/login` | — | `{ phone, password }` → token |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/scenarios` | — | List all (?topic=, ?type=) |
| GET | `/api/scenarios/:id` | — | Full scenario JSON |
| GET | `/api/scenarios/:id/info` | — | Engine outcomes per option |
| GET | `/api/scenarios/:id/frame` | — | Frame ops (?t=, ?option=) |
| GET | `/api/lessons` | — | 4 seed lessons |
| GET | `/api/progress/:userId` | opt | User stats |
| POST | `/api/progress/:userId/answer` | opt | Record answer + classify |
| GET | `/api/exams/generate` | — | 20 random questions |
| POST | `/api/exams/:userId/submit` | opt | Grade exam |
| Admin routes | * | Bearer | CRUD scenarios/lessons, validate, stats |

### Database

**Production**: PostgreSQL via Prisma (User, Answer, ExamAttempt, Scenario, Lesson).
**Dev/fallback**: JSON files in `data/progress.json` (answers, exams) + `data/lessons/`
(4 seed lessons). Auth requires PostgreSQL — returns 503 without it.

---

## Content

20 scenario files in `content/sc-0001.json` through `sc-0020.json`, all under
topic `priority_and_intersections`. Each is a declarative scene with
`{scene, actors, question, resolution}` — no coordinates, no text in scene.

---

## Phases

| Phase | Status | What |
|---|---|---|
| 0 — Foundations | ✅ | Schema, codegen, validator, CI |
| 1 — Static renderer | ✅ | Layout, road/marking/sign drawing, golden snapshots |
| 2 — Motion | ✅ | Trajectories, arc-length, choreography, playback |
| 3 — Collision & outcomes | ✅ | OBB collision, 6 classifiers + pure JS engine |
| 4 — Playback modes | ✅ | user_answer, correct_answer, slow-mo, highlight |
| 5 — Scene types | 🔄 | crossroads_4way done; t_junction, roundabout, etc. next |
| 6 — Content editor | 📋 | React form-based editor (not started) |
| 7 — App shell | 📋 | Auth, topic browsing, offline sync |
| 8 — Learning features | 📋 | Spaced repetition, mistake journal |
| 9 — Localisation | 📋 | uz/ru/en locale switching |
| 10 — Monetisation | 📋 | Payme, Click, paywall |

---

## Environment notes

- **Dart SDK**: `.toolchain/dart-sdk/bin/dart.exe` (3.5.4, git-ignored; system
  `dart` on PATH is broken — use `.toolchain/` or the fixed path in `CLAUDE.md`)
- **Flutter SDK**: not installed on this machine. `engine_dart` runs headlessly;
  `frontend/app/` needs Flutter to build.
- **Node**: ≥ 20 required. Use `npm run dev` in the relevant subdirectory.
- **JS engine rebuild**: `cd shared/engine-js && node build.mjs` then re-sync
  (or use tools/sync_engine.js)

---

## Development commands

```sh
# regenerate Dart + TS types after schema change
node tools/codegen.js

# validate all scenarios
node tools/validate.js content

# build pure JS engine
cd shared/engine-js && node build.mjs

# run backend
cd backend && npm run dev

# run web frontend
cd frontend/web && npm install && npm run dev

# Dart engine tests
cd engine_dart && dart pub get && dart test

# render scenarios to PNG
cd engine_dart && dart run bin/render.dart ../content ../build/preview
```

---

## Principles (from CLAUDE.md)

1. Authors declare, they never draw — no hand-placed coordinates
2. Scene data contains zero human-readable text (locale-independent)
3. Rendering is deterministic — no Random, no wall-clock time
4. Outcomes are computed by simulation, not authored hints
5. Offline-first — scenarios are small JSON
6. Every scene round-trips (editor → JSON → engine → editor)
