// ============================================================
// simulation.js — 60fps tick, OBB collision, choreography
// ============================================================

import {
  LANE_WIDTH, VEHICLE_LENGTH, VEHICLE_WIDTH,
  TRAM_LENGTH, SAFETY_GAP, TICK_DT, vec2, OBB,
} from './core.js';
import { deriveLayout, getEntryPoint, getStopPoint, getExitPoint } from './layout.js';
import { buildTrajectory, sampleAtDistance } from './trajectory.js';

const SPEED_MS = 8;

export function simulateScenario(scenario, optionOrder) {
  const { scene, actors, resolution } = scenario;
  const layout = deriveLayout(scene);
  const actorMap = {};
  for (const a of actors) actorMap[a.id] = a;

  const entries = [];
  for (const actorId of optionOrder) {
    const a = actorMap[actorId];
    if (!a) continue;
    const entry = getEntryPoint(layout.roads, a.from, a.lane_in || 0);
    const exit = getExitPoint(layout.roads, a.to, a.lane_out || 0);
    const traj = buildTrajectory(entry, exit, a.from, a.to);
    const length = a.kind === 'tram' ? TRAM_LENGTH : VEHICLE_LENGTH;
    const width = a.kind === 'tram' ? VEHICLE_WIDTH : VEHICLE_WIDTH;
    entries.push({
      id: a.id, kind: a.kind, length, width,
      trajectory: traj, speed: SPEED_MS,
      releaseTime: 0,
    });
  }

  const released = [];
  const active = [];
  const done = [];
  let collision = null;
  let tick = 0;
  const maxTicks = 600;

  for (let t = 0; t <= maxTicks && !collision; t++) {
    tick = t;
    const time = t * TICK_DT;

    while (entries.length > 0 && time >= entries[0].releaseTime) {
      const e = entries.shift();
      released.push(e);
      active.push({ ...e, dist: 0 });
    }

    for (const a of active) {
      a.dist += a.speed * TICK_DT;
    }

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i], b = active[j];
        if (a.dist >= a.trajectory.totalLength || b.dist >= b.trajectory.totalLength) continue;

        const sa = sampleAtDistance(a.trajectory, a.dist);
        const sb = sampleAtDistance(b.trajectory, b.dist);
        const obbA = OBB.fromVehicle(sa.position, sa.tangent, a.length, a.width);
        const obbB = OBB.fromVehicle(sb.position, sb.tangent, b.length, b.width);

        if (obbA.overlaps(obbB)) {
          collision = {
            tick,
            actorA: a.id,
            actorB: b.id,
            point: sa.position,
          };
          break;
        }
      }
      if (collision) break;
    }

    if (!collision) {
      const doneIds = new Set();
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].dist >= active[i].trajectory.totalLength) {
          done.push(active.splice(i, 1)[0]);
        }
      }
    }
  }

  const frames = [];
  for (let t = 0; t <= tick && t <= maxTicks && !collision; t++) {
    const time = t * TICK_DT;
    const state = { actors: [] };
    let releasedSoFar = 0;
    for (const e of entries) {
      if (time >= e.releaseTime) releasedSoFar++;
    }
    for (const a of [...released, ...active]) {
      const dist = Math.min(a.dist, a.trajectory.totalLength);
      const info = sampleAtDistance(a.trajectory, dist);
      state.actors.push({
        id: a.id,
        position: info.position,
        heading: info.tangent,
        length: a.length,
        width: a.width,
        progress: info.progress,
        kind: a.kind,
      });
    }
    frames.push(state);
  }

  return { frames, collision, tick };
}

export function buildPlayback(scenario, playerFirstId) {
  const order = scenario.resolution.order;
  const playerIdx = order.indexOf(playerFirstId);
  const candidateOrder = [
    playerFirstId,
    ...order.filter((id) => id !== playerFirstId),
  ];
  return simulateScenario(scenario, candidateOrder);
}

export function buildCorrectPlayback(scenario) {
  return simulateScenario(scenario, scenario.resolution.order);
}
