import { spawn } from 'child_process';

/**
 * Run a Vegeta attack against the given targets and return the raw JSON
 * report string (`vegeta attack | vegeta report -type=json`).
 *
 * Rejects if Vegeta cannot be spawned, the report process exits non-zero, or
 * it produces empty output — an empty/failed run must never look like a
 * successful measurement.
 *
 * @param {object} opts
 * @param {object[]} opts.targets Vegeta JSON targets (Task 4 buildTargets)
 * @param {number} [opts.ratePerMinute] used as "<n>/1m" unless rateSpec is given
 * @param {string} [opts.rateSpec] explicit Vegeta rate string (e.g. "2500/5s");
 *   overrides ratePerMinute. Used by the rejection workload to exceed the cap.
 * @param {number} opts.durationSec
 * @param {number} opts.maxWorkers
 * @param {number} opts.timeoutMs
 * @param {string} [opts.vegetaBin] path to the vegeta binary (default: "vegeta")
 * @returns {Promise<string>} raw JSON report
 */
export function runAttack({
  targets,
  ratePerMinute,
  rateSpec,
  durationSec,
  maxWorkers,
  timeoutMs,
  vegetaBin = 'vegeta',
}) {
  return new Promise((resolve, reject) => {
    const attack = spawn(vegetaBin, [
      'attack',
      `-rate=${rateSpec || `${ratePerMinute}/1m`}`,
      `-duration=${durationSec}s`,
      `-max-workers=${maxWorkers}`,
      `-timeout=${timeoutMs}ms`,
      '-format=json',
    ]);
    const report = spawn(vegetaBin, ['report', '-type=json']);

    let out = '';
    let err = '';
    let settled = false;
    let attackClosed = false;
    let attackCode = null;
    let reportOut = null;
    let reportDone = false;

    const fail = (e) => {
      if (settled) return;
      settled = true;
      reject(e);
    };
    const maybeSettle = () => {
      if (settled || !reportDone || !attackClosed) return;
      if (attackCode !== 0) {
        return fail(
          new Error(`vegeta attack exited ${attackCode}: ${err.trim()}`),
        );
      }
      settled = true;
      resolve(reportOut);
    };

    attack.on('error', (e) =>
      fail(new Error(`failed to spawn vegeta attack: ${e.message}`)),
    );
    report.on('error', (e) =>
      fail(new Error(`failed to spawn vegeta report: ${e.message}`)),
    );
    // A broken pipe between attack and report must not be swallowed.
    attack.stdout.on('error', (e) =>
      fail(new Error(`vegeta attack stdout error: ${e.message}`)),
    );
    attack.stderr.on('data', (d) => (err += d));
    report.stderr.on('data', (d) => (err += d));
    report.stdout.on('data', (d) => (out += d));

    attack.stdout.pipe(report.stdin);

    attack.on('close', (code) => {
      attackCode = code;
      attackClosed = true;
      maybeSettle();
    });
    report.on('close', (code) => {
      if (settled) return;
      if (code !== 0) {
        return fail(new Error(`vegeta report exited ${code}: ${err.trim()}`));
      }
      if (!out.trim()) {
        return fail(new Error(`vegeta produced empty output: ${err.trim()}`));
      }
      reportOut = out;
      reportDone = true;
      maybeSettle();
    });

    attack.stdin.write(targets.map((t) => JSON.stringify(t)).join('\n') + '\n');
    attack.stdin.end();
  });
}
