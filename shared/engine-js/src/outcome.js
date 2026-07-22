// ============================================================
// outcome.js — 6 outcome classifiers
// ============================================================

import { buildPlayback, buildCorrectPlayback } from './simulation.js';
import { deriveLayout } from './layout.js';

export function classifyOption(scenario, optionId) {
  const option = scenario.question.options.find((o) => o.id === optionId);
  if (!option) return { optionId, clean: false, type: 'unknown', playback: null };

  const correct = scenario.question.correct;
  if (optionId === correct) {
    const playback = buildCorrectPlayback(scenario);
    return { optionId, clean: true, type: 'correct', playback };
  }

  const refersTo = option.refers_to;
  const playback = buildPlayback(scenario, refersTo);
  const outcome = classifyOutcome(scenario, playback, refersTo);

  return { optionId, ...outcome, playback };
}

function classifyOutcome(scenario, playback, playerId) {
  const { collision, frames } = playback;

  if (collision) {
    return {
      clean: false,
      type: 'collision',
      detail: `To'qnashuv: ${collision.actorA} va ${collision.actorB}`,
      tick: collision.tick,
    };
  }

  const resolution = scenario.resolution;
  const correctOrder = resolution.order;
  const playerIdx = correctOrder.indexOf(playerId);
  const correctPlayerIdx = correctOrder.indexOf(scenario.question.options.find(
    (o) => o.id === scenario.question.correct
  )?.refers_to);

  const signViolation = detectSignViolation(scenario, playback, playerId);
  if (signViolation) return signViolation;

  const markingViolation = detectMarkingViolation(scenario, playback, playerId);
  if (markingViolation) return markingViolation;

  const priorityViolation = detectPriorityViolation(scenario, playback, playerId);
  if (priorityViolation) return priorityViolation;

  if (playerIdx > correctPlayerIdx) {
    return {
      clean: false,
      type: 'unnecessary_wait',
      detail: 'Imtiyozga ega bo\'lsangiz ham bekorga kutdingiz',
    };
  }

  return {
    clean: false,
    type: 'unsafe_but_legal',
    detail: 'Xavfsizlik chegarasi past, ammo qoida buzilmadi',
  };
}

function detectSignViolation(scenario, playback, playerId) {
  const signs = scenario.scene.signs || [];
  const layout = deriveLayout(scenario.scene);
  const playerActor = scenario.actors.find((a) => a.id === playerId);
  if (!playerActor || signs.length === 0) return null;

  for (const sign of signs) {
    const road = layout.roads[playerActor.from];
    if (sign.at === playerActor.from && road?.priority === 'secondary') {
      const code = sign.code;
      if (code === '2.4' || code === '2.5') {
        const hasTraffic = playback.frames?.some((f) =>
          f.actors?.some((a) => a.id !== playerId && a.progress > 0.1 && a.progress < 0.9)
        );
        if (hasTraffic) {
          return {
            clean: false,
            type: 'priority_violation',
            detail: `${code} belgisiga rioya qilinmadi`,
          };
        }
      }
    }
  }
  return null;
}

function detectMarkingViolation(scenario, playback, playerId) {
  const markings = scenario.scene.markings || [];
  const layout = deriveLayout(scenario.scene);
  const playerActor = scenario.actors.find((a) => a.id === playerId);
  if (!playerActor || markings.length === 0) return null;

  for (const m of markings) {
    if (m.type === 'stop_line' || m.type === 'give_way_line') {
      if (m.at === playerActor.from) {
        const hasCrossTraffic = playback.frames?.some((f) =>
          f.actors?.some((a) => a.id !== playerId && a.progress > 0.1 && a.progress < 0.5)
        );
        if (hasCrossTraffic) {
          return {
            clean: false,
            type: 'marking_violation',
            detail: `${m.type} chizig'iga rioya qilinmadi`,
          };
        }
      }
    }
  }
  return null;
}

function detectPriorityViolation(scenario, playback, playerId) {
  const { roads } = scenario.scene;
  if (!roads || roads.length < 2) return null;

  const roadMap = {};
  for (const r of roads) roadMap[r.dir] = r;
  const playerActor = scenario.actors.find((a) => a.id === playerId);
  if (!playerActor) return null;

  const playerRoad = roadMap[playerActor.from];
  if (!playerRoad || playerRoad.priority === 'main') return null;

  const actorsAtTime = playback.frames?.[5]?.actors || [];
  for (const other of actorsAtTime) {
    if (other.id === playerId || other.progress < 0.05) continue;
    const otherActor = scenario.actors.find((a) => a.id === other.id);
    if (!otherActor) continue;
    const otherRoad = roadMap[otherActor.from];
    if (otherRoad && otherRoad.priority === 'main' && other.progress > 0.1) {
      return {
        clean: false,
        type: 'priority_violation',
        detail: 'Asosiy yo\'ldagi transport vositasiga yo\'l berilmadi',
      };
    }
  }

  return null;
}
