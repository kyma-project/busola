import { execFileSync } from 'child_process';
import { buildAuthHeaders } from './auth.js';
import { buildTargets } from './targets.js';
import { preflight } from './preflight.js';
import { runAttack } from './vegeta.js';
import { parseMetrics } from './metrics.js';
import { writeReport } from './report.js';

function appRevision() {
  try {
    return execFileSync('git', ['describe', '--tags', '--always'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

function vegetaVersion(bin) {
  try {
    return execFileSync(bin, ['-version'], { encoding: 'utf8' })
      .split('\n')[0]
      .replace(/^Version:\s*/, '')
      .trim();
  } catch {
    return 'unknown';
  }
}

function buildMeta(config, workload, vegetaBin) {
  return {
    workload,
    endpoint: config.endpoints.map((e) => e.path).join(','),
    authMode: config.authMode,
    revision: appRevision(),
    vegetaVersion: vegetaVersion(vegetaBin),
    settings: {
      ratePerMinute: config.ratePerMinute,
      durationSec: config.durationSec,
      maxWorkers: config.maxWorkers,
      timeoutMs: config.timeoutMs,
      payloadSize: config.upstream.payloadSize,
    },
  };
}

/**
 * Orchestrate one workload: preflight → warm-up phase → measured phase →
 * reports. Warm-up is attacked and reported separately (never merged into the
 * measured baseline). Throws on preflight failure, empty/zero results, any
 * non-200 status in the measured set, or any measured timeout — so an invalid
 * run never produces a "successful" baseline.
 *
 * @param {object} config resolved config (Task 2)
 * @param {object} creds proxy credentials (Task 6 resolveCreds)
 * @param {{vegetaBin?:string, workload?:string}} [opts]
 * @returns {Promise<{warmup, measured, meta}>}
 */
export async function run(config, creds, opts = {}) {
  const vegetaBin = opts.vegetaBin || 'vegeta';
  const workload = opts.workload || 'custom';

  const headers = buildAuthHeaders(config.authMode, creds);
  await preflight(config, headers);

  const targets = buildTargets(config, headers);
  const meta = buildMeta(config, workload, vegetaBin);

  const attackOpts = {
    targets,
    ratePerMinute: config.ratePerMinute,
    maxWorkers: config.maxWorkers,
    timeoutMs: config.timeoutMs,
    vegetaBin,
  };

  // Warm-up phase — reported separately, never merged.
  const warmRaw = await runAttack({
    ...attackOpts,
    durationSec: config.warmupSec,
  });
  const warmMetrics = parseMetrics(warmRaw);
  const warmPaths = writeReport(warmMetrics, meta, 'warmup');

  // Measured phase.
  const measRaw = await runAttack({
    ...attackOpts,
    durationSec: config.durationSec,
  });
  const measMetrics = parseMetrics(measRaw);
  const measPaths = writeReport(measMetrics, meta, 'measured');

  const unexpected = Object.keys(measMetrics.statusCodes).filter(
    (c) => c !== '200',
  );
  if (unexpected.length) {
    throw new Error(
      `measured run had unexpected status codes: ${JSON.stringify(measMetrics.statusCodes)}`,
    );
  }
  if (measMetrics.timeouts > 0) {
    throw new Error(`measured run had ${measMetrics.timeouts} timeouts`);
  }
  if (measMetrics.errors.length > 0) {
    throw new Error(
      `measured run reported errors: ${JSON.stringify(measMetrics.errors)}`,
    );
  }

  return {
    warmup: { metrics: warmMetrics, ...warmPaths },
    measured: { metrics: measMetrics, ...measPaths },
    meta,
  };
}
