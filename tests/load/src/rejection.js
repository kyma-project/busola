import { buildAuthHeaders } from './auth.js';
import { buildTargets } from './targets.js';
import { runAttack } from './vegeta.js';
import { parseMetrics } from './metrics.js';
import { writeReport } from './report.js';

/**
 * K8s 2000/min-per-credential rejection workload. Deliberately exceeds the
 * limit with a single credential and asserts the backend returns 429s. The
 * result is written to an ISOLATED report (kind "rejection", workload
 * "rejection-k8s") and never merged with any measured baseline.
 *
 * A bounded burst of `totalRequests` over `durationSec` (default 2500 over 5s
 * = 500/s) overshoots the 2000-per-60s window so the tail is throttled. Plan
 * note: the plan's "3000/min short burst" cannot exceed 2000 within a short
 * window — see ledger ruling.
 *
 * Returns the parsed metrics. Throws if no 429 is observed (limit not
 * enforced, or insufficient load).
 *
 * @param {object} config resolved config (Task 2)
 * @param {object} creds proxy credentials (Task 6 resolveCreds)
 * @param {{vegetaBin?:string, totalRequests?:number, durationSec?:number, maxWorkers?:number}} [opts]
 */
export async function runRejection(config, creds, opts = {}) {
  const vegetaBin = opts.vegetaBin || 'vegeta';
  const totalRequests = opts.totalRequests || 2500;
  const durationSec = opts.durationSec || 5;
  const maxWorkers = opts.maxWorkers || 200;

  // Use a dedicated credential so the rejection burst cannot poison a measured
  // workload's rate-limit bucket regardless of run order (plan Task 7). The
  // backend keys the limiter on the token/client-cert; a distinct token =
  // distinct bucket. (Cert-mode isolation would need a distinct cert; rejection
  // runs in token mode by default.)
  const dedicatedCreds = { ...creds };
  if (config.authMode === 'token' || config.authMode === 'sso') {
    dedicatedCreds.token = `rejection-${creds.token || 'load'}`;
  }

  const headers = buildAuthHeaders(config.authMode, dedicatedCreds);
  const targets = buildTargets(config, headers);

  const raw = await runAttack({
    targets,
    rateSpec: `${totalRequests}/${durationSec}s`,
    durationSec,
    maxWorkers,
    timeoutMs: config.timeoutMs,
    vegetaBin,
  });
  const metrics = parseMetrics(raw);

  const meta = {
    workload: 'rejection-k8s',
    endpoint: config.endpoints.map((e) => e.path).join(','),
    authMode: config.authMode,
    revision: 'n/a',
    vegetaVersion: 'n/a',
    settings: {
      ratePerMinute: `${totalRequests}/${durationSec}s (burst)`,
      durationSec,
      maxWorkers,
      timeoutMs: config.timeoutMs,
      payloadSize: config.upstream.payloadSize,
    },
  };
  const paths = writeReport(metrics, meta, 'rejection');

  const got429 = Number(metrics.statusCodes['429'] || 0);
  if (got429 === 0) {
    throw new Error(
      `rejection workload observed no 429s — limit not enforced? status codes: ${JSON.stringify(metrics.statusCodes)}`,
    );
  }

  return { metrics, ...paths, rejected: got429 };
}
