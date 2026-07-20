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
/app              Flutter app (depends on engine_dart)
/editor           React content editor
/content          Scenario JSON files, one per question
/tools            Validators, bulk importers, snapshot test runner
```

`engine_dart` must be pure Dart with no Flutter dependency, so it can run in CI and be unit-tested headlessly. The Flutter layer only paints what the engine outputs.

---

## 4. Scenario schema

See `schema/scenario.schema.json` — the source of truth. Generated types:
`engine_dart/lib/src/generated/scenario.g.dart` and `editor/src/generated/scenario.g.ts`
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
