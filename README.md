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
| `editor/` | React content editor (Phase 6). |
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

# copy validated content into the Flutter app's assets
node tools/sync_content.js
```

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
