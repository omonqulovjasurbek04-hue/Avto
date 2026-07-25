// ============================================================
// layout.js — Road layout derivation from scenario JSON
// ============================================================

import { CANVAS_SIZE, CENTRE, DIR_VECTORS, LANE_WIDTH, OPPOSITE, vec2, vFromDir } from './core.js';

export function deriveLayout(scene) {
  const roads = scene.roads || [];
  const roadGeom = {};
  let minInterX = Infinity, minInterY = Infinity;
  let maxInterX = -Infinity, maxInterY = -Infinity;

  for (const r of roads) {
    const dir = r.dir;
    const d = DIR_VECTORS[dir];
    if (!d) continue;

    const halfW = (r.lanes_in + r.lanes_out) * LANE_WIDTH / 2;
    const perp = vec2(-d.y, d.x);

    const centreEnd = vec2(CENTRE.x + d.x * CANVAS_SIZE, CENTRE.y + d.y * CANVAS_SIZE);
    const c0 = vec2(CENTRE.x + perp.x * halfW, CENTRE.y + perp.y * halfW);
    const c1 = vec2(CENTRE.x - perp.x * halfW, CENTRE.y - perp.y * halfW);
    const c2 = vec2(centreEnd.x + perp.x * halfW, centreEnd.y + perp.y * halfW);
    const c3 = vec2(centreEnd.x - perp.x * halfW, centreEnd.y - perp.y * halfW);

    const interDepth = LANE_WIDTH * 1.5;
    const stopX = CENTRE.x + d.x * interDepth;
    const stopY = CENTRE.y + d.y * interDepth;

    const interW = halfW;
    const interD = LANE_WIDTH;
    const ix0 = CENTRE.x + perp.x * interW + d.x * interD;
    const iy0 = CENTRE.y + perp.y * interW + d.y * interD;
    const ix1 = CENTRE.x - perp.x * interW + d.x * interD;
    const iy1 = CENTRE.y - perp.y * interW + d.y * interD;

    minInterX = Math.min(minInterX, ix0, ix1);
    minInterY = Math.min(minInterY, iy0, iy1);
    maxInterX = Math.max(maxInterX, ix0, ix1);
    maxInterY = Math.max(maxInterY, iy0, iy1);

    const incomingLanes = [];
    for (let i = 0; i < r.lanes_in; i++) {
      const offset = (i + 0.5) * LANE_WIDTH;
      const laneCentre = vec2(CENTRE.x + perp.x * offset, CENTRE.y + perp.y * offset);
      const entry = vec2(laneCentre.x + d.x * CANVAS_SIZE, laneCentre.y + d.y * CANVAS_SIZE);
      const stop = vec2(laneCentre.x + d.x * interDepth, laneCentre.y + d.y * interDepth);
      incomingLanes.push({ index: i, centre: laneCentre, entry, stop });
    }

    const outgoingLanes = [];
    for (let i = 0; i < r.lanes_out; i++) {
      const offset = (i + 0.5) * LANE_WIDTH;
      const laneCentre = vec2(CENTRE.x - perp.x * offset, CENTRE.y - perp.y * offset);
      const exit = vec2(laneCentre.x + d.x * CANVAS_SIZE, laneCentre.y + d.y * CANVAS_SIZE);
      outgoingLanes.push({ index: i, centre: laneCentre, exit });
    }

    roadGeom[dir] = {
      dir, priority: r.priority,
      lanesIn: r.lanes_in, lanesOut: r.lanes_out,
      halfW,
      incomingLanes, outgoingLanes,
      stopPoint: vec2(stopX, stopY),
      polygon: [c0, c1, c3, c2],
      interBounds: [vec2(ix0, iy0), vec2(ix1, iy1)],
    };
  }

  const interBox = {
    x: minInterX, y: minInterY,
    w: maxInterX - minInterX, h: maxInterY - minInterY,
  };

  return { roads: roadGeom, intersection: interBox };
}

export function getEntryPoint(roadGeom, from, laneIndex = 0) {
  const r = roadGeom[from];
  if (!r || !r.incomingLanes[laneIndex]) return vec2(CENTRE.x, CENTRE.y);
  return r.incomingLanes[laneIndex].entry;
}

export function getStopPoint(roadGeom, from, laneIndex = 0) {
  const r = roadGeom[from];
  if (!r || !r.incomingLanes[laneIndex]) return vec2(CENTRE.x, CENTRE.y);
  return r.incomingLanes[laneIndex].stop;
}

export function getExitPoint(roadGeom, to, laneIndex = 0) {
  const r = roadGeom[to];
  if (!r || !r.outgoingLanes[laneIndex]) return vec2(CENTRE.x, CENTRE.y);
  return r.outgoingLanes[laneIndex].exit;
}
