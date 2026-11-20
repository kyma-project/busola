import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SECRET_KEYS = ['token', 'authorization', 'kubeconfig'];

function scrub(value) {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SECRET_KEYS.includes(k.toLowerCase())) continue;
      out[k] = scrub(v);
    }
    return out;
  }
  return value;
}

export function buildReport({ scenarios, meta }) {
  return { meta, scenarios };
}

export function toMarkdown(report) {
  // Renders an allowlist of non-credential fields only — never serialize raw meta/scenario objects here.
  const lines = [
    '# Busola performance summary',
    '',
    `- Build: ${report.meta.buildVersion}`,
    `- Browser: ${report.meta.browserVersion}`,
    `- Samples per metric: ${report.meta.sampleCount}`,
    '',
    '| Scenario | Metric | Dataset | Cold median (ms) | Warm median (ms) |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const s of report.scenarios) {
    const size = report.meta.datasetSizes?.[s.name] ?? '';
    const metrics = new Set([
      ...Object.keys(s.cold ?? {}),
      ...Object.keys(s.warm ?? {}),
    ]);
    for (const m of metrics) {
      lines.push(
        `| ${s.name} | ${m} | ${size} | ${s.cold[m]?.median ?? 'n/a'} | ${s.warm[m]?.median ?? 'n/a'} |`,
      );
    }
  }
  return lines.join('\n') + '\n';
}

export function writeReport(report, dir) {
  mkdirSync(dir, { recursive: true });
  const safe = scrub(report);
  const jsonPath = join(dir, 'performance.json');
  const mdPath = join(dir, 'summary.md');
  writeFileSync(jsonPath, JSON.stringify(safe, null, 2));
  writeFileSync(mdPath, toMarkdown(safe));
  return { jsonPath, mdPath };
}
