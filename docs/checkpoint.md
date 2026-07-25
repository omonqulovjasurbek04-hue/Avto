# Phase 2 checkpoint — does the animation beat a diagram?

> ⛔ CLAUDE.md and the build prompt both stop here. Do **not** start Phase 3
> (collision visuals at scale, more scene types, content) until this checkpoint
> is run and its verdict written down. The whole product thesis is on trial: if
> playing the answer back is not clearly better than a static diagram with text,
> the differentiator is wrong and the plan changes.

## What is ready to show

- The browser viewer (`editor/public/viewer.html`, served over any static
  server after `node tools/build_viewer.js`). Pick a scenario, watch the correct
  answer play, tap an option to watch that answer unfold — a wrong one freezes at
  the collision or shows the give-way violation.
- The Flutter app (`app/`, needs a Flutter SDK to build) shows the same thing on
  a phone: `ScenarioPlayer` drives the identical engine.

Five scenarios exist today (4 four-way, 1 T-junction). That is enough for the
checkpoint — the point is the *format*, not coverage.

## The test

5–8 learners currently studying for the YHQ exam. Each sees **4 questions**:
2 explained with text (the way every existing app does it), 2 explained by
animation — **interleaved**, not grouped, so order does not bias the result.

Test on the **weakest** case: a plain four-way, equal-priority or main-road
give-way (sc-0001 / sc-0003). If the "aha" only lands on a complicated
T-junction, the animation's reachable value is a small slice of the ~480 spatial
questions, and that must be known **before** investing Phase 2 content and the
editor in it.

A week later, re-test the same learners on the same questions.

## The falsifiable criterion — decide these before running

Write the verdict against each. No hedging.

1. **Recall.** On the one-week re-test, are the animated questions answered
   correctly *noticeably* more often than the text ones? (Not 1–2 points — a gap
   you would stake the roadmap on.)
2. **Self-explanation.** With no text shown, watching only the animation, can the
   learner say *why* the wrong answer is wrong — in their own words?

If both hold on the weakest case → thesis confirmed, proceed to Phase 3.

If they hold only on complex junctions → the format works but its scope is
narrow. Re-scope before spending on content.

If neither holds → the differentiator does not differentiate. Stop and rethink
before building further.

## Result

_Run date:_ …
_Participants:_ …

_Recall (animated vs text, one week later):_ …
_Self-explanation (unaided):_ …

**Verdict:** …

## Known limits at this checkpoint (so feedback is not wasted on them)

- No violation styling yet beyond the freeze — no red flash, no priority arrows,
  no conflict-zone shading. That is Phase 3/4; do not judge polish, judge whether
  the *motion itself* teaches.
- Curve-shape constants (`kLeftTurnSlack`, `kUTurnReach`, `kCruiseSpeed`) are set
  by eye, not tuned on real learners. If pacing feels off, that is a knob, not a
  flaw in the thesis.
- Explanations are not generated yet (Phase 2, §3.2). The animation stands alone
  here, which is exactly what the self-explanation criterion tests.
