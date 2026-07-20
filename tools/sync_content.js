#!/usr/bin/env node
// Copies validated scenarios from /content into the Flutter app's asset dir.
// Run after editing content: node tools/sync_content.js
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'content');
const DST = path.join(ROOT, 'app', 'assets', 'content');

// Refuse to ship invalid content.
execFileSync(process.execPath, [path.join(__dirname, 'validate.js'), SRC], { stdio: 'inherit' });

fs.mkdirSync(DST, { recursive: true });
for (const f of fs.readdirSync(DST)) {
  if (f.endsWith('.json')) fs.unlinkSync(path.join(DST, f));
}
let n = 0;
for (const f of fs.readdirSync(SRC).sort()) {
  if (!f.endsWith('.json')) continue;
  fs.copyFileSync(path.join(SRC, f), path.join(DST, f));
  n++;
}
console.log(`synced ${n} scenario(s) -> app/assets/content`);
