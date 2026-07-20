'use strict';
/**
 * Cross-reference and scene-shape checks that JSON Schema cannot express.
 *
 * Returns { errors, warnings }. Warnings are content-review data, never silent
 * failures - the editor surfaces them verbatim.
 */

const fs = require('fs');
const path = require('path');

const CARDINAL = ['N', 'S', 'E', 'W'];

const REGISTRY = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'schema', 'yhq_registry.json'), 'utf8')
);

/**
 * Marking types the Dart renderer has artwork for.
 * Mirrors `kRenderedMarkings` in engine_dart/lib/src/render/scene_builder.dart.
 * Kept here as well so an author is told before a render is ever attempted.
 */
const RENDERED_MARKINGS = new Set([
  'stop_line',
  'give_way_line',
  'crosswalk',
  'solid_line',
  'dashed_line',
  'double_solid',
]);

/** Markings that describe a road's centreline rather than a point on it. */
const CENTRELINE_MARKINGS = new Set(['solid_line', 'dashed_line', 'double_solid']);

/** Required road directions per scene type. `null` = engine has no layout rule yet. */
const SCENE_ROADS = {
  crossroads_4way: { exact: ['N', 'S', 'E', 'W'] },
  t_junction: { count: 3, allowed: CARDINAL },
  y_junction: { count: 3, allowed: ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'] },
  straight_road: { count: 2, allowed: CARDINAL },
};

/** Locales a scenario is expected to carry. Reported, never enforced. */
const EXPECTED_LOCALES = ['uz', 'ru', 'en'];

/** Keys that would smuggle prose into language-independent blocks. */
const PROSE_KEYS = /^(text|label|title|name|description|desc|caption|hint|note)$/i;

function scanForProse(node, path, errors) {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => scanForProse(v, `${path}[${i}]`, errors));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (PROSE_KEYS.test(k)) {
      errors.push(`${path}.${k}: human-readable text is not allowed in scene/actors data`);
    }
    scanForProse(v, `${path}.${k}`, errors);
  }
}

function checkLocales(errors, warnings, label, localized) {
  if (!localized) return;
  for (const loc of EXPECTED_LOCALES) {
    if (!localized[loc] || !localized[loc].trim()) {
      warnings.push(`${label}: missing locale "${loc}"`);
    }
  }
}

function check(sc, { fileBase } = {}) {
  const errors = [];
  const warnings = [];

  // --- filename / id agreement -------------------------------------------
  if (fileBase && fileBase !== sc.id) {
    warnings.push(`file name "${fileBase}.json" does not match id "${sc.id}"`);
  }

  // --- language independence ---------------------------------------------
  scanForProse(sc.scene, 'scene', errors);
  scanForProse(sc.actors, 'actors', errors);

  // --- scene shape --------------------------------------------------------
  const dirs = sc.scene.roads.map((r) => r.dir);
  const dirSet = new Set(dirs);
  if (dirSet.size !== dirs.length) {
    errors.push(`scene.roads: duplicate direction(s) ${dirs.filter((d, i) => dirs.indexOf(d) !== i).join(', ')}`);
  }
  const shape = SCENE_ROADS[sc.scene.type];
  if (shape) {
    if (shape.exact) {
      const missing = shape.exact.filter((d) => !dirSet.has(d));
      const extra = dirs.filter((d) => !shape.exact.includes(d));
      if (missing.length) errors.push(`scene.roads: ${sc.scene.type} requires roads ${missing.join(', ')}`);
      if (extra.length) errors.push(`scene.roads: ${sc.scene.type} does not allow road(s) ${extra.join(', ')}`);
    } else {
      if (dirs.length !== shape.count) {
        errors.push(`scene.roads: ${sc.scene.type} requires exactly ${shape.count} roads, found ${dirs.length}`);
      }
      const bad = dirs.filter((d) => !shape.allowed.includes(d));
      if (bad.length) errors.push(`scene.roads: ${sc.scene.type} does not allow direction(s) ${bad.join(', ')}`);
    }
  } else {
    warnings.push(`scene.type "${sc.scene.type}": no layout rule implemented yet; scenario cannot be rendered`);
  }

  const roadBy = new Map(sc.scene.roads.map((r) => [r.dir, r]));
  for (const r of sc.scene.roads) {
    if (r.lanes_in + r.lanes_out === 0) {
      errors.push(`scene.roads[${r.dir}]: must have at least one lane`);
    }
  }

  const attached = (list, label, key = 'at') => {
    (list || []).forEach((item, i) => {
      const at = item[key];
      if (at === undefined || at === 'all') return;
      if (!roadBy.has(at)) errors.push(`${label}[${i}]: attached to "${at}" but no road faces that direction`);
    });
  };
  attached(sc.scene.signs, 'scene.signs');
  attached(sc.scene.markings, 'scene.markings');
  attached(sc.scene.lights, 'scene.lights');

  // --- renderability: declared but undrawable content ---------------------
  (sc.scene.markings || []).forEach((m, i) => {
    if (!RENDERED_MARKINGS.has(m.type)) {
      warnings.push(
        `scene.markings[${i}]: "${m.type}" has no renderer artwork yet and will not appear`
      );
    } else if (m.at === undefined && !CENTRELINE_MARKINGS.has(m.type)) {
      warnings.push(`scene.markings[${i}]: "${m.type}" needs an "at" road to be placed against`);
    }
  });

  // --- YHQ code provenance -------------------------------------------------
  (sc.scene.signs || []).forEach((s, i) => {
    const entry = REGISTRY.signs[s.code];
    if (!entry) {
      warnings.push(`scene.signs[${i}]: sign code "${s.code}" is not in schema/yhq_registry.json`);
    } else if (!entry.verified) {
      warnings.push(
        `scene.signs[${i}]: sign code "${s.code}" is unverified against the official YHQ text`
      );
    }
  });

  const ruleCode = sc.resolution?.rule?.code;
  if (ruleCode) {
    const entry = REGISTRY.rules[ruleCode];
    if (!entry) {
      warnings.push(`resolution.rule.code: "${ruleCode}" is not in schema/yhq_registry.json`);
    } else if (!entry.verified) {
      warnings.push(
        `resolution.rule.code: "${ruleCode}" is unverified against the official YHQ text`
      );
    }
  }

  if (sc.scene.tram_track) {
    for (const d of sc.scene.tram_track.along.split('')) {
      if (!roadBy.has(d)) errors.push(`scene.tram_track: runs along ${d} but no road faces that direction`);
    }
  }

  // --- actors -------------------------------------------------------------
  const actorIds = sc.actors.map((a) => a.id);
  const dupActors = actorIds.filter((id, i) => actorIds.indexOf(id) !== i);
  if (dupActors.length) errors.push(`actors: duplicate id(s) ${[...new Set(dupActors)].join(', ')}`);
  const actorSet = new Set(actorIds);

  const players = sc.actors.filter((a) => a.role === 'player');
  if (players.length === 0) warnings.push(`actors: no actor has role "player"`);
  if (players.length > 1) errors.push(`actors: ${players.length} actors have role "player", expected at most 1`);

  sc.actors.forEach((a, i) => {
    const label = `actors[${i}] "${a.id}"`;
    const fromRoad = roadBy.get(a.from);
    const toRoad = roadBy.get(a.to);
    if (!fromRoad) errors.push(`${label}: enters from "${a.from}" but no road faces that direction`);
    if (!toRoad) errors.push(`${label}: exits to "${a.to}" but no road faces that direction`);
    if (fromRoad) {
      if (fromRoad.lanes_in === 0) errors.push(`${label}: road ${a.from} has no incoming lanes`);
      const li = a.lane_in ?? 0;
      if (li >= fromRoad.lanes_in) errors.push(`${label}: lane_in ${li} exceeds road ${a.from} lanes_in (${fromRoad.lanes_in})`);
    }
    if (toRoad) {
      if (toRoad.lanes_out === 0) errors.push(`${label}: road ${a.to} has no outgoing lanes`);
      const lo = a.lane_out ?? 0;
      if (lo >= toRoad.lanes_out) errors.push(`${label}: lane_out ${lo} exceeds road ${a.to} lanes_out (${toRoad.lanes_out})`);
    }
    if (a.kind === 'tram') {
      const axis = sc.scene.tram_track?.along;
      if (!axis) errors.push(`${label}: is a tram but the scene has no tram_track`);
      else if (!axis.includes(a.from) || !axis.includes(a.to)) {
        errors.push(`${label}: tram travels ${a.from}->${a.to} but the track runs ${axis}`);
      }
    }
  });

  // --- question -----------------------------------------------------------
  const optionIds = sc.question.options.map((o) => o.id);
  const dupOpts = optionIds.filter((id, i) => optionIds.indexOf(id) !== i);
  if (dupOpts.length) errors.push(`question.options: duplicate id(s) ${[...new Set(dupOpts)].join(', ')}`);
  if (!optionIds.includes(sc.question.correct)) {
    errors.push(`question.correct: "${sc.question.correct}" is not one of ${optionIds.join(', ')}`);
  }
  checkLocales(errors, warnings, 'question.text', sc.question.text);
  sc.question.options.forEach((o, i) => {
    checkLocales(errors, warnings, `question.options[${i}] "${o.id}".label`, o.label);
    if (o.refers_to !== undefined && !actorSet.has(o.refers_to)) {
      errors.push(`question.options[${i}] "${o.id}": refers_to unknown actor "${o.refers_to}"`);
    }
  });

  // --- resolution ---------------------------------------------------------
  const order = sc.resolution.order;
  const orderSet = new Set(order);
  if (orderSet.size !== order.length) errors.push(`resolution.order: contains duplicates`);
  for (const id of order) {
    if (!actorSet.has(id)) errors.push(`resolution.order: unknown actor "${id}"`);
  }
  for (const id of actorIds) {
    if (!orderSet.has(id)) errors.push(`resolution.order: actor "${id}" is missing`);
  }
  checkLocales(errors, warnings, 'resolution.rule.text', sc.resolution.rule.text);

  const wrong = sc.resolution.wrong_outcomes || {};
  for (const [optId, outcome] of Object.entries(wrong)) {
    if (!optionIds.includes(optId)) {
      errors.push(`resolution.wrong_outcomes: "${optId}" is not an option id`);
    }
    if (optId === sc.question.correct) {
      errors.push(`resolution.wrong_outcomes: "${optId}" is the correct answer and cannot have a wrong outcome`);
    }
    if (outcome.with !== undefined && !actorSet.has(outcome.with)) {
      errors.push(`resolution.wrong_outcomes["${optId}"].with: unknown actor "${outcome.with}"`);
    }
  }
  for (const id of optionIds) {
    if (id !== sc.question.correct && wrong[id] === undefined) {
      warnings.push(`resolution.wrong_outcomes: no hint for option "${id}" (simulation remains authoritative)`);
    }
  }

  // The correct option should name the actor that goes first.
  const correctOpt = sc.question.options.find((o) => o.id === sc.question.correct);
  if (correctOpt?.refers_to && order.length && correctOpt.refers_to !== order[0]) {
    warnings.push(
      `question.correct "${sc.question.correct}" refers to "${correctOpt.refers_to}" but resolution.order starts with "${order[0]}"`
    );
  }

  return { errors, warnings };
}

module.exports = { check, EXPECTED_LOCALES };
