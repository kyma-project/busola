import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.join(here, '..', 'reports');

function fmt(n) {
  return typeof n === 'number' ? n.toFixed(2) : 'n/a';
}

function renderSummary({ kind, meta, metrics }) {
  const s = meta.settings;
  const requested =
    typeof s.ratePerMinute === 'number'
      ? `${(s.ratePerMinute / 60).toFixed(2)}/s`
      : String(s.ratePerMinute);
  return (
    [
      `Busola backend load test — ${kind.toUpperCase()}`,
      `workload:     ${meta.workload}`,
      `endpoint:     ${meta.endpoint}`,
      `auth mode:    ${meta.authMode}`,
      `revision:     ${meta.revision}`,
      `vegeta:       ${meta.vegetaVersion}`,
      `settings:     rate=${s.ratePerMinute}/min duration=${s.durationSec}s workers=${s.maxWorkers} timeout=${s.timeoutMs}ms payload=${s.payloadSize}`,
      '',
      `requests:     ${metrics.requests}`,
      `throughput:   requested ${requested}, achieved ${fmt(metrics.rate.achieved)}/s (sent ${fmt(metrics.rate.sent)}/s)`,
      `latency (ms): p50 ${fmt(metrics.latencyMs.p50)}  p95 ${fmt(metrics.latencyMs.p95)}  p99 ${fmt(metrics.latencyMs.p99)}  mean ${fmt(metrics.latencyMs.mean)}  max ${fmt(metrics.latencyMs.max)}`,
      `status codes: ${JSON.stringify(metrics.statusCodes)}`,
      `timeouts:     ${metrics.timeouts}`,
      `errors:       ${metrics.errors.length ? JSON.stringify(metrics.errors) : 'none'}`,
    ].join('\n') + '\n'
  );
}

/**
 * Write a JSON result and a readable summary for one phase to reports/.
 * No secrets or response bodies are included — only metrics and run metadata.
 *
 * @param {object} metrics parsed metrics (Task 5)
 * @param {object} meta {workload, endpoint, authMode, revision, vegetaVersion, settings}
 * @param {'warmup'|'measured'|'rejection'} kind
 * @returns {{jsonPath:string, summaryPath:string}}
 */
export function writeReport(metrics, meta, kind) {
  fs.mkdirSync(reportsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `${meta.workload}-${meta.authMode}-${ts}.${kind}`;
  const jsonPath = path.join(reportsDir, `${base}.json`);
  const summaryPath = path.join(reportsDir, `${base}.txt`);
  const doc = { kind, meta, metrics };
  fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2));
  fs.writeFileSync(summaryPath, renderSummary(doc));
  return { jsonPath, summaryPath };
}
