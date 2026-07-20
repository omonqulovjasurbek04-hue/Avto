#!/usr/bin/env node
/**
 * Scenario validator.
 *
 *   node tools/validate.js content/*.json
 *   node tools/validate.js content            (directory is expanded)
 *   node tools/validate.js --json content     (machine-readable, for the editor)
 *
 * Exit code 1 if any file has an error. Warnings never fail the build; they are
 * content-review data.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { validate } = require('./lib/jsonschema');
const { check } = require('./lib/semantic');

const ROOT = path.resolve(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schema', 'scenario.schema.json'), 'utf8'));

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const inputs = argv.filter((a) => !a.startsWith('--'));

if (inputs.length === 0) {
  console.error('usage: node tools/validate.js [--json] <file-or-dir>...');
  process.exit(2);
}

/** Expand directories to their *.json children; the shell may not glob for us. */
const files = [];
for (const input of inputs) {
  const p = path.resolve(ROOT, input);
  if (!fs.existsSync(p)) {
    console.error(`not found: ${input}`);
    process.exit(2);
  }
  if (fs.statSync(p).isDirectory()) {
    for (const f of fs.readdirSync(p).sort()) {
      if (f.endsWith('.json')) files.push(path.join(p, f));
    }
  } else {
    files.push(p);
  }
}

const results = [];
let errorCount = 0;
let warningCount = 0;
const seenIds = new Map();

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const errors = [];
  const warnings = [];
  let sc = null;

  try {
    sc = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`not valid JSON: ${e.message}`);
  }

  if (sc) {
    errors.push(...validate(schema, sc, schema));
    if (errors.length === 0) {
      const fileBase = path.basename(file, '.json');
      const sem = check(sc, { fileBase });
      errors.push(...sem.errors);
      warnings.push(...sem.warnings);

      const prev = seenIds.get(sc.id);
      if (prev) errors.push(`duplicate scenario id "${sc.id}" (also in ${prev})`);
      else seenIds.set(sc.id, rel);
    }
  }

  errorCount += errors.length;
  warningCount += warnings.length;
  results.push({ file: rel, id: sc?.id ?? null, errors, warnings });
}

if (asJson) {
  console.log(JSON.stringify({ files: results, errorCount, warningCount }, null, 2));
} else {
  for (const r of results) {
    const status = r.errors.length ? 'FAIL' : r.warnings.length ? 'WARN' : 'ok  ';
    console.log(`${status}  ${r.file}`);
    for (const e of r.errors) console.log(`        error:   ${e}`);
    for (const w of r.warnings) console.log(`        warning: ${w}`);
  }
  console.log(
    `\n${results.length} file(s), ${errorCount} error(s), ${warningCount} warning(s)`
  );
}

process.exit(errorCount > 0 ? 1 : 0);
