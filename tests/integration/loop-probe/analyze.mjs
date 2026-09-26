#!/usr/bin/env node
//
// Correlate the loop-probe artifacts into a single timeline so one captured run is
// enough to name the edit-cluster OOM loop. Run against a downloaded artifact dir:
//
//   node analyze.mjs <loop-probe-dir>
//
// Inputs (any subset that exists):
//   chrome-mem.csv      OS per-process RSS/CPU (the crash signature)
//   cdp-metrics.jsonl   CDP Performance.getMetrics samples (JSHeapUsedSize, Nodes, ...)
//   inpage.jsonl        beaconed in-page snapshots (commit rate, scheduler stacks, ...)
//   live-hold.jsonl     spec-side snapshots taken during the hold
//   cpu-*.cpuprofile    open in Chrome DevTools > Performance, or speedscope.app
//   heap-*.heapprofile  open in Chrome DevTools > Memory > Load profile
//
// This script prints a summary; the .cpuprofile / .heapprofile files are the
// definitive per-function / per-allocation-stack evidence — open them in a UI.

import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || '.';
const read = (f) => {
  const p = path.join(dir, f);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
};
const readJsonl = (f) =>
  (read(f) || '')
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

// ---- OS memory: peak renderer RSS + whether CPU was pegged --------------------
const mem = read('chrome-mem.csv');
if (mem) {
  const rows = mem
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((l) => l.split(','))
    .map((r) => ({
      ts: Number(r[1]),
      pid: r[2],
      ptype: r[3],
      vsz: Number(r[4]),
      rss: Number(r[5]),
      cpu: Number(r[6]),
    }));

  // Per-pid accounting so we can find the hottest process even if the ps-based
  // --type=renderer label is missing (the RSS ratchet is the ground truth, not
  // the label). GPU/browser processes stay flat, so max-peak-RSS picks the AUT
  // renderer regardless of how it was tagged.
  const byPid = new Map();
  for (const r of rows) {
    let a = byPid.get(r.pid);
    if (!a) {
      a = { pid: r.pid, ptype: r.ptype, peakRss: 0, pegged: 0, samples: 0 };
      byPid.set(r.pid, a);
    }
    a.samples++;
    if (r.rss > a.peakRss) {
      a.peakRss = r.rss;
      a.peakCpu = r.cpu;
      a.peakTs = r.ts;
    }
    if (r.cpu > 100) a.pegged++;
  }
  const procs = [...byPid.values()];
  const labeledRenderers = procs.filter((p) => p.ptype === 'renderer');
  // hottest process overall (fallback when labeling failed)
  const hot = procs.sort((a, b) => b.peakRss - a.peakRss)[0] || { peakRss: 0, pegged: 0 };
  // prefer a labeled renderer if one actually exists, else the hottest process
  const subject =
    labeledRenderers.sort((a, b) => b.peakRss - a.peakRss)[0] || hot;

  console.log('== OS memory sampler ==');
  console.log(`  chrome processes seen: ${procs.length} (labeled renderer: ${labeledRenderers.length})`);
  console.log(
    `  hottest process: pid ${subject.pid} type=${subject.ptype} ` +
      `peak RSS ${subject.peakRss} MB (cpu ${subject.peakCpu} at peak), ` +
      `pegged(cpu>100%) samples: ${subject.pegged}`,
  );
  const runaway = subject.peakRss > 2000 && subject.pegged > 5;
  console.log(
    `  => signature: ${
      runaway
        ? 'RUNAWAY LOOP (climbing RSS + pegged CPU)'
        : 'inconclusive / did not reproduce'
    }\n`,
  );
}

// ---- CDP metrics: heap / DOM / listener growth --------------------------------
const cdp = readJsonl('cdp-metrics.jsonl');
if (cdp.length) {
  const val = (m, name) =>
    Array.isArray(m.metrics)
      ? m.metrics.find((x) => x.name === name)?.value
      : undefined;
  const first = cdp[0];
  const last = cdp[cdp.length - 1];
  console.log('== CDP Performance.getMetrics ==');
  for (const name of ['JSHeapUsedSize', 'Nodes', 'JSEventListeners', 'LayoutCount']) {
    const a = val(first, name);
    const b = val(last, name);
    if (a != null && b != null) {
      const fmt = name === 'JSHeapUsedSize' ? (v) => `${Math.round(v / 1048576)}MB` : (v) => v;
      console.log(`  ${name}: ${fmt(a)} -> ${fmt(b)}`);
    }
  }
  console.log('');
}

// ---- in-page: render loop + who schedules the work ----------------------------
const snaps = [...readJsonl('inpage.jsonl'), ...readJsonl('live-hold.jsonl')];
if (snaps.length) {
  const latest = snaps[snaps.length - 1];
  console.log('== in-page probe (latest snapshot) ==');
  console.log(`  url: ${latest.url}`);
  console.log(`  total React commits: ${latest.commits}`);
  console.log(`  max commits/sec: ${latest.maxCommitsPerSec}`);
  console.log(`  scheduler counts: ${JSON.stringify(latest.sched)}`);
  console.log(`  fetches: ${latest.fetches}  xhrs: ${latest.xhrs}`);
  const list = (label, arr) => {
    if (!arr?.length) return;
    console.log(`  top ${label}:`);
    for (const { k, v } of arr.slice(0, 10)) console.log(`    ${v}  ${k}`);
  };
  list('scheduler call-sites (who loops)', latest.topStacks);
  list('re-rendering components', latest.topComponents);
  list('fetch/xhr urls', latest.topUrls);
  list('console error/warn signatures', latest.console);
  console.log('');
}

// ---- profile files present? ---------------------------------------------------
const profiles = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.cpuprofile') || f.endsWith('.heapprofile'));
console.log('== profile checkpoints on disk ==');
if (profiles.length) {
  for (const f of profiles) console.log(`  ${f}`);
  console.log(
    '\n  Open .cpuprofile in Chrome DevTools (Performance > load) or https://speedscope.app',
  );
  console.log('  to see the dominant function; .heapprofile in DevTools > Memory.');
} else {
  console.log('  (none — the loop likely did not reproduce in this run)');
}
