#!/usr/bin/env node
// Copies validated scenarios from /content to every consumer that needs them
// as static assets. Run after editing content: node tools/sync_content.js
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'content');
const DSTS = [
  path.join(ROOT, 'app', 'assets', 'content'),
  // The browser viewer fetches these over HTTP, so they must sit under the
  // editor's served directory.
  path.join(ROOT, 'editor', 'public', 'content'),
];

// Refuse to ship invalid content.
execFileSync(process.execPath, [path.join(__dirname, 'validate.js'), SRC], { stdio: 'inherit' });

const sources = fs.readdirSync(SRC).sort().filter((f) => f.endsWith('.json'));

for (const dst of DSTS) {
  fs.mkdirSync(dst, { recursive: true });
  // Clear first, so a scenario deleted from /content does not linger here.
  for (const f of fs.readdirSync(dst)) {
    if (f.endsWith('.json')) fs.unlinkSync(path.join(dst, f));
  }
  for (const f of sources) fs.copyFileSync(path.join(SRC, f), path.join(dst, f));
  console.log(`synced ${sources.length} scenario(s) -> ${path.relative(ROOT, dst)}`);
}
