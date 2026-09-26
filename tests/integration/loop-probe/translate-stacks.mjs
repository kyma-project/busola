#!/usr/bin/env node
//
// Translate the loop-probe's captured MINIFIED call-site stacks back to app source,
// using the source maps emitted by the loop-probe build (BUSOLA_SOURCEMAP=1). This is
// what finally names the app code behind the edit-cluster OOM loop: the in-page probe
// records frames like `Y_ (index-<hash>.js:1684:96528)`, and the matching
// `index-<hash>.js.map` resolves each to `{source, line, name}`.
//
// Usage:
//   node translate-stacks.mjs <loop-probe-dir> <sourcemap-dir> [file:line:col ...]
//
//   <loop-probe-dir>   dir with inpage.jsonl / live-hold.jsonl (the captured stacks)
//   <sourcemap-dir>    dir with the uploaded *.js.map files (busola-sourcemaps artifact)
//   [file:line:col]    optional extra raw frames to resolve (e.g. index-x.js:629:47183)
//
// With no explicit frames it translates the top scheduler call-sites from the latest
// snapshot — the same list analyze.mjs prints, but de-minified.

import fs from 'node:fs';
import path from 'node:path';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';

const [probeDir, mapDir, ...rawFrames] = process.argv.slice(2);
if (!probeDir || !mapDir) {
  console.error(
    'usage: node translate-stacks.mjs <loop-probe-dir> <sourcemap-dir> [file:line:col ...]',
  );
  process.exit(1);
}

// ---- load every *.js.map, keyed by the JS basename it maps -------------------
const maps = new Map(); // "index-<hash>.js" -> TraceMap
for (const f of fs.readdirSync(mapDir)) {
  if (!f.endsWith('.js.map')) continue;
  try {
    const tm = new TraceMap(fs.readFileSync(path.join(mapDir, f), 'utf8'));
    maps.set(f.replace(/\.map$/, ''), tm); // index-x.js.map -> index-x.js
  } catch (e) {
    console.error(`  (skip ${f}: ${e.message})`);
  }
}
if (!maps.size) {
  console.error(`no *.js.map files in ${mapDir}`);
  process.exit(1);
}
console.log(`loaded ${maps.size} source map(s): ${[...maps.keys()].join(', ')}\n`);

// ---- resolve one "file:line:col" to original source --------------------------
// V8 stack positions are 1-based line + 1-based column; trace-mapping wants a
// 1-based line and a 0-based column.
const resolve = (file, line, col) => {
  const tm = maps.get(file);
  if (!tm) return null;
  const op = originalPositionFor(tm, { line: Number(line), column: Number(col) - 1 });
  if (!op || op.source == null) return null;
  return `${op.name || '?'}  ${op.source}:${op.line}:${(op.column ?? 0) + 1}`;
};

// Rewrite a whole "funcA (url:line:col) <- funcB (url:line:col)" stack string.
const FRAME_RE = /([^\s(]+)?\s*\(?https?:\/\/[^/]+\/[^)]*?\/([^/):]+\.js):(\d+):(\d+)\)?/g;
const translateStack = (s) =>
  s.replace(FRAME_RE, (m, fn, file, line, col) => {
    const r = resolve(file, line, col);
    return r ? `${fn || ''}→[${r}]` : m;
  });

// ---- explicit frames from argv ----------------------------------------------
if (rawFrames.length) {
  console.log('== explicit frames ==');
  for (const fr of rawFrames) {
    const m = fr.match(/([^/:]+\.js):(\d+):(\d+)/);
    if (!m) {
      console.log(`  ${fr}  (unparseable)`);
      continue;
    }
    const r = resolve(m[1], m[2], m[3]);
    console.log(`  ${fr}\n     -> ${r || '(no mapping — hash mismatch?)'}`);
  }
  console.log('');
}

// ---- top scheduler call-sites from the latest snapshot -----------------------
const readJsonl = (f) => {
  const p = path.join(probeDir, f);
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};
const snaps = [...readJsonl('inpage.jsonl'), ...readJsonl('live-hold.jsonl')];
const withStacks = snaps.filter((s) => s.topStacks?.length);
const latest = withStacks[withStacks.length - 1];
if (latest?.topStacks?.length) {
  console.log(`== top scheduler call-sites (translated) — ${latest.url} ==`);
  for (const { k, v } of latest.topStacks.slice(0, 12)) {
    const [category, frames = ''] = k.split('|');
    console.log(`\n  [${v}]  ${category}`);
    for (const fr of frames.split(' <- ')) {
      console.log(`      ${translateStack(fr.trim())}`);
    }
  }
} else {
  console.log('(no topStacks in inpage.jsonl / live-hold.jsonl)');
}
