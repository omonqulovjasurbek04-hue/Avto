# BUILD PROMPT — Driving Education Platform ("Scenario Engine")

> Work through phases in order. Do not skip ahead.

---

## 0. Context

You are helping build a mobile app that teaches Uzbekistan's traffic rules (YHQ) for the driving licence exam.

**The differentiator:** when a student answers a question, the app does not show text. It **plays the student's answer as an animation**, shows the consequence (collision, priority violation, unnecessary wait), then plays the correct answer for comparison.

**Why this is buildable:** we never hand-author animations. Each question is stored as declarative scene data. A deterministic engine derives geometry, trajectories, timing, and collisions from that data. One scene yields every possible playback — all wrong answers and the correct one.

Target scale: ~1200 questions, ~480 of them spatial (animated), 3 locales (`uz`, `ru`, `en`).

---

## 1. Non-negotiable principles

Violating any of these breaks the economics of the project. Flag and stop rather than working around them.

1. **Authors declare, they never draw.** No hand-placed coordinates, no per-question animation files, no hardcoded paths. If a task seems to require drawing a specific scene by hand, the engine is missing a feature — build the feature.
2. **Scene data contains zero human-readable text.** `scene` and `actors` blocks are language-independent. All strings live in `question`, `resolution.rule`, and translation tables. Adding a locale must require zero changes to rendering code.
3. **Rendering is deterministic.** Fixed timestep (60 ticks/sec). No `Random`, no wall-clock time, no frame-rate-dependent physics. The same scenario always produces byte-identical frames. This is required for snapshot testing.
4. **Outcomes are computed, not authored.** Collisions and violations are detected by simulation. `resolution.wrong_outcomes` is a *hint for content review*, not the source of truth. If simulation disagrees with the hint, surface a warning in the editor.
5. **Offline-first.** The app must work fully with no network after first sync. Scenarios are JSON — small. Never stream video.
6. **Every scene must round-trip.** Editor → JSON → engine → editor with no loss.

---

## 2. Tech stack (fixed)

| Layer | Choice |
|---|---|
| Mobile app | Flutter (Dart, stable channel) |
| Scene renderer | `CustomPainter` on `CustomPaint`. Do **not** pull in a game engine unless profiling proves it necessary. |
| Local DB | Drift (SQLite) |
| State | Riverpod |
| Backend (v1) | Supabase — Postgres, Auth (phone OTP), Storage |
| Content editor | React + Vite + TypeScript, Canvas 2D for preview |
| Shared schema | JSON Schema in `/schema`, codegen to both Dart and TS |
| Payments | Payme + Click |
| Analytics | PostHog |

Keep business logic out of Supabase-specific features so a later migration stays cheap.

---

## 3. Repository layout

```
/schema           JSON Schema + generated types (source of truth)
/engine_dart      Pure Dart scenario engine — NO Flutter imports
/frontend/app     Flutter app (depends on engine_dart)
/frontend/editor  React content editor
/frontend/web     React web app
/frontend/mobile  Expo/React Native app
/backend/server   Express REST API server
/content          Scenario JSON files, one per question
/tools            Validators, bulk importers, snapshot test runner
```

`engine_dart` must be pure Dart with no Flutter dependency, so it can run in CI and be unit-tested headlessly. The Flutter layer only paints what the engine outputs.

---

## 4. Scenario schema

See `schema/scenario.schema.json` — the source of truth. Generated types:
`engine_dart/lib/src/generated/scenario.g.dart` and `frontend/editor/src/generated/scenario.g.ts`
(regenerate with `node tools/codegen.js`).

**Enums:**
- `dir`: `N` `S` `E` `W` (extend to `NE`/`NW`/`SE`/`SW` for `y_junction`)
- `priority`: `main` | `secondary` | `equal`
- `kind`: `car` `truck` `bus` `tram` `motorcycle` `bicycle` `pedestrian` `emergency`
- `role`: `player` | `traffic` (default `traffic`)
- `outcome.type`: `collision` `priority_violation` `sign_violation` `marking_violation` `unnecessary_wait` `unsafe_but_legal`
- `lights[].state`: `off` `red` `yellow` `green` `green_blink` `yellow_blink`

---

## 5. Engine specification

### 5.1 Coordinate system

- Logical canvas `1000 × 1000`. Intersection centre at `(500, 500)`.
- Screen convention: **Y grows downward**. `N` = −Y, `S` = +Y, `E` = +X, `W` = −X.
- `LANE_WIDTH = 60`. Vehicle length `90`, width `44`. Tram length `150`.
- Viewport scales to fit; never bake device pixels into the model.

### 5.2 Layout derivation

For each road in direction `D`:
- half-width = `(lanes_in + lanes_out) × LANE_WIDTH / 2`
- The road is a rectangle from the centre out to the canvas edge along `D`.
- The intersection box is the union of all road rectangles clipped near the centre.

**Right-hand traffic.** For an actor entering from `D` and travelling toward the centre, the heading is `−D`. The right-hand side relative to a heading `(x, y)` in screen coords is `(−y, x)`. Incoming lanes sit on that right side.

Lane centre offset for incoming lane index `i` (0 = nearest the centreline):
```
offset = (i + 0.5) × LANE_WIDTH
```
applied along the right vector from the road's centreline.

### 5.3 Trajectories

Entry point = intersection of the actor's incoming lane centre with the canvas edge.
Exit point = intersection of the target road's **outgoing** lane centre with the canvas edge.

| Manoeuvre | Curve |
|---|---|
| Straight (`from` opposite `to`) | Line |
| Right turn | Quadratic Bézier, control point near the inner corner (tight radius) |
| Left turn | Cubic Bézier passing through / past the centre (wide radius) |
| U-turn (`from == to`) | Cubic Bézier, tight loop past the centre |

Arc-length-parameterise each curve so speed is uniform and independent of curve shape.

### 5.4 Choreography

`resolution.order` lists the sequence in which actors clear the conflict zone.

Model:
1. Every actor starts at its entry point and advances to its **stop position** (stop line, or the intersection boundary).
2. Actors are released in `resolution.order`.
3. Actor `n+1` is released once actor `n` has cleared the shared conflict zone, plus `SAFETY_GAP = 0.4s`.
4. Actors with no conflict may move in parallel — check trajectory intersection to decide.

Total playback should land between **4 and 9 seconds**. If it exceeds that, raise a content warning.

### 5.5 Collision detection

- Represent each vehicle as an oriented bounding box; use circle broad-phase then OBB narrow-phase.
- Sample every tick (1/60s).
- On first overlap, emit `CollisionEvent { tick, actorA, actorB, point }` and freeze the simulation.

### 5.6 Outcome classification

Given a chosen option, build a candidate order (chosen actor first, remainder in `resolution.order`), simulate, and classify:

```
1. Collision detected                              → collision
2. Actor crossed a stop line / ignored a give-way
   sign while a higher-priority actor was in the
   conflict zone                                   → priority_violation
3. Actor violated a sign constraint                → sign_violation
4. Actor crossed a prohibited marking              → marking_violation
5. No violation, but chosen actor is later in
   resolution.order than the correct one           → unnecessary_wait
6. Legal but with sub-threshold clearance          → unsafe_but_legal
```

Compare each computed outcome against `resolution.wrong_outcomes` and log any mismatch as a content warning. Never let the authored hint override the simulation.

### 5.7 Playback modes

| Mode | Behaviour |
|---|---|
| `preview` | Frozen at t=0 |
| `user_answer` | Simulate chosen order. On violation: slow to 0.25×, freeze, highlight offender red, pulse the relevant sign/marking |
| `correct_answer` | Simulate `resolution.order`, green highlight on the actor with priority |
| `compare` | Two viewports side by side, synced scrubber (tablet / landscape only) |

Controls: play, pause, scrub, speed `0.25× / 0.5× / 1×`, replay.

### 5.8 Render layers (back to front)

`ground` → `road_surface` → `markings` → `tram_track` → `vehicles` → `signs` → `lights` → `overlays` (highlights, priority arrows, conflict-zone shading) → `hud` (rule badge, timeline)

---

## 6. Phases

Complete each phase's Definition of Done before moving on. Write tests as you go.

### Phase 0 — Foundations ✅
Repo layout, JSON Schema, codegen to Dart + TS, validator CLI, CI.
**DoD:** `tools/validate content/*.json` passes; generated types compile in both languages.

### Phase 1 — Static renderer ✅
Layout derivation, road/marking/sign drawing, vehicles at t=0. Scene type `crossroads_4way` only.
**DoD:** 5 hand-written scenarios render correctly as static images. Golden-file snapshot tests pass.

### Phase 2 — Motion
Trajectory generation, arc-length parameterisation, choreography, playback controls.
**DoD:** All 5 scenarios play smoothly at 60fps on a mid-range Android device. Playback is deterministic across runs.

> ⛔ **CHECKPOINT.** Stop here and show a real user. If the animation does not feel clearly better than a static diagram, the product thesis is wrong. Do not continue to Phase 3 until this is confirmed.

### Phase 3 — Collision & outcomes
OBB collision, the six outcome classifiers, violation visuals.
**DoD:** For each of the 5 scenarios, every wrong option produces the correct outcome type with no authored hints supplied.

### Phase 4 — Playback modes
`user_answer`, `correct_answer`, `compare`, slow-motion, highlight system.
**DoD:** Full answer→consequence→correction loop works end to end.

### Phase 5 — Scene types
Add `t_junction`, `roundabout`, `straight_road`, then `overtaking`, `pedestrian_crossing`, `railway_crossing`, `narrow_road`, `parking_stopping`, `residential_yard`, `tunnel`, `y_junction`.
**DoD:** 3 sample scenarios per scene type render and play correctly.

### Phase 6 — Content editor
React app. **Form-based, not drag-and-drop.** Dropdowns for scene type, roads, priority; picker for signs (with icons); actor list with `from`/`to` selects; i18n text fields per locale; live preview pane; validation warnings; save to Supabase.
**DoD:** A non-programmer authors a complete valid scenario in under 15 minutes without touching JSON.

### Phase 7 — App shell
Phone OTP auth, topic browsing, question flow, offline sync (Drift), progress persistence.
**DoD:** App fully usable in airplane mode after one sync.

### Phase 8 — Learning features
Mistake journal, weak-point map by topic, FSRS spaced repetition, exam simulator (20 questions / 25 min), readiness percentage.
**DoD:** A wrong answer reappears on the correct FSRS schedule and the weak-point map reflects it.

### Phase 9 — Localisation
Locale switching for `uz`, `ru`, `en`; `uz-Cyrl` via transliteration; per-locale content completeness report.
**DoD:** Switching locale changes zero pixels of the animation and all text.

### Phase 10 — Monetisation & launch
Payme + Click, free tier (25 questions), full unlock, paywall, PostHog events, store listings.
**DoD:** A real payment completes and unlocks content.

---

# YHQ Scenario Engine

Mobile app that teaches Uzbekistan's traffic rules by **playing the student's
answer as an animation** — the consequence of a wrong answer (collision,
priority violation, unnecessary wait), then the correct sequence for comparison.

No animation is ever hand-authored. Each question is declarative scene data
(`/content/*.json`); a deterministic engine derives geometry, trajectories,
timing and collisions from it. See `CLAUDE.md` for the full build specification
and phase plan.

## Layout

| Path | What |
|---|---|
| `schema/` | JSON Schema — the source of truth. Types are generated from it. See [schema/README.md](schema/README.md). |
| `engine_dart/` | Pure-Dart scenario engine. No Flutter imports; runs headless in CI. |
| `app/` | Flutter app. Replays the engine's display list via `CustomPainter`. |
| `frontend/editor/` | React content editor (Phase 6). |
| `content/` | One scenario JSON per question. |
| `tools/` | Codegen, validator, content sync. |

## Development

Requires Node ≥ 20 and Dart ≥ 3.5 (the Flutter SDK's Dart works too).
On this machine the SDK lives in `.toolchain/dart-sdk` (git-ignored):

```sh
# regenerate Dart + TS types after editing the schema
node tools/codegen.js

# validate all scenarios (semantic checks + schema)
node tools/validate.js content

# engine tests: unit, round-trip, determinism, golden snapshots
cd engine_dart && dart pub get && dart test

# render every scenario to PNG for eyeballing
cd engine_dart && dart run bin/render.dart ../content ../build/preview

# copy validated content into the app's and viewer's asset dirs
node tools/sync_content.js

# build the browser scenario viewer (compiles the engine to JS and
# verifies it against the Dart build), then serve frontend/editor/public/
node tools/build_viewer.js
```

## Browser viewer

`frontend/editor/public/viewer.html` previews scenarios in a browser. It is not a
reimplementation: `tools/build_viewer.js` compiles `engine_dart` itself to
JavaScript, and the page only knows how to fill a polygon, stroke a path and
fill a circle. All geometry, layering and lane maths stay in the engine, so the
editor's preview cannot drift away from what the app renders.

The build ends by exporting display lists from the Dart VM and diffing them
against the JS build op-by-op (`tools/verify_js.js`, also a CI job). A mismatch
fails the build — an author must never sign off on a preview the student will
not see.

One dart2js behaviour is worth knowing before touching `web/engine_web.dart`:
at `-O1` and above it treats interop writes to globals as side-effect-free and
eliminates them, producing a bundle that loads cleanly and exports nothing. The
entry point therefore hands its exports to a host-provided `__engineRegister`
hook — a call, which cannot be optimised away. `verify_js.js` fails loudly if
the registration ever goes missing again.

Golden snapshots live in `engine_dart/test/goldens/`. They are compared as
decoded pixels with a small tolerance, not as file bytes, so a different zlib
build or a one-ULP `cos` difference between platforms cannot turn CI red. A
failure writes a diff image to `build/golden-diff/` (CI uploads it as an
artifact). If a rendering change is intentional, delete the affected golden and
rerun `dart test` once to regenerate it; commit the new file.

## Content warnings

The engine reports what it could not draw rather than failing silently: an
unrenderable marking, a sign with no artwork, an unsupported scene type. These
come back from `SceneBuilder.build()` as data (`BuiltScene.warnings`), and
`tools/validate.js` reports the same problems before a render is attempted.

`schema/yhq_registry.json` tracks every sign and rule code with a `verified`
flag. **Every code currently in the repo is unverified** — drafted from
Russian-PDD-style numbering and not yet checked against the official Uzbek YHQ
text. The validator warns on each use so the debt stays visible. Confirming
them is cheap now and expensive at 1200 questions.

## Status

- [x] **Phase 0** — schema, codegen (Dart + TS), validator CLI, CI
- [x] **Phase 1** — layout derivation, static renderer, 5 scenarios, golden tests
- [ ] Phase 2 — motion (trajectories, choreography, playback)
- [ ] Phase 3+ — see `CLAUDE.md`

The Flutter app (`app/`) compiles against `engine_dart` but needs a Flutter SDK
installed to build; the engine itself is verified headlessly.
# mashina-test
# Avto
# Avto
# Avto
# Avto


## 7. Guardrails — do not do these

- ❌ Hand-author an animation, keyframe, or explicit coordinate path for a specific question
- ❌ Put any human-readable string inside `scene` or `actors`
- ❌ Hardcode `uz` (or any locale) as a fallback in rendering code
- ❌ Use randomness or wall-clock time in the engine
- ❌ Import Flutter into `engine_dart`
- ❌ Ship video files for explanations
- ❌ Build drag-and-drop editing before Phase 6 is shipped and used
- ❌ Start the B2B LMS module before the B2C app has real users

---

## 8. Working style

- Small commits, one concern each.
- Every engine behaviour gets a unit test; every scene type gets a golden snapshot test.
- When a scenario cannot be expressed in the schema, **propose a schema change** — do not special-case it in code.
- Report content warnings (long playback, outcome mismatch, unreachable option) as data the editor can display, never as silent failures.
- Ask before adding a dependency.

---

## 9. Local environment notes

- Dart SDK: `.toolchain/dart-sdk/bin/dart.exe` (3.5.4, git-ignored; system `dart` on PATH is broken — do not use it).
- Flutter SDK: not installed on this machine. `engine_dart` is verified headlessly; `app/` needs Flutter to build.
- Everyday commands are listed in `README.md`.


# AVTO (YHQ) — Tahlil, Tuzatishlar va To'liq Prompt

Avval aytishim kerak: bu — biz oldin muhokama qilgan "video yozib qo'yish" yondashuvidan **ancha ustun** arxitektura. Siz 50-100 ta video yozish o'rniga **deterministik 2D simulyatsiya dvigateli** qurgansiz — bu professional yondashuv, chunki:
- Video assetlar shart emas (storage, CDN xarajati yo'q)
- Cheksiz ssenariy qo'shish mumkin (faqat JSON yozish kifoya)
- Har bir tilda (uz/ru/en) qayta render qilish kerak emas

Endi 10 yillik dasturchi nazari bilan **muammoli joylarni** ko'rsataman va tuzataman.

## 1. Aniqlangan muammolar va tuzatishlar

| # | Muammo | Xavf darajasi | Tuzatish |
|---|--------|---|----------|
| 1 | **DB — JSON fayl** (`data/progress.json`), Mongo/Postgres CRUD yozilmagan | 🔴 Yuqori | Productionga chiqishdan oldin **SQLite → PostgreSQL** ga o'tish shart. JSON fayl bilan concurrent yozishda (`writeChain` bo'lsa ham) 100+ foydalanuvchida barbod bo'ladi |
| 2 | **Auth yo'q** — `progress/:userId` orqali oddiy string ID bilan ishlaydi, parol/token tekshiruvi ko'rinmaydi | 🔴 Yuqori | Har qanday kishi boshqa userId bilan boshqa odamning progressini o'qishi/o'zgartirishi mumkin. **JWT auth shart** |
| 3 | **Kontent 5 joyga nusxalanadi** (`sync_content.js`) — har birida alohida fayl | 🟡 O'rta | Keraksiz murakkablik va sinxronizatsiya xatosi xavfi. Barcha frontendlar **to'g'ridan-to'g'ri API'dan** (`GET /api/scenarios/:id`) o'qisin, static nusxalash shart emas |
| 4 | **Engine.js 4 joyga nusxalanadi** (`sync_engine.js`) | 🟡 O'rta | Xuddi shu sabab — backend'dan **bitta static URL** orqali serve qilish yetarli (`/engine.js`), CDN keshlash bilan |
| 5 | **Flutter app — skeleton, SDK o'rnatilmagan** | 🟢 Past | Hozircha e'tiborsiz qoldirish mumkin, resurslarni Web+Mobile'ga yo'naltirish tavsiya etiladi (2 platforma allaqachon yetarli ish) |
| 6 | **112 ta ogohlantirish** (`verified: false` belgilar, tarjima yo'qligi) | 🟡 O'rta | Productionga chiqishdan oldin YHQ rasmiy matni bilan **tasdiqlash** kerak — noto'g'ri huquqiy ma'lumot bo'lsa, foydalanuvchi noto'g'ri o'rganadi |
| 7 | **MAX_ANSWERS = 500** cheklovi | 🟢 Past | Faol foydalanuvchi uchun kam bo'lishi mumkin — DB'ga o'tgach bu muammo o'z-o'zidan hal bo'ladi |

## 2. Tuzatilgan struktura (asosiy o'zgarishlar)

```diff
backend/server/
├── src/
│   ├── db.mjs                    ← JSON/Mongo/Postgres abstraktsiya
+ │   ├── db/
+ │   │   ├── prisma/schema.prisma  ← ✅ YANGI: Postgres orqali
+ │   │   │   (User, Scenario, Lesson, ExamAttempt, Answer)
+ │   ├── auth/
+ │   │   ├── auth.middleware.mjs   ← ✅ YANGI: JWT tekshiruv
+ │   │   └── auth.routes.mjs       ← ✅ YANGI: /register, /login

frontend/web/public/
- │   ├── content/                 ← ❌ OLIB TASHLASH: API'dan to'g'ridan o'qiladi
- │   ├── engine.js                ← ❌ OLIB TASHLASH: backend static URL'dan

frontend/mobile/assets/
- │   ├── content/                 ← ❌ OLIB TASHLASH
- │   ├── engine.js                ← ❌ OLIB TASHLASH (yoki bundle vaqtida bir marta yuklab olinadi)

tools/
- ├── sync_content.js              ← ❌ ENDI KERAK EMAS
- ├── sync_engine.js                ← ❌ ENDI KERAK EMAS
```

**Natija:** `sync_content.js` va `sync_engine.js` skriptlari butunlay olib tashlanadi, chunki barcha platformalar bitta manbadan (`GET /api/scenarios`, `GET /engine.js`) foydalanadi. Bu **kod dublikatsiyasini yo'qotadi** va yangi ssenariy qo'shilganda faqat bitta joyni yangilash kifoya qiladi.

## 3. Prisma schema (JSON fayl o'rniga)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  answers   Answer[]
  exams     ExamAttempt[]
}

model Answer {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  scenarioId String   // sc-0001 kabi
  optionId   String
  isCorrect  Boolean
  answeredAt DateTime @default(now())
}

model ExamAttempt {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  score     Int
  total     Int
  passed    Boolean
  createdAt DateTime @default(now())
}
```

Ssenariy va darsliklar JSON fayl sifatida qolishi mumkin (`content/sc-XXXX.json`) — ular statik kontent, foydalanuvchi ma'lumoti emas. Faqat **foydalanuvchiga tegishli dinamik ma'lumotlar** (progress, exam natijalari) DB'ga ko'chadi.

## 4. Yangilangan API endpointlar (auth qo'shilgan holda)

```http
POST   /api/auth/register        { email, password }
POST   /api/auth/login           { email, password } → { token }
GET    /api/auth/me              (Bearer token) → user ma'lumoti

GET    /api/scenarios             (o'zgarishsiz)
GET    /api/scenarios/:id/info
GET    /api/scenarios/:id/frame

GET    /api/progress              (Bearer token — endi :userId shart emas, token'dan olinadi)
POST   /api/progress/answer       (Bearer token) { scenarioId, optionId }

GET    /api/exams/generate
POST   /api/exams/submit          (Bearer token) { answers[] }
```

## 5. To'liq Prompt (AI-agent yoki jamoaga berish uchun)

```
LOYIHA: AVTO (YHQ) — O'zbekiston YHQ interaktiv ta'lim platformasi

ARXITEKTURA (mavjud, saqlanadi):
- Monorepo (npm workspaces): schema/, engine_dart/, shared/engine-js/,
  backend/server/, frontend/web/, frontend/mobile/, content/, tools/
- Pure Dart engine (Flutter'siz) → dart2js orqali JS'ga kompilyatsiya qilinadi
- Ssenariy JSON schema orqali tasvirlanadi (scene, actors, question, resolution)
- Engine deterministik 2D simulyatsiya hisoblaydi: Bézier traektoriya,
  60 FPS tick, OBB collision, 6 turdagi natija (collision, priority_violation, va h.k.)
- Renderer faqat 3 primitiv orqali chizadi: fillPolygon, strokePath, fillCircle
- Backend: Express.js, portu 4000
- Web: React + Vite, dark mode dizayn
- Mobil: Expo + React Native, WebView orqali engine ishlaydi

QILINISHI KERAK BO'LGAN O'ZGARISHLAR (ustuvorlik tartibida):

1. AUTH TIZIMI QO'SHISH (eng muhim, hozir yo'q):
   - backend/server/src/auth/ papkasi yaratish
   - JWT asosida register/login/middleware
   - Barcha /api/progress va /api/exams endpointlarini 
     Bearer token bilan himoyalash

2. DB NI JSON FAYLDAN POSTGRESQL GA KO'CHIRISH:
   - Prisma o'rnatish, yuqoridagi schema (User, Answer, ExamAttempt) qo'shish
   - db.mjs dagi JSON fayl logikasini Prisma client bilan almashtirish
   - Mavjud data/progress.json dan migratsiya skripti yozish

3. KONTENT DUBLIKATSIYASINI OLIB TASHLASH:
   - sync_content.js va sync_engine.js skriptlarini o'chirish
   - Barcha frontendlar (web, mobile) content va engine.js ni
     to'g'ridan-to'g'ri backend API/static URL orqali oladi
   - CORS va keshlash sarlavhalarini (Cache-Control) backend'da sozlash

4. YHQ KONTENTINI TASDIQLASH:
   - schema/yhq_registry.json dagi verified: false belgilarni
     rasmiy YHQ hujjati bilan solishtirib tasdiqlash
   - Tarjima yo'q bo'lgan option'lar uchun ru/en matnlarini to'ldirish

5. QOLGAN FAZALARNI DAVOM ETTIRISH:
   - Phase 2 (harakat) ni yakunlash
   - Phase 3 (collision) — 6 ta natija turini to'liq testlash
   - Phase 7 (auth, offline sync) — yuqoridagi auth bilan mos ravishda

TEXNIK CHEKLOVLAR (o'zgarishsiz saqlanishi kerak):
- Engine pure Dart bo'lib qolishi kerak (Flutter importi YO'Q)
- Renderer faqat 3 primitivdan foydalanadi
- Barcha ssenariylar deterministik bo'lishi kerak (randomness yo'q)
- Schema o'zgarsa — codegen.js orqali Dart+TS tiplarni qayta generatsiya qilish shart

Iltimos, 1-bosqichdan (Auth tizimi) boshlab, backend/server/src/auth/ 
papkasini to'liq kod bilan yarating: auth.routes.mjs, auth.middleware.mjs,
va Prisma User modelini bog'lovchi auth.service.mjs.
```

Qaysi bosqichdan (Auth, DB migratsiyasi, yoki kontent dublikatsiyasini olib tashlash) boshlashni xohlaysiz — to'liq kod bilan yozib beraymi?



# 🚗 AVTO (YHQ) — To'liq Loyiha Hujjati

> O'zbekiston Yo'l Harakati Qoidalari (YHQ) bo'yicha interaktiv ta'lim platformasi.
> Foydalanuvchi savolga javob berganida natija **2D animatsiya** sifatida ko'rsatiladi.

---

## 📋 Mundarija

1. [Loyiha Maqsadi](#1-loyiha-maqsadi)
2. [Texnologiyalar](#2-texnologiyalar)
3. [Monorepo Strukturasi](#3-monorepo-strukturasi)
4. [Schema — Ma'lumotlar Manbai](#4-schema--malumotlar-manbai)
5. [Engine Dart — Simulyatsiya Dvigateli](#5-engine-dart--simulyatsiya-dvigateli)
6. [Shared Engine-JS — Brauzer Ko'prigi](#6-shared-engine-js--brauzer-koprigi)
7. [Backend Server — REST API](#7-backend-server--rest-api)
8. [Frontend Web — React SPA](#8-frontend-web--react-spa)
9. [Frontend Mobile — Expo App](#9-frontend-mobile--expo-app)
10. [Frontend App — Flutter (Skeleton)](#10-frontend-app--flutter-skeleton)
11. [Content — Ssenariy Fayllari](#11-content--ssenariy-fayllari)
12. [Tools — Ishchi Skriptlar](#12-tools--ishchi-skriptlar)
13. [Ma'lumot Oqimi (Data Flow)](#13-malumot-oqimi)
14. [API Endpoint Hujjati](#14-api-endpoint-hujjati)
15. [Ishga Tushirish Buyruqlari](#15-ishga-tushirish-buyruqlari)
16. [Test va Tekshirish](#16-test-va-tekshirish)
17. [Loyiha Fazalari](#17-loyiha-fazalari)

---

## 1. Loyiha Maqsadi

Bu platforma haydovchilik guvohnomasiga tayyorgarlik ko'rayotgan foydalanuvchilarga
**interaktiv 2D animatsiyalar** orqali yo'l harakati qoidalarini o'rgatadi.

**Asosiy farqi boshqa ilovalardan:**

- Har bir savol uchun **video yoki animatsiya qo'lda yaratilmaydi**
- Ssenariy JSON fayl sifatida yoziladi, **engine avtomatik** yo'l, mashinalar,
  traektoriyalar va to'qnashuvlarni hisoblaydi
- Xato javob berilsa — mashina **haqiqatan to'qnashadi** yoki **qoida buzilishi**
  ko'rsatiladi
- To'g'ri javob — mashinalar muammosiz o'tadi

---

## 2. Texnologiyalar

| Qatlam         | Texnologiya              | Versiya           |
| -------------- | ------------------------ | ----------------- |
| **Monorepo**   | npm workspaces           | Node ≥ 20         |
| **Engine**     | Pure Dart (Flutter-siz)  | Dart ≥ 3.5        |
| **Engine → JS**| dart2js                  | —                 |
| **Backend**    | Express.js               | 4.x               |
| **Web**        | React + Vite             | React 18 + Vite 5 |
| **Mobile**     | Expo + React Native      | Expo 51, RN 0.74  |
| **Flutter**    | Flutter (skeleton)       | SDK ≥ 3.0         |
| **Schema**     | JSON Schema 2020-12      | —                 |
| **Test**       | Node built-in test       | —                 |
| **DB**         | JSON file (fallback)     | —                 |

---

## 3. Monorepo Strukturasi

```
Avto/                                ← Loyiha ildizi (monorepo root)
│
├── package.json                     ← Workspaces konfiguratsiyasi
├── package-lock.json                ← Dependency lock
├── CLAUDE.md                        ← Loyiha printsiplari va qoidalar
├── README.md                        ← Umumiy ma'lumot
├── Task.md                          ← ← SHU FAYL
├── .gitignore                       ← Git-dan chiqarilgan fayllar
│
│ ══════════════════════════════════════════════════════════════
│ 1. SCHEMA — Barcha tiplar uchun yagona manba
│ ══════════════════════════════════════════════════════════════
│
├── schema/
│   ├── scenario.schema.json         ← Ssenariy sxemasi (229 qator)
│   │                                   Scene, actors, question, resolution
│   ├── question.schema.json         ← Savol banki sxemasi (70 qator)
│   │                                   Matnli savollar (animatsiyasiz ~60%)
│   ├── yhq_registry.json            ← Belgi va qoida kodlari registri
│   │                                   Har biri verified: true/false
│   ├── README.md                    ← Schema konventsiyalar hujjati
│   └── generated/
│       └── scenario.g.ts            ← [AUTO] TS tiplar (codegen yaratadi)
│
│ ══════════════════════════════════════════════════════════════
│ 2. ENGINE — Deterministik 2D simulyatsiya
│ ══════════════════════════════════════════════════════════════
│
├── engine_dart/
│   ├── pubspec.yaml                 ← Dart paket (Flutter-siz!)
│   ├── lib/
│   │   ├── engine.dart              ← Kutubxona eksporti
│   │   └── src/
│   │       ├── generated/
│   │       │   └── scenario.g.dart  ← [AUTO] Dart tiplar (codegen yaratadi)
│   │       │
│   │       ├── geom.dart            ← Geometriya: Vec2, OBB, polyline (7 KB)
│   │       ├── layout.dart          ← Yo'l layouti: yo'laklar, markaz (6.3 KB)
│   │       │
│   │       ├── motion/              ← HARAKAT TIZIMI
│   │       │   ├── trajectory.dart  ←   Bézier traektoriyalar (6.5 KB)
│   │       │   │                        to'g'ri / chap / o'ng / U-turn
│   │       │   ├── curve.dart       ←   Arc-length parametrizatsiya (5 KB)
│   │       │   │                        bir tekis tezlik uchun
│   │       │   ├── choreography.dart←   resolution.order ketma-ketlik (6.8 KB)
│   │       │   ├── simulation.dart  ←   60 FPS tick simulyatsiya (3.4 KB)
│   │       │   │                        OBB collision check har kadrda
│   │       │   ├── motion_profile.dart← Tezlik profillari (4.7 KB)
│   │       │   │                        tezlanish, sekinlashish, to'xtash
│   │       │   ├── playback.dart    ←   3 rejim: preview/user/correct (2.7 KB)
│   │       │   └── outcome.dart     ←   6 ta natija klassifikator (7.3 KB)
│   │       │                            collision, priority_violation, ...
│   │       │
│   │       └── render/              ← CHIZISH TIZIMI
│   │           ├── scene_builder.dart← Display list yaratish (14.5 KB)
│   │           │                       ENG KATTA FAYL — barcha qatlamlar
│   │           ├── draw_op.dart     ←  3 primitiv: fillPolygon, strokePath,
│   │           │                       fillCircle (4.2 KB)
│   │           ├── palette.dart     ←  Ranglar palettasi (5.6 KB)
│   │           ├── sign_art.dart    ←  Yo'l belgilari rasmlari (4.4 KB)
│   │           ├── scene_json.dart  ←  JSON serialization (2.5 KB)
│   │           ├── scene_player.dart←  Playback controller (2.6 KB)
│   │           ├── viewport.dart    ←  1000×1000 → real pixel (2 KB)
│   │           └── content_warning.dart ← Ogohlantirish tizimi (2 KB)
│   │
│   ├── web/
│   │   └── engine_web.dart          ← dart2js entry point
│   │                                   __engineRegister() hook orqali eksport
│   ├── bin/
│   │   ├── export_scene.dart        ← Display list → JSON eksport
│   │   ├── render.dart              ← Ssenariy → PNG render
│   │   └── render_frames.dart       ← Kadrlar ketma-ketligi → PNG
│   │
│   └── test/                        ← 13 ta test fayl
│       ├── geom_test.dart           ←   Vec2 arifmetika, OBB collision
│       ├── layout_test.dart         ←   Yo'l layout, yo'lak pozitsiyalari
│       ├── trajectory_test.dart     ←   Bézier traektoriya (9.2 KB)
│       ├── choreography_test.dart   ←   Actor ketma-ketligi
│       ├── simulation_test.dart     ←   Tick-tick simulyatsiya
│       ├── motion_profile_test.dart ←   Tezlik profili
│       ├── playback_test.dart       ←   Preview/user/correct
│       ├── outcome_test.dart        ←   6 ta natija
│       ├── palette_test.dart        ←   Rang to'g'riligi
│       ├── purity_test.dart         ←   Flutter import YO'Q tekshiruvi
│       ├── roundtrip_test.dart      ←   JSON encode→decode fixpoint
│       ├── snapshot_test.dart       ←   Golden pixel solishtirish
│       ├── motion_golden_test.dart  ←   Harakat golden snapshot
│       └── goldens/                 ←   Golden test rasmlari
│
│ ══════════════════════════════════════════════════════════════
│ 3. SHARED ENGINE-JS — Dart → JS ko'prik
│ ══════════════════════════════════════════════════════════════
│
├── shared/engine-js/
│   ├── package.json                 ← NPM paketi: @yhq/engine
│   ├── engine.js                    ← dart2js compiled bundle (132 KB)
│   ├── index.mjs                    ← Entry: loadEngineNode + drawDisplayList
│   ├── load.node.mjs                ← Node.js vm moduli orqali yuklash
│   ├── renderer.mjs                 ← Canvas 2D renderer (57 qator)
│   │                                   Faqat 3 operatsiya:
│   │                                   fillPolygon, strokePath, fillCircle
│   └── types.d.ts                   ← TypeScript type definitsiyalar
│
│ ══════════════════════════════════════════════════════════════
│ 4. BACKEND — Express REST API Server
│ ══════════════════════════════════════════════════════════════
│
├── backend/server/
│   ├── package.json                 ← NPM paketi: @yhq/server
│   ├── src/
│   │   ├── index.mjs               ← Server entry (port 4000, 0.0.0.0)
│   │   │                              CORS, static, error handler
│   │   ├── routes.mjs              ← API marshrutlari (290+ qator)
│   │   │                              scenarios, lessons, progress,
│   │   │                              exams, admin — barchasi shu yerda
│   │   ├── engine.mjs              ← @yhq/engine wrapper (38 qator)
│   │   │                              sceneInfo(), frame(), EngineError
│   │   ├── content.mjs             ← Ssenariy JSON fayllarni CRUD (71 qator)
│   │   │                              path traversal himoyasi bor
│   │   ├── lessons.mjs             ← Darsliklar CRUD (165 qator)
│   │   │                              Birinchi ishga tushirishda 4 ta
│   │   │                              boshlang'ich darslik yaratiladi
│   │   └── db.mjs                  ← DB abstraktsiyasi (117 qator)
│   │                                  JSON / MongoDB / PostgreSQL
│   │                                  Hozirda faqat JSON ishlaydi
│   │                                  Atomic write + serialized mutations
│   ├── test/
│   │   └── api.test.mjs            ← 4 ta unit test
│   ├── data/
│   │   ├── .gitkeep
│   │   ├── progress.json           ← [RUNTIME] Foydalanuvchi progress
│   │   └── lessons/                ← [RUNTIME] Darslik JSON fayllari
│   └── public/
│       ├── index.html              ← Standalone landing
│       ├── player.html             ← Standalone ssenariy player
│       ├── landing.html            ← Marketing landing
│       ├── videos.html             ← Video preview
│       ├── engine.js               ← [SYNC] Engine nusxasi
│       ├── content/                ← [SYNC] Ssenariy nusxalari
│       ├── icon.svg                ← Favicon
│       ├── manifest.webmanifest    ← PWA manifest
│       └── sw.js                   ← Service worker (offline qo'llab-q.)
│
│ ══════════════════════════════════════════════════════════════
│ 5. FRONTEND WEB — React + Vite SPA
│ ══════════════════════════════════════════════════════════════
│
├── frontend/web/
│   ├── package.json                ← NPM paketi: @yhq/web
│   ├── vite.config.js              ← Vite (proxy → localhost:4000)
│   ├── index.html                  ← HTML entry
│   │                                  __engineRegister hook + engine.js
│   │                                  Google Fonts: Plus Jakarta Sans, Outfit
│   ├── public/
│   │   ├── engine.js               ← [SYNC] Engine nusxasi
│   │   └── content/                ← [SYNC] Ssenariy nusxalari
│   └── src/
│       ├── main.jsx                ← React entry point
│       ├── App.jsx                 ← Asosiy komponent
│       │                              6 tab: home, lessons, practice,
│       │                              exam, analytics, admin
│       │                              Til almashtirgich: UZ / RU / EN
│       │                              Glassmorphism sticky header
│       │
│       ├── index.css               ← CSS dizayn tizimi (942 qator)
│       │                              Dark mode (#0b0f19 → #151c2c)
│       │                              Glassmorphism, gradients, glow
│       │                              Responsive: 1024px, 900px breakpoint
│       │
│       ├── components/
│       │   └── ScenarioPlayer.jsx  ← ⭐ ENG MUHIM KOMPONENT
│       │                              Canvas 2D animatsiya pleyeri
│       │                              HiDPI DPR scaling
│       │                              requestAnimationFrame 60 FPS
│       │                              2 rejim: user / correct
│       │                              Playback: ▶/⏸, scrubber, 0.25x-1x
│       │                              Natija: ✅ / 💥 / ⚠️ bannerlari
│       │
│       └── pages/
│           ├── HomePage.jsx        ← Bosh sahifa
│           │                          Hero banner + gradient
│           │                          4 ta statistika kartochka
│           │                          5 ta feature kartochka
│           │                          Tezkor mavzu pills
│           │
│           ├── PracticePage.jsx    ← Mashq rejimi
│           │                          API-dan ssenariy ro'yxat
│           │                          Topic bo'yicha filtr
│           │                          Ssenariy pills bar
│           │                          ScenarioPlayer + prev/next
│           │                          POST /api/progress/.../answer
│           │
│           ├── ExamPage.jsx        ← Imtihon rejimi
│           │                          GET /api/exams/generate (20 savol)
│           │                          20 daqiqalik countdown taymer
│           │                          Savol palette (yashil/ko'k)
│           │                          18/20 = o'tish bali (90%)
│           │
│           ├── LessonsPage.jsx     ← Nazariy darsliklar
│           │                          Sidebar + detail pane layout
│           │                          Darslik bo'limlari (sections)
│           │                          Yo'l belgilari badges
│           │                          Mashq sahifasiga CTA
│           │
│           ├── AnalyticsPage.jsx   ← Statistika
│           │                          Summary kartochkalar
│           │                          Oxirgi 10 ta urinish jadvali
│           │
│           └── AdminPage.jsx       ← Admin panel (596 qator)
│                                      4 tab: Ssenariylar, Darsliklar,
│                                      Engine Validator, Tizim Statistikasi
│                                      CRUD modal formlar
│                                      Schema-ga mos option ID: o1, o2, D
│
│ ══════════════════════════════════════════════════════════════
│ 6. FRONTEND MOBILE — Expo React Native
│ ══════════════════════════════════════════════════════════════
│
├── frontend/mobile/
│   ├── package.json                ← NPM paketi: @yhq/mobile
│   ├── app.json                    ← Expo config (dark mode, com.yhq.avto)
│   ├── App.js                      ← Bottom tab navigation (4 tab)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.js       ← Hero + navigatsiya kartochkalari
│   │   │   ├── PracticeScreen.js   ← Ssenariy tanlash + MobilePlayer
│   │   │   │                          API: http://10.0.2.2:4000 (emulator)
│   │   │   ├── ExamScreen.js       ← Imtihon rejimi
│   │   │   └── StatsScreen.js      ← Statistika
│   │   └── components/
│   │       └── MobileScenarioPlayer.js ← WebView ichida engine (12.8 KB)
│   │                                      HTML inline yaratadi
│   │                                      postMessage aloqa
│   └── assets/
│       ├── content/                ← [SYNC] Ssenariy nusxalari
│       ├── engine.js               ← [SYNC] Engine nusxasi
│       ├── icon.png                ← Ilova ikonkasi
│       ├── splash.png              ← Splash ekran
│       ├── adaptive-icon.png       ← Android adaptive icon
│       └── favicon.png             ← Web favicon
│
│ ══════════════════════════════════════════════════════════════
│ 7. FLUTTER APP (Skeleton)
│ ══════════════════════════════════════════════════════════════
│
├── frontend/app/
│   ├── pubspec.yaml                ← engine_dart-ga path dependency
│   ├── lib/
│   │   ├── main.dart               ← Flutter MaterialApp
│   │   └── scene_painter.dart      ← CustomPainter (display list chizadi)
│   └── assets/content/             ← [SYNC] Ssenariy nusxalari
│
│ ══════════════════════════════════════════════════════════════
│ 8. CONTENT EDITOR (Phase 6 — bo'sh)
│ ══════════════════════════════════════════════════════════════
│
├── frontend/editor/
│   ├── src/generated/
│   │   └── scenario.g.ts           ← [AUTO] TS tiplar
│   └── public/
│       ├── viewer.html              ← Ssenariy preview sahifasi
│       ├── engine.js                ← [SYNC] Engine nusxasi
│       └── content/                 ← [SYNC] Ssenariy nusxalari
│
│ ══════════════════════════════════════════════════════════════
│ 9. CONTENT — Ssenariy fayllari
│ ══════════════════════════════════════════════════════════════
│
├── content/                         ← 20 ta ssenariy JSON
│   ├── sc-0001.json                 ← 4-way crossroads, priority, 2 actor
│   ├── sc-0002.json                 ← Tram priority, equal intersection
│   ├── sc-0003.json — sc-0020.json  ← Turli chorrahalar va qoidalar
│   └── (barchasi topic: priority_and_intersections)
│
│ ══════════════════════════════════════════════════════════════
│ 10. TOOLS — Qurilish va sinxronizatsiya
│ ══════════════════════════════════════════════════════════════
│
├── tools/
│   ├── codegen.js                   ← Schema → Dart + TS tiplar (289 qator)
│   ├── validate.js                  ← Schema + semantic tekshiruv (3.4 KB)
│   ├── sync_content.js              ← content/ → 5 ta papkaga nusxalash
│   ├── sync_engine.js               ← engine.js → 4 ta papkaga nusxalash
│   ├── verify_js.js                 ← Dart VM vs dart2js solishtirish
│   ├── build_viewer.js              ← Browser viewer qurilishi
│   ├── generate_scenarios.js        ← Ssenariy generatsiyasi
│   ├── make_videos.js               ← Video eksport
│   └── lib/
│       └── semantic.js              ← Semantic tekshirish qoidalari
│
│ ══════════════════════════════════════════════════════════════
│ 11. BOSHQA
│ ══════════════════════════════════════════════════════════════
│
├── docs/                            ← Dizayn hujjatlari
└── .github/                         ← GitHub CI/CD
```

---

## 4. Schema — Ma'lumotlar Manbai

### 4.1 scenario.schema.json — Ssenariy Tuzilishi

```
Scenario
├── id: "sc-XXXX"                    ← Yagona identifikator
├── schema_version: 1                ← Doim 1 (o'zgarsa migration yoziladi)
├── question_id: "q-XXXX"           ← Savol bankidagi ID
├── topic: (13 dan 1)               ← Mavzu
│
├── scene                            ← CHORAHA / YO'L TAVSIFI
│   ├── type: (12 dan 1)            ← crossroads_4way, t_junction, ...
│   ├── roads[]:                     ← Yo'llar ro'yxati
│   │   ├── dir: "N"|"S"|"E"|"W"    ← Kompas yo'nalishi
│   │   ├── lanes_in: number        ← Kirish yo'laklari soni
│   │   ├── lanes_out: number       ← Chiqish yo'laklari soni
│   │   └── priority: "main"|"secondary"|"equal"
│   ├── signs[]:                     ← Yo'l belgilari
│   │   ├── at: "N"|"S"|"E"|"W"     ← Qaysi yo'lda
│   │   └── code: "2.1"|"2.4"|...   ← Belgi kodi
│   ├── markings[]:                  ← Yo'l chiziqlari
│   │   ├── type: "crosswalk"|...
│   │   └── at: "N"|"S"|"E"|"W"
│   ├── lights[]:                    ← Svetoforlar
│   │   ├── at: "all"|"N"|...
│   │   └── state: "green"|"red"|"off"|...
│   ├── tram_track?: { along: "NS"|"EW" }
│   └── conditions:
│       ├── time: "day"|"night"|"dusk"
│       └── weather: "clear"|"rain"|"fog"|"snow"
│
├── actors[]                         ← MASHINALAR
│   ├── id: "ego"|"a1"|"a2"|...     ← Yagona nomi
│   ├── kind: "car"|"truck"|"tram"|"bus"|"motorcycle"|"pedestrian"
│   ├── role?: "player"             ← Faqat "ego" uchun
│   ├── from: "N"|"S"|"E"|"W"      ← Qaerdan keladi
│   ├── to: "N"|"S"|"E"|"W"        ← Qaerga ketadi
│   ├── lane_in?: number            ← Qaysi yo'lakdan kiradi
│   ├── lane_out?: number           ← Qaysi yo'lakdan chiqadi
│   └── color?: string              ← Mashina rangi
│
├── question                         ← SAVOL
│   ├── text:                        ← Savol matni (3 tilda)
│   │   ├── uz: "..."
│   │   ├── ru: "..."
│   │   └── en: "..."
│   ├── options[]:                   ← Javob variantlari (2-5 ta)
│   │   ├── id: "o1"|"o2"|"D"       ← Option identifikator
│   │   ├── refers_to?: "a1"|"ego"  ← Qaysi actorga tegishli
│   │   └── label: { uz, ru, en }   ← Variant matni
│   └── correct: "o1"               ← To'g'ri javob IDsi
│
└── resolution                       ← YECHIM
    ├── order: ["a1", "ego"]         ← To'g'ri o'tish ketma-ketligi
    ├── rule:                        ← Qoida
    │   ├── code: "13.9"             ← YHQ qoida raqami
    │   └── text: { uz, ru, en }     ← Qoida matni
    └── wrong_outcomes:              ← Xato javoblar natijalari
        └── { "o2": { "type": "collision", "with": "a1" } }
```

### 4.2 Mavzular (Topics) — 13 ta

| # | Topic ID | O'zbekcha |
|---|----------|-----------|
| 1 | `priority_and_intersections` | Chorrahalar va imtiyoz |
| 2 | `signs` | Yo'l belgilari |
| 3 | `markings` | Yo'l chiziqlari |
| 4 | `traffic_lights_and_signals` | Svetofor va signallar |
| 5 | `speed_and_distance` | Tezlik va masofa |
| 6 | `overtaking_and_passing` | Quvib o'tish |
| 7 | `stopping_and_parking` | To'xtash va turish |
| 8 | `pedestrians_and_crossings` | Piyodalar va o'tish joyi |
| 9 | `railway_crossings` | Temir yo'l kesishmalari |
| 10 | `special_vehicles` | Maxsus transport vositalari |
| 11 | `vehicle_condition` | Transport vositasi holati |
| 12 | `documents_and_liability` | Hujjatlar va javobgarlik |
| 13 | `first_aid` | Birinchi yordam |

### 4.3 Scene Turlari — 12 ta

| # | Scene Type | Tavsif |
|---|-----------|--------|
| 1 | `crossroads_4way` | 4 yo'lli chorraha |
| 2 | `t_junction` | T-shakl chorraha |
| 3 | `t_junction_left` | T-chap chorraha |
| 4 | `t_junction_right` | T-o'ng chorraha |
| 5 | `roundabout` | Aylanma harakat |
| 6 | `y_junction` | Y-shakl chorraha |
| 7 | `straight_road` | To'g'ri yo'l |
| 8 | `multi_lane_road` | Ko'p yo'lakli yo'l |
| 9 | `one_way_street` | Bir tomonlama yo'l |
| 10 | `highway_entry` | Magistral kirish |
| 11 | `highway_exit` | Magistral chiqish |
| 12 | `parking_area` | Turish joyi |

### 4.4 Natija Turlari (Wrong Outcomes) — 6 ta

| # | Outcome Type | Tavsif | Animatsiyada |
|---|-------------|--------|--------------|
| 1 | `collision` | To'qnashuv | Mashinalar uriladi 💥 |
| 2 | `priority_violation` | Imtiyoz buzilishi | Boshqa mashina to'xtaydi ⚠️ |
| 3 | `sign_violation` | Belgi buzilishi | Belgi yonib-o'chadi |
| 4 | `marking_violation` | Chiziq buzilishi | Chiziq qizaradi |
| 5 | `unnecessary_wait` | Keraksiz kutish | Mashina kutib turadi ⏳ |
| 6 | `unsafe_but_legal` | Qonuniy lekin xavfli | Ogohlantirish |

---

## 5. Engine Dart — Simulyatsiya Dvigateli

### 5.1 Nima qiladi?

```
JSON ssenariy → engine_dart → Display List + Outcomes + Duration
```

1. **JSON o'qiydi** → yo'l shakli, yo'laklar, belgilar, mashinalar
2. **Layout hisoblaydi** → chorraha markazi, koordinatalar
3. **Traektoriya quradi** → Bézier egri chiziqlari
4. **Simulyatsiya** → 60 FPS tick, OBB collision tekshirish
5. **Display List chiqaradi** → chizish buyruqlari ro'yxati

### 5.2 Render Layers (orqadan oldinga)

```
1. ground           ← Yer rangi
2. road_surface      ← Yo'l yuzasi
3. markings          ← Yo'l chiziqlari
4. tram_track        ← Tramvay relslar
5. vehicles          ← Mashinalar
6. signs             ← Yo'l belgilari
7. lights            ← Svetoforlar
8. overlays          ← Ustki qatlam
9. hud               ← HUD (Head-Up Display)
```

### 5.3 Muhim Xususiyatlar

| Xususiyat | Qiymati |
|-----------|---------|
| Flutter importi | ❌ YO'Q — pure Dart |
| Randomness | ❌ YO'Q — deterministik |
| Wall-clock time | ❌ YO'Q — hisoblangan vaqt |
| FPS | 60 FPS fixed timestep |
| Canvas hajmi | 1000×1000 logical pixels |
| Testlar soni | 13 ta test fayl |

---

## 6. Shared Engine-JS — Brauzer Ko'prigi

### 6.1 Engine API

```typescript
interface EngineApi {
  version: string;

  // Statik scene (t = 0)
  buildScene(scenarioJson: string): string;

  // To'g'ri javob kadri (vaqt bo'yicha)
  buildFrame(scenarioJson: string, time: number): string;

  // Ssenariy metadata: duration + har bir option uchun outcome
  sceneInfo(scenarioJson: string): string;

  // Tanlangan javob kadri (vaqt bo'yicha)
  optionFrame(scenarioJson: string, optionId: string, time: number): string;
}
```

### 6.2 Renderer — Faqat 3 ta primitiv

```javascript
// renderer.mjs
fillPolygon(ctx, points, color)                     // Ko'pburchak to'ldirish
strokePath(ctx, points, color, width, dashPattern)  // Chiziq tortish
fillCircle(ctx, cx, cy, radius, color)              // Doira to'ldirish
```

### 6.3 dart2js Xususiyati

Engine `window.__engineRegister(...)` hook orqali eksport qiladi.
dart2js `-O1+` optimizatsiyasi global yozishlarni olib tashlaydi,
shuning uchun `window.myEngine = ...` ishlamaydi — function call kerak.

---

## 7. Backend Server — REST API

### 7.1 Server Sozlamalari

| Parametr | Qiymati |
|----------|---------|
| Port | 4000 (0.0.0.0) |
| CORS | `CORS_ORIGINS` env, default: ochiq |
| Static | `public/` papkasidan |
| Engine | `@yhq/engine` npm workspace |
| DB | `data/progress.json` (atomic JSON) |

### 7.2 DB — 3 ta Rejim

| Rejim | Env | Holat |
|-------|-----|-------|
| JSON fayl | default | ✅ Ishlaydi |
| MongoDB | `MONGO_URI` | ⬜ Ulanish bor, CRUD yozilmagan |
| PostgreSQL | `DATABASE_URL` | ⬜ Ulanish bor, CRUD yozilmagan |

### 7.3 DB Xavfsizlik

- **writeChain** — serialized mutations (lost update yo'q)
- **rename()** — atomic write (yarmo-yozilgan fayl yo'q)
- **MAX_ANSWERS = 500** — cheksiz o'sishdan himoya
- **Path traversal** — `if (!/^[\w-]+$/.test(id))` tekshiruv

---

## 8. Frontend Web — React SPA

### 8.1 Dizayn Tizimi

| Xususiyat | Qiymati |
|-----------|---------|
| Rang sxemasi | Dark mode |
| Fon | `#0b0f19` → `#151c2c` → `#1e293b` |
| Accent ranglar | Blue `#3b82f6`, Cyan `#06b6d4`, Green `#10b981`, Red `#ef4444`, Amber `#f59e0b`, Purple `#8b5cf6` |
| Font | Plus Jakarta Sans, Outfit, system-ui |
| Effektlar | Glassmorphism, backdrop-filter, gradient text, glow shadows |
| Animatsiyalar | fadeIn, hover transforms, smooth transitions |
| Responsive | 1024px, 900px breakpointlar |

### 8.2 ScenarioPlayer Ishlash Tartibi

```
1. Ssenariy JSON keladi (props orqali)
2. window.__yhqEngine.sceneInfo() → duration va outcomes olinadi
3. requestAnimationFrame tsikli boshlanadi
4. Har kadrda:
   a. Vaqtni hisoblash (playbackSpeed * delta)
   b. Canvas DPR scaling (HiDPI qurilmalar uchun)
   c. Engine dan frame olish:
      - user rejim → optionFrame(json, optionId, time)
      - correct rejim → buildFrame(json, time)
   d. Display list → renderer.mjs → Canvas 2D ga chizish
5. Foydalanuvchi option tanlaydi → engine outcome hisoblaydi
6. Natija banner ko'rsatiladi (✅ / 💥 / ⚠️)
```

---

## 9. Frontend Mobile — Expo App

### 9.1 MobileScenarioPlayer Ishlash Tartibi

```
1. WebView ichida HTML sahifa yaratiladi (inline)
2. Engine bundle (engine.js) va renderer.mjs inline yuklanadi
3. Ssenariy JSON React Native dan postMessage orqali yuboriladi
4. WebView ichida Canvas 2D animatsiya boshlanadi
5. Natijalar postMessage orqali React Native ga qaytariladi
```

### 9.2 API Server Manzili

| Platforma | Manzil |
|-----------|--------|
| Android Emulator | `http://10.0.2.2:4000` |
| iOS Simulator | `http://localhost:4000` |
| Haqiqiy qurilma | `http://<kompyuter-IP>:4000` |

---

## 10. Frontend App — Flutter (Skeleton)

Flutter SDK o'rnatilmagan — bu papka hozirda skeleton holatida.

| Fayl | Vazifasi |
|------|----------|
| `pubspec.yaml` | engine_dart-ga `path: ../../engine_dart` dependency |
| `main.dart` | MaterialApp + ssenariy tanlash UI |
| `scene_painter.dart` | CustomPainter — engine display list-ni Flutter Canvas ga chizadi |

---

## 11. Content — Ssenariy Fayllari

20 ta ssenariy: `sc-0001.json` dan `sc-0020.json` gacha

**Barcha ssenariylar xususiyatlari:**
- Mavzu: `priority_and_intersections`
- Turlar: `crossroads_4way` va `t_junction`
- Har birida: `ego` (player) + 1-2 ta `a1`/`a2` (traffic)
- Har birida: 2-3 ta javob varianti (o1, o2, D)
- Har birida: YHQ qoida izohi (uz/ru/en)
- Qoidalar: 13.9 (asosiy yo'l), 13.11 (tramvay imtiyozi), 13.12 (chapga burilish)

---

## 12. Tools — Ishchi Skriptlar

### 12.1 codegen.js — Tip Generatsiya (289 qator)

```bash
node tools/codegen.js
```

| Manba | Natija |
|-------|--------|
| `schema/scenario.schema.json` | → `engine_dart/.../scenario.g.dart` |
| `schema/question.schema.json` | → `frontend/editor/.../scenario.g.ts` |
| | → `schema/generated/scenario.g.ts` |

Statistika: **14 enum, 17 class, 1 alias**

### 12.2 validate.js — Tekshiruv

```bash
node tools/validate.js content
```

2 darajali tekshiruv:
1. **Schema validation** — JSON Schema moslik
2. **Semantic validation** — yo'l sonlari, actor havolalari, option IDlar

Hozirgi natija: **20 fayl, 0 xato, 112 ogohlantirish**

Ogohlantirish sabablari:
- Belgi kodlari rasmiy YHQ matni bilan tasdiqlanmagan (`verified: false`)
- Ayrim option-larda ru/en tarjimalar yo'q
- `wrong_outcomes` da "D" optsiyasi uchun hint yo'q

### 12.3 sync_content.js — Kontent Tarqatish

```bash
node tools/sync_content.js
```

`content/` → 5 ta joyga nusxalaydi:
1. `frontend/app/assets/content/`
2. `frontend/editor/public/content/`
3. `backend/server/public/content/`
4. `frontend/web/public/content/`
5. `frontend/mobile/assets/content/`

### 12.4 sync_engine.js — Engine Tarqatish

```bash
node tools/sync_engine.js
```

`shared/engine-js/engine.js` → 4 ta joyga:
1. `backend/server/public/engine.js`
2. `frontend/web/public/engine.js`
3. `frontend/mobile/assets/engine.js`

### 12.5 verify_js.js — Dart vs JS Tekshiruv

```bash
node tools/verify_js.js
```

Dart VM va dart2js natijalarini op-by-op solishtiradi.
Farq bo'lsa — build fail qiladi.

---

## 13. Ma'lumot Oqimi

### Kontent yaratish oqimi:

```
Schema (scenario.schema.json)
    ↓ codegen.js
Dart tiplar (scenario.g.dart) + TS tiplar (scenario.g.ts)
    ↓
Kontent muallifi ssenariy yozadi (content/sc-XXXX.json)
    ↓ validate.js
Schema + Semantic tekshiruv
    ↓ sync_content.js + sync_engine.js
Barcha platformalarga tarqatiladi
```

### Runtime oqimi:

```
Foydalanuvchi → Web/Mobile ilova
    ↓
GET /api/scenarios → ssenariy JSON oladi
    ↓
ScenarioPlayer yuklaydi
    ↓
window.__yhqEngine.sceneInfo(json) → duration + outcomes
    ↓
Animatsiya boshlanadi (requestAnimationFrame)
    ↓
Har kadrda: optionFrame(json, option, time) → Display List
    ↓
renderer.mjs → Canvas 2D ga chizadi
    ↓
Foydalanuvchi javob tanlaydi
    ↓
Engine outcome hisoblaydi → Natija ko'rsatiladi
    ↓
POST /api/progress/:userId/answer → DB ga yoziladi
```

---

## 14. API Endpoint Hujjati

### Sog'liqni Tekshirish

```http
GET /api/health
→ { "status": "ok", "engine": "0.1.0", "scenarios": 20 }
```

### Ssenariylar

```http
GET /api/scenarios
GET /api/scenarios?topic=signs
GET /api/scenarios?type=crossroads_4way
→ [{ "id": "sc-0001", "topic": "...", "type": "..." }, ...]

GET /api/scenarios/sc-0001
→ { "id": "sc-0001", "scene": {...}, "actors": [...], "question": {...} }

GET /api/scenarios/sc-0001/info
→ { "duration": 5.0, "options": { "o1": { "clean": true }, "o2": { "clean": false, "type": "collision" } } }

GET /api/scenarios/sc-0001/frame?t=2.5&option=o2
→ { "canvas": 1000, "ops": [{ "op": "fillPolygon", ... }, ...] }
```

### Darsliklar

```http
GET /api/lessons
→ [{ "id": "lesson-xxx", "title": "...", "description": "..." }, ...]

GET /api/lessons/lesson-xxx
→ { "id": "...", "title": "...", "sections": [...] }
```

### Progress

```http
GET /api/progress/user-web
→ { "total": 50, "correct": 42, "wrong": 8, "answers": [...] }

POST /api/progress/user-web/answer
Body: { "scenarioId": "sc-0001", "optionId": "o1" }
→ { "ok": true, "correct": true, "outcome": { "clean": true } }
```

### Imtihon

```http
GET /api/exams/generate
→ { "scenarios": [...20 ta random ssenariy...] }

POST /api/exams/user-web/submit
Body: { "answers": [{ "scenarioId": "sc-0001", "optionId": "o1" }, ...] }
→ { "score": 18, "total": 20, "passed": true, "results": [...] }
```

### Admin

```http
POST /api/admin/scenarios
Body: { "id": "sc-0021", "scene": {...}, ... }
→ { "ok": true, "scenario": {...} }

DELETE /api/admin/scenarios/sc-0021
→ { "ok": true }

POST /api/admin/lessons
Body: { "title": "...", "description": "...", ... }
→ { "ok": true, "lesson": {...} }

DELETE /api/admin/lessons/lesson-xxx
→ { "ok": true }

GET /api/admin/validate
→ { "files": 20, "errors": 0, "warnings": 112, "details": [...] }

GET /api/admin/stats
→ { "scenarios": 20, "lessons": 4, "users": 5, "answers": 150 }
```

---

## 15. Ishga Tushirish Buyruqlari

### Talablar

| Dastur | Versiya | Kerak? |
|--------|---------|--------|
| Node.js | ≥ 20 | ✅ Shart |
| npm | ≥ 9 | ✅ Shart |
| Dart SDK | ≥ 3.5 | ⬜ Faqat engine test uchun |
| Flutter SDK | ≥ 3.0 | ⬜ Faqat frontend/app uchun |

### Qadam-baqadam

```bash
# ──────────────────────────────────────────────
# 1. O'rnatish
# ──────────────────────────────────────────────
npm install

# ──────────────────────────────────────────────
# 2. Kod generatsiya va sinxronizatsiya
# ──────────────────────────────────────────────
node tools/codegen.js           # Schema → Dart + TS tiplar
node tools/validate.js content  # Ssenariylarni tekshirish
node tools/sync_content.js      # Kontentni tarqatish
node tools/sync_engine.js       # Engine-ni tarqatish

# ──────────────────────────────────────────────
# 3. Backend serverni ishga tushirish
# ──────────────────────────────────────────────
cd backend/server
node src/index.mjs
# Server: http://localhost:4000
# Health: http://localhost:4000/api/health

# ──────────────────────────────────────────────
# 4. Web frontendni ishga tushirish (yangi terminal)
# ──────────────────────────────────────────────
cd frontend/web
npx vite --port 3000
# Ilova: http://localhost:3000

# ──────────────────────────────────────────────
# 5. Mobile ilovani ishga tushirish (yangi terminal)
# ──────────────────────────────────────────────
cd frontend/mobile
npx expo start
# Expo Go ilovasi bilan QR skanerlab sinash

# ──────────────────────────────────────────────
# 6. Dart engine testlari (ixtiyoriy — Dart SDK kerak)
# ──────────────────────────────────────────────
cd engine_dart
dart pub get
dart test
```

---

## 16. Test va Tekshirish

### Backend Unit Tests — 4 ta

```bash
npm test --workspace @yhq/server
```

| # | Test | Tekshiradi |
|---|------|------------|
| 1 | Engine sc-0001 classify | o1 = clean, o2 = collision |
| 2 | EngineError on bad option | Noto'g'ri option → EngineError (422) |
| 3 | Frame at t=0 | Display list qaytaradi (ops[] bo'sh emas) |
| 4 | Concurrent saveAnswer | 20 parallel yozish → hammasi saqlanadi |

### Dart Engine Tests — 13 ta

```bash
cd engine_dart && dart pub get && dart test
```

| # | Test | Tekshiradi |
|---|------|------------|
| 1 | geom_test | Vec2 arifmetika, OBB collision |
| 2 | layout_test | Yo'l layout, yo'lak pozitsiyalari |
| 3 | trajectory_test | Bézier traektoriya (9.2 KB) |
| 4 | choreography_test | Actor ketma-ketligi |
| 5 | simulation_test | 60 FPS tik-tik simulyatsiya |
| 6 | motion_profile_test | Tezlik profillari |
| 7 | playback_test | Preview/user/correct rejimlar |
| 8 | outcome_test | 6 ta natija klassifikator |
| 9 | palette_test | Rang to'g'riligi |
| 10 | purity_test | Flutter import YO'QLIGINI tekshirish |
| 11 | roundtrip_test | JSON encode→decode fixpoint |
| 12 | snapshot_test | Golden pixel solishtirish |
| 13 | motion_golden_test | Harakat golden snapshot |

### Content Validation

```bash
node tools/validate.js content
# Natija: 20 file(s), 0 error(s), 112 warning(s)
```

---

## 17. Loyiha Fazalari

| Faza | Holat | Tavsif |
|------|-------|--------|
| **Phase 0** — Asos | ✅ Tugallangan | Schema, codegen, validator, CI |
| **Phase 1** — Statik renderer | ✅ Tugallangan | Layout, yo'l/belgi chizish, t=0 kadr |
| **Phase 2** — Harakat | 🔶 Jarayonda | Trajectory, choreography, playback |
| **Phase 3** — Collision | ⬜ Kutilmoqda | OBB collision, 6 ta natija |
| **Phase 4** — Playback rejimlar | ⬜ | user_answer, correct_answer, compare |
| **Phase 5** — Scene turlari | ⬜ | t_junction, roundabout, va boshqalar |
| **Phase 6** — Content editor | ⬜ | React form-based editor |
| **Phase 7** — App shell | ⬜ | Auth, offline sync, progress |
| **Phase 8** — Learning features | ⬜ | FSRS spaced repetition, exam simulator |
| **Phase 9** — Lokalizatsiya | ⬜ | uz, ru, en, uz-Cyrl |
| **Phase 10** — Monetizatsiya | ⬜ | Payme + Click, paywall |

---

*Ushbu hujjat loyihaning to'liq arxitekturasi, har bir modul va faylning vazifasi,
barcha API endpointlari, ishga tushirish va test qilish qo'llanmasini o'z ichiga oladi.*

*Oxirgi yangilanish: 2026-07-22*

Sen 10 yilik dasturchisan sen shu loyiha qilishda to'liq menga promopt yozib chiroyli shakilda meni qoyil qoldir.
10 yilik dasturchi sifatida shu loyihani to'liq ko'rib, qo'shimcha savol bo'lsa berib to'liq qilish uchun promopt, struktura va optimal dasrturlash tili va bazasini va to'liq savol orqali yoki optimal oladigan qilib ol % da
menda yoliha bor shu bo`yicha qo'shimcha va qanday qilsh bo'yicha to'liq strukutra va qanday qilish optimal qilish shuni yozib promopt qilib berish kerak 
Loyiha : Mashina test qisimi 
Vazifa: ro'yxatdan o'tadigan qilish, test va sh text videosi shu test javob bergandan kein shu text javobiga qarab shu video boshqariladi to'g'ri javob bersa shu natija to'g'ri yurib ✅ bo`ladi , xato bo'lasa ❌yoki urilishi yoki halotkat sahnalari videoda bo'ladi kamida 10sekundlik va shuni to'liq, shuni menga optimla ishlaydigan va strukturasi va ma'lumotlarni qanday saqlanishi va ishlash tezligini oshirish uchun struktura va qasi dasturlash tilidan va bazasidan foydalanga qulayligini va to'liq tuzib yozib ber
# Mashina Test Loyihasi — To'liq Arxitektura va Prompt

10 yillik tajribali dasturchi sifatida loyihangizni tahlil qildim. Sizda Laravel + Tailwind va Next.js/React tajribangiz borligini hisobga olib, eng optimal stackni tanladim.

## 1. Tavsiya etilgan Tech Stack

**Backend: Laravel 11 (PHP)**
- Sizda Sanctum tajribangiz bor — bu loyiha uchun ham xuddi shu auth yondashuvi ishlaydi
- Eloquent ORM orqali test/savol/video munosabatlarini boshqarish oson
- Laravel Queue — video processing/upload uchun juda kerak (fon vazifalari)

**Frontend: Next.js + Tailwind CSS**
- Video player uchun SSR/CSR moslashuvchan
- `<video>` tag + custom controller — javobga qarab video segmentini almashtirish uchun ideal

**Video xotira: Object Storage (S3-compatible)**
- Videolarni serverda emas, **Cloudflare R2** yoki **AWS S3** da saqlash (egress narxi past, CDN bilan integratsiya oson)
- Cloudflare Stream — agar HLS/adaptive streaming kerak bo'lsa (sekin internetli foydalanuvchilar uchun juda muhim)

**Database: PostgreSQL** (MySQL emas)
- Nega: test natijalari, JSON javoblar, va statistikalar uchun PostgreSQL'ning JSONB va indexlash imkoniyatlari kuchliroq
- Agar Laravel bilan ishlashda qulaylik muhim bo'lsa — MySQL 8 ham to'liq yetarli, farqi katta emas

**Cache/Queue: Redis**
- Video URL'larini keshlash, session, va queue driver sifatida

## 2. Ma'lumotlar bazasi strukturasi (asosiy jadvallar)

```
users
├── id, name, email, password, phone, created_at

categories (test bo'limlari, masalan "Yo'l belgilari")
├── id, name, slug

questions
├── id, category_id, text, image_url (ixtiyoriy)

answers
├── id, question_id, text, is_correct (boolean)

videos
├── id, question_id (yoki answer_id), type (correct/wrong), 
├── url, duration (sekund), thumbnail_url

test_sessions
├── id, user_id, category_id, started_at, finished_at, score

test_session_answers
├── id, test_session_id, question_id, answer_id, is_correct,
├── video_id (qaysi video ko'rsatilgani), answered_at
```

**Muhim optimallashtirish:** har bir savolga bitta video emas — har bir **javobga** alohida video bog'lang (`answers` jadvaliga `video_id`). Shunda bir xil "xato javob" videosini bir nechta savolda qayta ishlatish mumkin — bu video omborini 3-4 barobar kamaytiradi.

## 3. Video boshqarish logikasi (eng muhim qism)

Frontendda video "davomiyligi" bilan ishlash uchun eng optimal yondashuv:

1. Har bir video oldindan **sahna segmentlariga** bo'linadi: `driving_loop.mp4` (davomiy aylanuvchi to'g'ri yurish), `crash_scene.mp4` (10 sek halokat)
2. Foydalanuvchi javob bersa → API `is_correct` qaytaradi → frontend mos videoni `<video>` elementga almashtiradi (crossfade bilan)
3. **Muhim:** `driving_loop.mp4` ni `loop` qilib ketma-ket ijro eting (har safar qayta yuklamang) — bu tarmoq trafigini kamaytiradi va tezlikni oshiradi
4. Videolarni oldindan **preload** qiling (`<link rel="preload">` yoki JS orqali keyingi mumkin bo'lgan videoni fon rejimda yuklab qo'yish)

## 4. Tezlikni oshirish uchun texnik tavsiyalar

- Videolarni **H.264 + WebM** formatida ikkalasini ham saqlang (brauzer moslikka qarab tanlaydi)
- Cloudflare CDN orqali video yetkazish — Toshkentdan foydalanuvchilar uchun ham tezkor
- Video hajmini kichraytirish: 720p yetarli, 1080p shart emas (yuklama tezligi muhimroq)
- API javoblarini Redis'da keshlang (savollar ro'yxati kam o'zgaradi)

## 5. To'liq AI-prompt (loyihani yaratish uchun ishlatishingiz mumkin)

Quyidagi promptni Claude Code yoki boshqa AI asistentga to'g'ridan-to'g'ri berishingiz mumkin:

```
Men Laravel 11 (backend, Sanctum auth) va Next.js + Tailwind CSS (frontend) 
yordamida "Haydovchilik test simulyatori" loyihasini qurmoqchiman.

FUNKSIONAL TALABLAR:
1. Foydalanuvchi ro'yxatdan o'tadi va tizimga kiradi (Sanctum token auth)
2. Kategoriyalar bo'yicha testlar mavjud (masalan "Yo'l belgilari", "Yo'l qoidalari")
3. Har bir savolda bir nechta variant javob bor, faqat bittasi to'g'ri
4. Foydalanuvchi javob tanlaganda:
   - Agar to'g'ri bo'lsa: mashina to'g'ri yo'lda yurishda davom etadigan video ko'rsatiladi (✅ belgisi bilan)
   - Agar xato bo'lsa: mashina avariyaga uchraydigan, kamida 10 soniyalik video ko'rsatiladi (❌ belgisi bilan)
5. Test yakunida umumiy natija (score) va statistika ko'rsatiladi

MA'LUMOTLAR BAZASI: PostgreSQL, quyidagi jadvallar bilan:
users, categories, questions, answers (video_id bilan bog'langan), 
videos, test_sessions, test_session_answers

TEXNIK TALABLAR:
- Videolarni Cloudflare R2 yoki S3'da saqlash, CDN orqali yetkazish
- Video almashtirish crossfade animatsiya bilan, sahifa qayta yuklanmasdan
- "To'g'ri yurish" videosi loop rejimida, "avariya" videosi bir marta ijro etilib keyin natija ekraniga o'tadi
- Mobil qurilmalarda ham tez ishlashi uchun video preload va lazy-load
- API: RESTful, /api/tests, /api/questions/{id}/answer kabi endpointlar

Iltimos quyidagilarni yarating:
1. Laravel migration fayllari (yuqoridagi jadvallar uchun)
2. Eloquent modellar va munosabatlar (relationships)
3. TestController — javobni qabul qilib, tegishli video_id qaytaradigan logika
4. Next.js sahifasi — video player componenti, javob tugmalari, natija ekrani
```

## 6. Aniqlashtirish kerak bo'lgan savollar

Loyihani to'liq boshlashdan oldin quyidagilarni hal qilish tezlikni oshiradi:
Bu ma'lumotlarga asoslanib, endi aniq va amaliy tavsiya beraman.

## Yangilangan qaror: Web + Mobil, 50-100 video, noldan boshlash

Bu kombinatsiya arxitekturani biroz o'zgartiradi — chunki ikkita frontend (web + mobil) bitta backend'dan foydalanishi kerak. 50-100 video hajmi esa hali "katta" emas, shuning uchun murakkab infratuzilma shart emas — lekin kelajakka moslashtirib qurish kerak.

### Yakuniy Tech Stack

**Backend: Laravel 11 (API-only rejimda)**
- Sizning Sanctum tajribangiz bilan mos keladi
- Web ham, mobil ham bitta REST API'dan foydalanadi — kod takrorlanmaydi
- `php artisan install:api` orqali sof API loyihasi qilib boshlang (Blade view'siz)

**Web frontend: Next.js + Tailwind**

**Mobil ilova: React Native (Expo)**
- Sababi: siz allaqachon React bilan ishlaysiz — React Native'ga o'tish qiyin bo'lmaydi
- Bitta JS kodlash tajribasi web va mobilda deyarli bir xil komponent mantig'ini takrorlash imkonini beradi (masalan video player logikasi)
- Alternativ: Flutter — agar sof native tezlik va animatsiya sifati muhim bo'lsa, lekin bu holda yangi til (Dart) o'rganish kerak bo'ladi

**Video saqlash: Cloudflare R2 + Cloudflare Stream**
- 50-100 video uchun bu narx jihatidan juda arzon (R2'da egress narxi yo'q)
- Cloudflare Stream avtomatik ravishda videoni turli sifatlarga (adaptive bitrate) o'giradi — mobil internet uchun juda muhim

**Database: MySQL 8** (PostgreSQL o'rniga)
- 50-100 video hajmida farq sezilmaydi, lekin Laravel ekotizimida MySQL bilan ishlash (hosting, tooling) biroz osonroq va arzonroq — bu hajmda murakkab JSONB imkoniyatlari kerak bo'lmaydi

### Amaliy bosqichlar (noldan boshlash uchun tartib)

1. **1-hafta:** Laravel API skeleti — auth (Sanctum), migratsiyalar, modellar
2. **2-hafta:** Admin panel (oddiy, Filament orqali tez quriladi) — savol/javob/video qo'shish uchun, chunki 50-100 ta kontentni qo'lda SQL orqali kiritish vaqt yo'qotadi
3. **3-hafta:** Next.js web frontend — test oqimi, video player
4. **4-hafta:** React Native (Expo) mobil ilova — xuddi shu API'ga ulanadi

### Yangilangan AI-prompt (web + mobil uchun)

```
Men "Haydovchilik test simulyatori" loyihasini noldan qurmoqchiman.
Platformalar: Web (Next.js) va Mobil (React Native / Expo), ikkalasi ham
bitta Laravel 11 API-only backendga ulanadi (Sanctum auth).

Kutilayotgan hajm: ~50-100 ta savol/video juftligi.

BACKEND (Laravel 11, API-only):
- Sanctum orqali autentifikatsiya (register/login/logout)
- Filament admin panel — savol, javob va video kontentini qo'shish uchun
- Migratsiyalar: users, categories, questions, answers (video_id bilan),
  videos, test_sessions, test_session_answers
- Video fayllar Cloudflare R2'da saqlanadi, API faqat video URL qaytaradi
- Endpointlar: /api/categories, /api/tests/start, 
  /api/tests/{session}/answer, /api/tests/{session}/finish

WEB FRONTEND (Next.js + Tailwind):
- Login/register sahifalari
- Kategoriya tanlash, test boshlash
- Video player komponenti: to'g'ri javobda "driving_loop" videosi
  loop rejimida davom etadi, xato javobda "crash" videosi bir marta
  ijro etilib (kamida 10 sek) natija ekraniga o'tadi
- Natija sahifasi: score, statistikalar

MOBIL ILOVA (React Native + Expo):
- Xuddi shu API'ga ulanadi, xuddi shu oqim
- expo-av yoki react-native-video kutubxonasi orqali video ijro etish
- Offline holatda oxirgi yuklangan videolarni keshlash (ixtiyoriy)

Iltimos quyidagilarni birma-bir yarating:
1. Laravel migratsiya va model fayllari
2. Filament admin resurslari (Question, Answer, Video uchun)
3. TestController — to'liq logika bilan
4. Next.js video player componenti
5. React Native ekvivalent komponent
```

Shu bosqichlardan qay biridan boshlashni xohlaysiz — masalan, Laravel migratsiya fayllarini hoziroq yozib beraymi?


Laravelda qilinmasin
shuloyihihani menga 
Backendni Node.js  da
Frontend: Next.js + Tailwind
Mobil ilova: React Native (Expo)
shuni to'liq strukturasini shu boyicha to'liq tuzib ber
# Mashina Test Loyihasi — To'liq Struktura (Node.js + Next.js + React Native)

Yagona JavaScript/TypeScript ekotizimida qurilgan loyiha — bu bir xil tildan foydalanish orqali kod ulashish (shared types, validation logikasi) imkonini beradi.

## 1. Umumiy arxitektura

```
mashina-test/
├── backend/          → Node.js API (Express + TypeScript)
├── web/               → Next.js (Tailwind CSS)
├── mobile/            → React Native (Expo)
└── shared/            → Umumiy TypeScript tiplar (ixtiyoriy, monorepo bo'lsa)
```

**Monorepo tavsiyasi:** Turborepo yoki Nx yordamida barcha 3 qismni bitta repo ichida boshqarish — `shared/types.ts` orqali backend va frontend bir xil interfeyslardan foydalanadi (masalan `Question`, `Answer` tiplari qayta yozilmaydi).

## 2. Backend struktura (Node.js)

**Asosiy stack tanlovi:**
- **Framework:** Express.js (yengil, moslashuvchan) yoki **NestJS** (agar Laravel'dagi kabi strukturaviy, "controller-service-module" arxitekturasini xohlasangiz — NestJS tavsiya etiladi, chunki u Laravel'ga eng yaqin fikrlash uslubini beradi)
- **ORM:** Prisma (TypeScript bilan eng yaxshi integratsiya, migratsiyalarni avtomatik boshqaradi)
- **Auth:** JWT (access + refresh token) yoki Passport.js
- **Validatsiya:** Zod yoki class-validator (NestJS bilan)
- **Video saqlash:** Cloudflare R2 (`@aws-sdk/client-s3` orqali, R2 S3-compatible)
- **Queue (fon vazifalari uchun):** BullMQ + Redis

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── dto/ (register.dto.ts, login.dto.ts)
│   │   ├── categories/
│   │   │   ├── categories.controller.ts
│   │   │   └── categories.service.ts
│   │   ├── questions/
│   │   │   ├── questions.controller.ts
│   │   │   └── questions.service.ts
│   │   ├── tests/
│   │   │   ├── tests.controller.ts       ← test boshlash/javob logikasi
│   │   │   └── tests.service.ts
│   │   ├── videos/
│   │   │   ├── videos.controller.ts
│   │   │   └── videos.service.ts          ← R2 upload/URL generatsiya
│   │   └── admin/                         ← kontent boshqaruv endpointlari
│   ├── prisma/
│   │   └── schema.prisma
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── config/
│   │   └── env.ts
│   └── main.ts (yoki app.ts)
├── .env
├── package.json
└── tsconfig.json
```

## 3. Prisma schema (ma'lumotlar bazasi)

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  password     String
  createdAt    DateTime @default(now())
  testSessions TestSession[]
}

model Category {
  id        String     @id @default(uuid())
  name      String
  slug      String     @unique
  questions Question[]
}

model Question {
  id         String   @id @default(uuid())
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])
  text       String
  imageUrl   String?
  answers    Answer[]
}

model Answer {
  id         String   @id @default(uuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  text       String
  isCorrect  Boolean
  videoId    String?
  video      Video?   @relation(fields: [videoId], references: [id])
}

model Video {
  id       String   @id @default(uuid())
  type     String   // "correct" | "wrong"
  url      String
  duration Int      // sekundlarda
  answers  Answer[]
}

model TestSession {
  id         String    @id @default(uuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  categoryId String
  startedAt  DateTime  @default(now())
  finishedAt DateTime?
  score      Int?
  answers    TestSessionAnswer[]
}

model TestSessionAnswer {
  id            String      @id @default(uuid())
  sessionId     String
  session       TestSession @relation(fields: [sessionId], references: [id])
  questionId    String
  answerId      String
  isCorrect     Boolean
  answeredAt    DateTime    @default(now())
}
```

## 4. API endpointlar

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/categories
GET    /api/categories/:id/questions

POST   /api/tests/start          → { categoryId } → yangi TestSession yaratadi
POST   /api/tests/:sessionId/answer   → { questionId, answerId } → { isCorrect, videoUrl, duration }
POST   /api/tests/:sessionId/finish   → { score, statistika }

GET    /api/tests/history        → foydalanuvchi test tarixi

# Admin (kontent boshqaruvi uchun)
POST   /api/admin/questions
POST   /api/admin/answers
POST   /api/admin/videos/upload
```

## 5. Frontend struktura (Next.js + Tailwind)

```
web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── categories/page.tsx
│   ├── test/
│   │   └── [sessionId]/page.tsx     ← asosiy test/video sahifasi
│   ├── result/[sessionId]/page.tsx
│   └── layout.tsx
├── components/
│   ├── VideoPlayer.tsx               ← loop/crash video mantig'i
│   ├── AnswerButton.tsx
│   ├── ProgressBar.tsx
│   └── ResultCard.tsx
├── lib/
│   ├── api.ts                        ← fetch wrapper (Bearer token)
│   └── types.ts                      ← shared/ dan import qilinadi
└── tailwind.config.ts
```

**VideoPlayer.tsx mantig'i:**
```tsx
// javob to'g'ri → correctVideoUrl'ni loop rejimida ijro etish
// javob xato → wrongVideoUrl'ni bir marta ijro etish (min 10s) → onEnded → natija sahifasiga o'tish
```

## 6. Mobil ilova struktura (React Native + Expo)

```
mobile/
├── app/                          ← Expo Router
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── categories.tsx
│   ├── test/[sessionId].tsx
│   └── result/[sessionId].tsx
├── components/
│   ├── VideoPlayer.tsx           ← expo-av yordamida
│   ├── AnswerButton.tsx
│   └── ResultCard.tsx
├── lib/
│   ├── api.ts                    ← web bilan bir xil mantiq
│   └── types.ts
└── app.json
```

**Kutubxona:** `expo-av` (yoki yangi `expo-video`) — video loop va onPlaybackStatusUpdate orqali "video tugadi" holatini aniqlash uchun.

## 7. Backend ishlab chiqish % taqsimoti (Node.js uchun yangilangan)

| # | Qism | % | Texnologiya |
|---|------|---|---|
| 1 | Auth (JWT) | 10% | Node.js + Passport/JWT |
| 2 | Prisma schema + migratsiyalar | 15% | Prisma + PostgreSQL/MySQL |
| 3 | Admin endpointlar (kontent CRUD) | 20% | Express/NestJS controllerlari |
| 4 | Test logikasi | 20% | Service qatlami |
| 5 | Video/R2 integratsiyasi | 15% | AWS SDK (S3-compatible) |
| 6 | Statistika endpointlari | 10% | Prisma agregatsiya so'rovlari |
| 7 | Testlash | 10% | Jest / Vitest |

Qaysi qismdan boshlaymiz — **Prisma schema va migratsiyalarni** hoziroq to'liq kod bilan yozib beraymi, yoki avval **NestJS vs Express** orasida qaysi birini tanlashni hal qilaylikmi?
# AVTO (YHQ) — Tahlil, Tuzatishlar va To'liq Prompt

Avval aytishim kerak: bu — biz oldin muhokama qilgan "video yozib qo'yish" yondashuvidan **ancha ustun** arxitektura. Siz 50-100 ta video yozish o'rniga **deterministik 2D simulyatsiya dvigateli** qurgansiz — bu professional yondashuv, chunki:
- Video assetlar shart emas (storage, CDN xarajati yo'q)
- Cheksiz ssenariy qo'shish mumkin (faqat JSON yozish kifoya)
- Har bir tilda (uz/ru/en) qayta render qilish kerak emas

Endi 10 yillik dasturchi nazari bilan **muammoli joylarni** ko'rsataman va tuzataman.

## 1. Aniqlangan muammolar va tuzatishlar

| # | Muammo | Xavf darajasi | Tuzatish |
|---|--------|---|----------|
| 1 | **DB — JSON fayl** (`data/progress.json`), Mongo/Postgres CRUD yozilmagan | 🔴 Yuqori | Productionga chiqishdan oldin **SQLite → PostgreSQL** ga o'tish shart. JSON fayl bilan concurrent yozishda (`writeChain` bo'lsa ham) 100+ foydalanuvchida barbod bo'ladi |
| 2 | **Auth yo'q** — `progress/:userId` orqali oddiy string ID bilan ishlaydi, parol/token tekshiruvi ko'rinmaydi | 🔴 Yuqori | Har qanday kishi boshqa userId bilan boshqa odamning progressini o'qishi/o'zgartirishi mumkin. **JWT auth shart** |
| 3 | **Kontent 5 joyga nusxalanadi** (`sync_content.js`) — har birida alohida fayl | 🟡 O'rta | Keraksiz murakkablik va sinxronizatsiya xatosi xavfi. Barcha frontendlar **to'g'ridan-to'g'ri API'dan** (`GET /api/scenarios/:id`) o'qisin, static nusxalash shart emas |
| 4 | **Engine.js 4 joyga nusxalanadi** (`sync_engine.js`) | 🟡 O'rta | Xuddi shu sabab — backend'dan **bitta static URL** orqali serve qilish yetarli (`/engine.js`), CDN keshlash bilan |
| 5 | **Flutter app — skeleton, SDK o'rnatilmagan** | 🟢 Past | Hozircha e'tiborsiz qoldirish mumkin, resurslarni Web+Mobile'ga yo'naltirish tavsiya etiladi (2 platforma allaqachon yetarli ish) |
| 6 | **112 ta ogohlantirish** (`verified: false` belgilar, tarjima yo'qligi) | 🟡 O'rta | Productionga chiqishdan oldin YHQ rasmiy matni bilan **tasdiqlash** kerak — noto'g'ri huquqiy ma'lumot bo'lsa, foydalanuvchi noto'g'ri o'rganadi |
| 7 | **MAX_ANSWERS = 500** cheklovi | 🟢 Past | Faol foydalanuvchi uchun kam bo'lishi mumkin — DB'ga o'tgach bu muammo o'z-o'zidan hal bo'ladi |

## 2. Tuzatilgan struktura (asosiy o'zgarishlar)

```diff
backend/server/
├── src/
│   ├── db.mjs                    ← JSON/Mongo/Postgres abstraktsiya
+ │   ├── db/
+ │   │   ├── prisma/schema.prisma  ← ✅ YANGI: Postgres orqali
+ │   │   │   (User, Scenario, Lesson, ExamAttempt, Answer)
+ │   ├── auth/
+ │   │   ├── auth.middleware.mjs   ← ✅ YANGI: JWT tekshiruv
+ │   │   └── auth.routes.mjs       ← ✅ YANGI: /register, /login

frontend/web/public/
- │   ├── content/                 ← ❌ OLIB TASHLASH: API'dan to'g'ridan o'qiladi
- │   ├── engine.js                ← ❌ OLIB TASHLASH: backend static URL'dan

frontend/mobile/assets/
- │   ├── content/                 ← ❌ OLIB TASHLASH
- │   ├── engine.js                ← ❌ OLIB TASHLASH (yoki bundle vaqtida bir marta yuklab olinadi)

tools/
- ├── sync_content.js              ← ❌ ENDI KERAK EMAS
- ├── sync_engine.js                ← ❌ ENDI KERAK EMAS
```

**Natija:** `sync_content.js` va `sync_engine.js` skriptlari butunlay olib tashlanadi, chunki barcha platformalar bitta manbadan (`GET /api/scenarios`, `GET /engine.js`) foydalanadi. Bu **kod dublikatsiyasini yo'qotadi** va yangi ssenariy qo'shilganda faqat bitta joyni yangilash kifoya qiladi.

## 3. Prisma schema (JSON fayl o'rniga)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  answers   Answer[]
  exams     ExamAttempt[]
}

model Answer {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  scenarioId String   // sc-0001 kabi
  optionId   String
  isCorrect  Boolean
  answeredAt DateTime @default(now())
}

model ExamAttempt {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  score     Int
  total     Int
  passed    Boolean
  createdAt DateTime @default(now())
}
```

Ssenariy va darsliklar JSON fayl sifatida qolishi mumkin (`content/sc-XXXX.json`) — ular statik kontent, foydalanuvchi ma'lumoti emas. Faqat **foydalanuvchiga tegishli dinamik ma'lumotlar** (progress, exam natijalari) DB'ga ko'chadi.

## 4. Yangilangan API endpointlar (auth qo'shilgan holda)

```http
POST   /api/auth/register        { email, password }
POST   /api/auth/login           { email, password } → { token }
GET    /api/auth/me              (Bearer token) → user ma'lumoti

GET    /api/scenarios             (o'zgarishsiz)
GET    /api/scenarios/:id/info
GET    /api/scenarios/:id/frame

GET    /api/progress              (Bearer token — endi :userId shart emas, token'dan olinadi)
POST   /api/progress/answer       (Bearer token) { scenarioId, optionId }

GET    /api/exams/generate
POST   /api/exams/submit          (Bearer token) { answers[] }
```

## 5. To'liq Prompt (AI-agent yoki jamoaga berish uchun)

```
LOYIHA: AVTO (YHQ) — O'zbekiston YHQ interaktiv ta'lim platformasi

ARXITEKTURA (mavjud, saqlanadi):
- Monorepo (npm workspaces): schema/, engine_dart/, shared/engine-js/,
  backend/server/, frontend/web/, frontend/mobile/, content/, tools/
- Pure Dart engine (Flutter'siz) → dart2js orqali JS'ga kompilyatsiya qilinadi
- Ssenariy JSON schema orqali tasvirlanadi (scene, actors, question, resolution)
- Engine deterministik 2D simulyatsiya hisoblaydi: Bézier traektoriya,
  60 FPS tick, OBB collision, 6 turdagi natija (collision, priority_violation, va h.k.)
- Renderer faqat 3 primitiv orqali chizadi: fillPolygon, strokePath, fillCircle
- Backend: Express.js, portu 4000
- Web: React + Vite, dark mode dizayn
- Mobil: Expo + React Native, WebView orqali engine ishlaydi

QILINISHI KERAK BO'LGAN O'ZGARISHLAR (ustuvorlik tartibida):

1. AUTH TIZIMI QO'SHISH (eng muhim, hozir yo'q):
   - backend/server/src/auth/ papkasi yaratish
   - JWT asosida register/login/middleware
   - Barcha /api/progress va /api/exams endpointlarini 
     Bearer token bilan himoyalash

2. DB NI JSON FAYLDAN POSTGRESQL GA KO'CHIRISH:
   - Prisma o'rnatish, yuqoridagi schema (User, Answer, ExamAttempt) qo'shish
   - db.mjs dagi JSON fayl logikasini Prisma client bilan almashtirish
   - Mavjud data/progress.json dan migratsiya skripti yozish

3. KONTENT DUBLIKATSIYASINI OLIB TASHLASH:
   - sync_content.js va sync_engine.js skriptlarini o'chirish
   - Barcha frontendlar (web, mobile) content va engine.js ni
     to'g'ridan-to'g'ri backend API/static URL orqali oladi
   - CORS va keshlash sarlavhalarini (Cache-Control) backend'da sozlash

4. YHQ KONTENTINI TASDIQLASH:
   - schema/yhq_registry.json dagi verified: false belgilarni
     rasmiy YHQ hujjati bilan solishtirib tasdiqlash
   - Tarjima yo'q bo'lgan option'lar uchun ru/en matnlarini to'ldirish

5. QOLGAN FAZALARNI DAVOM ETTIRISH:
   - Phase 2 (harakat) ni yakunlash
   - Phase 3 (collision) — 6 ta natija turini to'liq testlash
   - Phase 7 (auth, offline sync) — yuqoridagi auth bilan mos ravishda

TEXNIK CHEKLOVLAR (o'zgarishsiz saqlanishi kerak):
- Engine pure Dart bo'lib qolishi kerak (Flutter importi YO'Q)
- Renderer faqat 3 primitivdan foydalanadi
- Barcha ssenariylar deterministik bo'lishi kerak (randomness yo'q)
- Schema o'zgarsa — codegen.js orqali Dart+TS tiplarni qayta generatsiya qilish shart

Iltimos, 1-bosqichdan (Auth tizimi) boshlab, backend/server/src/auth/ 
papkasini to'liq kod bilan yarating: auth.routes.mjs, auth.middleware.mjs,
va Prisma User modelini bog'lovchi auth.service.mjs.
```

Qaysi bosqichdan (Auth, DB migratsiyasi, yoki kontent dublikatsiyasini olib tashlash) boshlashni xohlaysiz — to'liq kod bilan yozib beraymi?
