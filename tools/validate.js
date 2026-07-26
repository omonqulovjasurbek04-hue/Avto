#!/usr/bin/env node
// Validates content JSON files against the scenario schema.
// Usage: node tools/validate [content_dir]

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = process.argv[2] || path.join(ROOT, "content");
const SCHEMA_PATH = path.join(ROOT, "schema", "scenario.schema.json");

const SCENE_TYPES = ["crossroads_4way", "t_junction", "y_junction", "roundabout", "straight_road", "overtaking", "pedestrian_crossing", "railway_crossing", "narrow_road", "parking_stopping", "residential_yard", "tunnel"];
const VALID_DIRS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];
const VALID_PRIORITIES = ["main", "secondary", "equal"];
const VALID_KINDS = ["car", "truck", "bus", "tram", "motorcycle", "bicycle", "pedestrian", "emergency"];
const VALID_ROLES = ["player", "traffic"];
const VALID_OUTCOMES = ["collision", "priority_violation", "sign_violation", "marking_violation", "unnecessary_wait", "unsafe_but_legal"];

const errors = [];
const warnings = [];

function validate(data, file) {
  if (!data.id) errors.push(`${file}: missing "id"`);
  if (!data.schema_version) errors.push(`${file}: missing "schema_version"`);
  if (!data.question_id) errors.push(`${file}: missing "question_id"`);
  if (!data.topic) errors.push(`${file}: missing "topic"`);
  if (!data.scene) errors.push(`${file}: missing "scene"`);
  if (!data.actors) errors.push(`${file}: missing "actors"`);
  if (!data.question) errors.push(`${file}: missing "question"`);
  if (!data.resolution) errors.push(`${file}: missing "resolution"`);

  if (data.scene) {
    if (!SCENE_TYPES.includes(data.scene.type)) {
      errors.push(`${file}: invalid scene type "${data.scene.type}"`);
    }
    if (!data.scene.roads?.length) {
      errors.push(`${file}: scene must have at least 1 road`);
    }
    for (const r of data.scene.roads || []) {
      if (!VALID_DIRS.includes(r.dir)) errors.push(`${file}: road invalid dir "${r.dir}"`);
      if (!VALID_PRIORITIES.includes(r.priority)) errors.push(`${file}: road invalid priority "${r.priority}"`);
      if (typeof r.lanes_in !== "number") errors.push(`${file}: road missing lanes_in`);
      if (typeof r.lanes_out !== "number") errors.push(`${file}: road missing lanes_out`);
    }
  }

  if (data.actors) {
    for (const a of data.actors) {
      if (!a.id) errors.push(`${file}: actor missing id`);
      if (!VALID_KINDS.includes(a.kind)) errors.push(`${file}: actor invalid kind "${a.kind}"`);
      if (a.role && !VALID_ROLES.includes(a.role)) errors.push(`${file}: actor invalid role "${a.role}"`);
      if (!VALID_DIRS.includes(a.from)) errors.push(`${file}: actor "${a.id}" invalid from "${a.from}"`);
      if (!VALID_DIRS.includes(a.to)) errors.push(`${file}: actor "${a.id}" invalid to "${a.to}"`);
    }
  }

  if (data.question) {
    if (typeof data.question.text !== "object") errors.push(`${file}: question.text must be a localized object`);
    if (!data.question.options?.length) errors.push(`${file}: question must have options`);
    if (!data.question.correct) errors.push(`${file}: question missing correct answer id`);

    const optIds = new Set();
    for (const o of data.question.options || []) {
      if (!o.id) errors.push(`${file}: option missing id`);
      if (optIds.has(o.id)) errors.push(`${file}: duplicate option id "${o.id}"`);
      optIds.add(o.id);
    }
    if (data.question.correct && !optIds.has(data.question.correct)) {
      errors.push(`${file}: correct answer "${data.question.correct}" not in options`);
    }
  }

  if (data.resolution) {
    if (!data.resolution.order?.length) errors.push(`${file}: resolution.order must be non-empty`);
    if (!data.resolution.rule?.code) errors.push(`${file}: resolution.rule missing code`);
  }

  // Check playback duration
  if (data.resolution?.order && data.actors) {
    const totalActors = data.resolution.order.length;
    const estimatedTime = totalActors * 1.5 + 1;
    if (estimatedTime > 9) warnings.push(`${file}: estimated playback (${estimatedTime.toFixed(1)}s) exceeds 9s`);
    if (estimatedTime < 4) warnings.push(`${file}: estimated playback (${estimatedTime.toFixed(1)}s) is under 4s`);
  }

  return { errors, warnings };
}

function main() {
  if (!existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json")).sort();
  if (files.length === 0) {
    console.warn("No JSON files found in content directory.");
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    errors.length = 0;
    warnings.length = 0;
    try {
      const data = JSON.parse(readFileSync(path.join(CONTENT_DIR, file), "utf8"));
      validate(data, file);
    } catch (e) {
      errors.push(`${file}: parse error - ${e.message}`);
    }

    if (errors.length || warnings.length) {
      console.log(`\n${file}:`);
      for (const e of errors) { console.log(`  ERROR: ${e}`); totalErrors++; }
      for (const w of warnings) { console.log(`  WARN:  ${w}`); totalWarnings++; }
    } else {
      console.log(`${file}: OK`);
    }
  }

  console.log(`\n${files.length} files checked. ${totalErrors} errors, ${totalWarnings} warnings.`);
  if (totalErrors > 0) process.exit(1);
}

main();
