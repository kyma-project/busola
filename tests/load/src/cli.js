import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js';
import { validate } from '../config/caps.js';
import { resolveCreds } from './creds.js';
import { buildAuthHeaders } from './auth.js';
import { preflight } from './preflight.js';
import { run } from './run.js';
import { runRejection } from './rejection.js';
import { startUpstream } from '../upstream/server.js';

const here = path.dirname(fileURLToPath(import.meta.url));

function resolveVegetaBin() {
  const local = path.join(here, '..', '.bin', 'vegeta');
  return fs.existsSync(local) ? local : 'vegeta';
}

function arg(name, def) {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.split('=').slice(1).join('=') : def;
}

const hasFlag = (name) => process.argv.includes(`--${name}`);

// Bounded env overrides (still re-validated against caps).
function applyEnvOverrides(config) {
  const map = [
    ['ratePerMinute', 'LOAD_RATE_PER_MINUTE'],
    ['durationSec', 'LOAD_DURATION_SEC'],
    ['warmupSec', 'LOAD_WARMUP_SEC'],
    ['maxWorkers', 'LOAD_MAX_WORKERS'],
    ['timeoutMs', 'LOAD_TIMEOUT_MS'],
  ];
  for (const [field, env] of map) {
    if (process.env[env] !== undefined)
      config[field] = Number(process.env[env]);
  }
  validate(config);
}

async function main() {
  const command = process.argv[2];
  const workload = arg('workload', process.env.LOAD_WORKLOAD || 'list-small');
  const configPath = path.join(here, '..', 'workloads', `${workload}.json`);
  const config = loadConfig(configPath);
  applyEnvOverrides(config);

  const vegetaBin = resolveVegetaBin();
  const usingSynthetic = !process.env.LOAD_CLUSTER_URL;

  if (hasFlag('require-cluster') && usingSynthetic) {
    throw new Error(
      'test:local requires a real cluster — set LOAD_CLUSTER_URL (and LOAD_K8S_TOKEN / LOAD_CA_FILE) from your kubeconfig',
    );
  }

  // For synthetic runs the CLI owns the controlled upstream lifecycle.
  let upstream = null;
  if (usingSynthetic) {
    upstream = await startUpstream({
      port: config.upstream.port,
      payloadSize: config.upstream.payloadSize,
      latencyMs: Number(process.env.LOAD_UPSTREAM_LATENCY_MS) || 0,
    });
  }

  try {
    const creds = resolveCreds(config);
    if (command === 'preflight') {
      const headers = buildAuthHeaders(config.authMode, creds);
      await preflight(config, headers);
      console.log('preflight: all endpoints OK');
    } else if (command === 'test') {
      const res = await run(config, creds, { vegetaBin, workload });
      console.log(`measured report: ${res.measured.jsonPath}`);
      console.log(`warmup report:   ${res.warmup.jsonPath}`);
    } else if (command === 'rejection') {
      const res = await runRejection(config, creds, { vegetaBin });
      console.log(`rejection report: ${res.jsonPath} (429s: ${res.rejected})`);
    } else {
      throw new Error(
        `unknown command: ${command} (use preflight|test|rejection)`,
      );
    }
  } finally {
    if (upstream) await upstream.close();
  }
}

main().catch((e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});
