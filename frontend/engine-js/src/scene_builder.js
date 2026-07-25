// ============================================================
// scene_builder.js — Display list generation from scenario
// ============================================================

import {
  CANVAS_SIZE, CENTRE, LANE_WIDTH, DIR_VECTORS,
  vec2, vFromDir, VEHICLE_LENGTH, VEHICLE_WIDTH,
} from './core.js';
import { deriveLayout } from './layout.js';

const ROAD_COLOUR = 0xFF334155;
const MARKING_COLOUR = 0xFF94A3B8;
const GRASS_COLOUR = 0xFF1A2E1A;
const CAR_COLOUR = 0xFF3B82F6;
const EGO_COLOUR = 0xFF10B981;
const TRAM_COLOUR = 0xFFEF4444;

export function buildScene(scenario) {
  const { scene } = scenario;
  const layout = deriveLayout(scene);
  const ops = [];

  addGround(ops);
  addRoads(ops, layout, scene);
  addMarkings(ops, layout, scene);
  addSigns(ops, layout, scene);
  addLights(ops, layout, scene);
  addActors(ops, scenario);

  return { ops, warnings: [] };
}

export function buildFrame(scenario, frameState) {
  const base = buildScene(scenario);
  const { actors } = frameState;
  if (actors) {
    addActorsFromState(base.ops, actors);
  }
  return base;
}

function addGround(ops) {
  ops.push({
    type: 'fillPolygon',
    points: [
      vec2(0, 0), vec2(CANVAS_SIZE, 0),
      vec2(CANVAS_SIZE, CANVAS_SIZE), vec2(0, CANVAS_SIZE),
    ],
    colour: GRASS_COLOUR,
  });
}

function addRoads(ops, layout, scene) {
  const { roads } = layout;
  for (const dir of Object.keys(roads)) {
    const r = roads[dir];
    ops.push({
      type: 'fillPolygon',
      points: r.polygon,
      colour: ROAD_COLOUR,
    });

    const d = DIR_VECTORS[dir];
    const perp = vec2(-d.y, d.x);

    for (let i = 0; i < r.lanesIn; i++) {
      const offset = (i + 0.5) * LANE_WIDTH;
      const cx = CENTRE.x + perp.x * offset;
      const cy = CENTRE.y + perp.y * offset;
      const dash = i === r.lanesIn - 1 && r.lanesOut > 0 ? [8, 6] : null;

      const p1 = vec2(cx + d.x * CANVAS_SIZE, cy + d.y * CANVAS_SIZE);
      const p2 = vec2(cx - d.x * CANVAS_SIZE, cy - d.y * CANVAS_SIZE);

      if (i === r.lanesIn - 1) {
        ops.push({
          type: 'strokePath',
          points: [p1, p2],
          colour: 0xFFFFFFFF,
          width: 1,
          dash: [10, 8],
        });
      }
    }
  }
}

function addMarkings(ops, layout, scene) {
  const markings = scene.markings || [];
  for (const m of markings) {
    const road = layout.roads[m.at];
    if (!road) continue;
    const d = DIR_VECTORS[m.at];
    const perp = vec2(-d.y, d.x);
    const halfW = road.halfW;

    if (m.type === 'crosswalk') {
      for (let i = -3; i <= 3; i++) {
        const offset = i * 6;
        const p1 = vec2(
          CENTRE.x + perp.x * halfW + d.x * (LANE_WIDTH + offset),
          CENTRE.y + perp.y * halfW + d.y * (LANE_WIDTH + offset),
        );
        const p2 = vec2(
          CENTRE.x - perp.x * halfW + d.x * (LANE_WIDTH + offset),
          CENTRE.y - perp.y * halfW + d.y * (LANE_WIDTH + offset),
        );
        ops.push({
          type: 'strokePath',
          points: [p1, p2],
          colour: MARKING_COLOUR,
          width: 3,
          dash: null,
        });
      }
    }

    if (m.type === 'give_way_line' || m.type === 'stop_line') {
      const depth = m.type === 'stop_line' ? LANE_WIDTH * 1.2 : LANE_WIDTH * 1.5;
      const p1 = vec2(
        CENTRE.x + perp.x * halfW + d.x * depth,
        CENTRE.y + perp.y * halfW + d.y * depth,
      );
      const p2 = vec2(
        CENTRE.x - perp.x * halfW + d.x * depth,
        CENTRE.y - perp.y * halfW + d.y * depth,
      );
      const dash = m.type === 'give_way_line' ? [12, 8] : null;
      ops.push({
        type: 'strokePath',
        points: [p1, p2],
        colour: 0xFFFFFFFF,
        width: 4,
        dash,
      });
    }
  }
}

function addSigns(ops, layout, scene) {
  const signs = scene.signs || [];
  for (const sign of signs) {
    const road = layout.roads[sign.at];
    if (!road) continue;
    const d = DIR_VECTORS[sign.at];
    const perp = vec2(-d.y, d.x);
    const signPos = vec2(
      CENTRE.x + perp.x * (road.halfW + 20) + d.x * LANE_WIDTH * 1.5,
      CENTRE.y + perp.y * (road.halfW + 20) + d.y * LANE_WIDTH * 1.5,
    );

    ops.push({
      type: 'fillCircle',
      centre: signPos,
      radius: 10,
      colour: 0xFFFFFFFF,
    });

    ops.push({
      type: 'fillPolygon',
      points: [
        vec2(signPos.x - 8, signPos.y - 8),
        vec2(signPos.x + 8, signPos.y - 8),
        vec2(signPos.x + 8, signPos.y + 8),
        vec2(signPos.x - 8, signPos.y + 8),
      ],
      colour: sign.code.startsWith('2') ? 0xFFFFDD00 : 0xFFEF4444,
    });
  }
}

function addLights(ops, layout, scene) {
  const lights = scene.lights || [];
  for (const light of lights) {
    const at = light.at === 'all' ? 'N' : light.at;
    const road = layout.roads[at];
    if (!road) continue;
    const d = DIR_VECTORS[at];
    const perp = vec2(-d.y, d.x);
    const pos = vec2(
      CENTRE.x + perp.x * road.halfW * 0.5 + d.x * 20,
      CENTRE.y + perp.y * road.halfW * 0.5 + d.y * 20,
    );

    const colourMap = {
      red: 0xFFEF4444, yellow: 0xFFF59E0B,
      green: 0xFF10B981, off: 0xFF334155,
      green_blink: 0xFF10B981, yellow_blink: 0xFFF59E0B,
    };
    const c = colourMap[light.state] || 0xFF334155;

    ops.push({
      type: 'fillCircle',
      centre: pos,
      radius: 6,
      colour: c,
    });
  }
}

function addActors(ops, scenario) {
  const { actors, scene } = scenario;
  const layout = deriveLayout(scene);

  for (const actor of actors) {
    const entry = getEntryPoint(layout, actor.from, actor.lane_in || 0);
    const heading = vFromDir(actor.from).scale(-1);
    const length = actor.kind === 'tram' ? 150 : VEHICLE_LENGTH;
    const width = actor.kind === 'tram' ? VEHICLE_WIDTH : VEHICLE_WIDTH;
    const colour = actor.role === 'player' ? EGO_COLOUR : (actor.color ? parseInt(actor.color.replace('#', ''), 16) : CAR_COLOUR);

    drawVehicle(ops, entry, heading, length, width, colour, actor.id);
  }
}

function addActorsFromState(ops, actorStates) {
  for (const a of actorStates) {
    const colour = a.kind === 'tram' ? TRAM_COLOUR : CAR_COLOUR;
    drawVehicle(ops, a.position, a.heading, a.length, a.width, colour, a.id);
  }
}

function drawVehicle(ops, pos, heading, length, width, colour, id) {
  const angle = Math.atan2(heading.y, heading.x);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const hw = width / 2;
  const hh = length / 2;

  const corners = [
    vec2(pos.x + (-cos * hw - sin * hh), pos.y + (-sin * hw + cos * hh)),
    vec2(pos.x + (cos * hw - sin * hh), pos.y + (sin * hw + cos * hh)),
    vec2(pos.x + (cos * hw + sin * hh), pos.y + (sin * hw - cos * hh)),
    vec2(pos.x + (-cos * hw + sin * hh), pos.y + (-sin * hw - cos * hh)),
  ];

  ops.push({
    type: 'fillPolygon',
    points: corners,
    colour,
  });
}

function getEntryPoint(layout, from, laneIdx) {
  const road = layout.roads[from];
  if (!road || !road.incomingLanes[laneIdx]) return vec2(CENTRE.x, CENTRE.y);
  const d = DIR_VECTORS[from];
  return road.incomingLanes[laneIdx].entry || vec2(
    CENTRE.x + d.x * CANVAS_SIZE,
    CENTRE.y + d.y * CANVAS_SIZE,
  );
}
