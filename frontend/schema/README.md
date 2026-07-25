# Schema

The single source of truth for content. Types in `engine_dart` and `editor` are
**generated** from these files — never hand-edit `*.g.dart` or `*.g.ts`.

```sh
node tools/codegen.js         # regenerate types
node tools/validate.js content  # schema + semantic validation
```

CI fails if the generated files differ from what the schema produces.

## Files

| File | What |
|---|---|
| `scenario.schema.json` | A spatial question: scene, actors, question, resolution. Owns the shared `$defs`. |
| `question.schema.json` | A question-bank entry. Covers the ~60% of the bank that has no scene; spatial ones link back via `scenario_id`. |
| `yhq_registry.json` | Sign and rule codes with a `verified` flag. Not a schema — the validator reads it. |

## Conventions

**No prose in `scene` or `actors`.** Those blocks are language-independent so a
new locale costs zero rendering changes. The validator scans for keys named
`text`, `label`, `title` and friends inside them and rejects the file. Sign and
rule codes (`"2.4"`, `"13.9"`) are identifiers, not prose, so they are fine.

**No privileged locale.** `LocalizedText` accepts any locale code matching
`^[a-z]{2}(-[A-Z][a-z]{3})?$` and requires none of them. Missing locales are a
*warning* from tooling, never a schema error, and rendering code must never
fall back to a hardcoded language.

**Defaults are explicit after a round-trip.** `Scenario.toJson()` writes every
defaulted field, so decode→encode normalises rather than preserving byte
layout. The round-trip test asserts the stronger property that matters: the
result is a fixpoint, and no authored value is ever dropped.

## Cross-file `$ref`

`question.schema.json` refers into `scenario.schema.json` for shared
definitions (`Topic`, `LocalizedText`, `Rule`):

```json
{ "$ref": "scenario.schema.json#/$defs/Topic" }
```

Both the validator and the codegen resolve these. Codegen merges every file's
`$defs` into one namespace and **fails loudly on a name collision**, so type
names must be unique across all schema files — that is why the bank entry is
`QuestionBankEntry` rather than `Question`.

> Known wart: the shared definitions live in `scenario.schema.json` rather than
> a neutral `common.schema.json`. That is fine for two files. If a third schema
> appears, extract them.

## Adding a scene type

1. Add the value to the `SceneType` enum here.
2. Add its road-shape rule to `SCENE_ROADS` in `tools/lib/semantic.js`.
3. Add it to `kSupportedSceneTypes` in `engine_dart/.../scene_builder.dart` once
   the layout actually derives correctly.

Until step 3, the engine emits a `sceneTypeUnsupported` content warning instead
of drawing something plausible but wrong.

## Changing the schema

`schema_version` is `const: 1`. When a change cannot be made additively:

1. Bump the const and add the new shape.
2. Write a migration in `tools/` that rewrites `/content` in place.
3. Run it, re-validate, and commit content and schema together.

Do not special-case an unrepresentable scenario in engine code — propose a
schema change instead. That rule is what keeps ~480 animated scenarios from
turning into ~480 bespoke code paths.
