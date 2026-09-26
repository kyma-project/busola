/// <reference types="cypress" />
//
// Dedicated diagnostic spec for the edit-cluster renderer OOM loop.
//
// This spec is INERT unless Cypress.env('LOOP_PROBE') is set (it is added to the
// specPattern permanently, but skips itself on normal runs). When armed it:
//   1. starts out-of-process CDP profiling (CPU + heap-allocation sampling +
//      Performance.getMetrics polling) via Cypress's built-in remote:debugger:protocol
//      channel — request/response is enough because Profiler.stop / HeapProfiler
//      getSamplingProfile / Performance.getMetrics all return their payload in the
//      command *response* (no event subscription, no extra npm dependency);
//   2. runs the edit-cluster rename flow in a tight AMPLIFIER loop to raise the per-job
//      hit rate (the loop reproduces ~1/25 naturally, never locally);
//   3. holds and polls (metrics + the in-page __loopProbe snapshot) so the loop has time
//      to ratchet RSS, checkpointing profiles periodically so a hard crash still leaves
//      usable data on disk.
//
// All artifacts land under cypress/loop-probe/ (carried out by the existing always()
// upload). See support/loop-probe.js and plugins/index.js.

import config from '../../config';

const PROBE_ON = !!Cypress.env('LOOP_PROBE');

const DESC = 'loop-probe amplifier description';
const TEMP_NAME = 'loop-probe-tmp';
const AMPLIFIER_ITERATIONS = Number(Cypress.env('LOOP_PROBE_ITERATIONS')) || 25;
const HOLD_SAMPLES = Number(Cypress.env('LOOP_PROBE_HOLD_SAMPLES')) || 180; // ~6 min @2s
const HOLD_INTERVAL_MS = 2000;
const HEAP_ABORT_MB = 3400; // near Chrome's ~3.8GB per-renderer cap
const CHECKPOINT_EVERY = 5; // dump a CPU/heap profile chunk every N amplifier iterations

// Thin wrapper around Cypress's CDP channel. Resolves with the CDP result object.
const cdp = (command, params = {}) =>
  Cypress.automation('remote:debugger:protocol', { command, params });

// Swallow CDP errors (target may have crashed) so we always fall through to cleanup.
const cdpSafe = (command, params) =>
  cdp(command, params).catch((e) => ({ __cdpError: String(e) }));

let originalName;
let checkpoint = 0;

const dumpCpuCheckpoint = () =>
  cy.then(() =>
    cdpSafe('Profiler.stop').then((res) => {
      if (res?.profile)
        cy.task('probeWriteProfile', {
          name: `cpu-${String(checkpoint).padStart(3, '0')}.cpuprofile`,
          data: res.profile,
        });
      checkpoint++;
      return cdpSafe('Profiler.start');
    }),
  );

const dumpHeapCheckpoint = (final) =>
  cy.then(() =>
    cdpSafe(
      final ? 'HeapProfiler.stopSampling' : 'HeapProfiler.getSamplingProfile',
    ).then((res) => {
      if (res?.profile)
        cy.task('probeWriteProfile', {
          name: final
            ? 'heap-final.heapprofile'
            : `heap-${String(checkpoint).padStart(3, '0')}.heapprofile`,
          data: res.profile,
        });
    }),
  );

const sampleMetrics = (tag) =>
  cy.then(() =>
    cdpSafe('Performance.getMetrics').then((res) => {
      const metrics = res?.metrics;
      cy.task('probeAppend', {
        file: 'cdp-metrics.jsonl',
        line: JSON.stringify({ ts: Date.now(), tag, metrics }),
      });
      // return JSHeapUsedSize in MB for the live-hold abort check
      const used = Array.isArray(metrics)
        ? metrics.find((m) => m.name === 'JSHeapUsedSize')?.value
        : undefined;
      return used ? Math.round(used / 1048576) : null;
    }),
  );

const snapshotInPage = (tag) =>
  cy.window({ log: false }).then((win) => {
    try {
      const snap = win.__loopProbe?.snapshot?.();
      if (snap)
        cy.task('probeAppend', {
          file: 'live-hold.jsonl',
          line: JSON.stringify({ tag, ...snap }),
        });
    } catch (e) {
      /* renderer may be pegged/crashed; ignore */
    }
  });

// One rename cycle mirroring tests/cluster/test-edit-cluster.spec.js.
const editCycle = (i) => {
  cy.visit(`${config.clusterAddress}/clusters`);
  cy.get('ui5-button[data-testid="edit"]', { timeout: 20000 }).click();
  cy.get('ui5-input[data-testid="cluster-description"]')
    .find('input')
    .click()
    .type(`${DESC} ${i}`);
  cy.get('ui5-input[data-testid="cluster-name"]')
    .first()
    .find('input')
    .type('{selectall}{backspace}')
    .type(`${TEMP_NAME}-${i}`);
  cy.contains('ui5-button', 'Update').click();
  cy.get('ui5-shellbar')
    .find('ui5-button#clusterSwitcherOpener')
    .should('be.visible');
  // rename back so the next iteration starts from a known name
  cy.visit(`${config.clusterAddress}/clusters`);
  cy.get('ui5-button[data-testid="edit"]', { timeout: 20000 }).click();
  cy.get('ui5-input[data-testid="cluster-name"]')
    .first()
    .find('input')
    .wait(300)
    .type('{selectall}{backspace}')
    .type(originalName);
  cy.contains('ui5-button', 'Update').click();
  cy.get('ui5-shellbar')
    .find('ui5-button#clusterSwitcherOpener')
    .should('be.visible');
};

(PROBE_ON ? context : context.skip)('edit-cluster loop probe', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.visit(`${config.clusterAddress}/clusters`);
    cy.get('ui5-table-cell')
      .find('ui5-link[design="Emphasized"]')
      .should('be.visible')
      .then((el) => (originalName = el.text()));
  });

  after(() => {
    // final profile dump — runs even after an assertion failure (best-effort if the
    // browser is still alive; periodic checkpoints cover a hard crash)
    dumpHeapCheckpoint(true);
    cy.then(() =>
      cdpSafe('Profiler.stop').then((res) => {
        if (res?.profile)
          cy.task('probeWriteProfile', {
            name: 'cpu-final.cpuprofile',
            data: res.profile,
          });
      }),
    );
  });

  it('arms CDP profiling', () => {
    cy.then(() => cdpSafe('Profiler.enable'));
    cy.then(() => cdpSafe('Profiler.setSamplingInterval', { interval: 500 }));
    cy.then(() => cdpSafe('Profiler.start'));
    cy.then(() => cdpSafe('HeapProfiler.enable'));
    cy.then(() =>
      cdpSafe('HeapProfiler.startSampling', { samplingInterval: 32768 }),
    );
    cy.then(() => cdpSafe('Performance.enable'));
    sampleMetrics('armed');
  });

  it('amplifies the edit-cluster rename flow', () => {
    for (let i = 0; i < AMPLIFIER_ITERATIONS; i++) {
      editCycle(i);
      sampleMetrics(`amp-${i}`);
      snapshotInPage(`amp-${i}`);
      if (i > 0 && i % CHECKPOINT_EVERY === 0) {
        dumpCpuCheckpoint();
        dumpHeapCheckpoint(false);
      }
    }
  });

  it('holds and observes while the loop ratchets', () => {
    const holdStep = (n) => {
      if (n <= 0) return;
      cy.wait(HOLD_INTERVAL_MS);
      snapshotInPage(`hold-${HOLD_SAMPLES - n}`);
      sampleMetrics(`hold-${HOLD_SAMPLES - n}`).then((usedMB) => {
        // checkpoint every ~30s of holding
        if (n % 15 === 0) {
          dumpCpuCheckpoint();
          dumpHeapCheckpoint(false);
        }
        if (usedMB && usedMB >= HEAP_ABORT_MB) {
          cy.task('probeAppend', {
            file: 'live-hold.jsonl',
            line: JSON.stringify({ tag: 'heap-abort', usedMB, ts: Date.now() }),
          });
          dumpCpuCheckpoint();
          dumpHeapCheckpoint(false);
          return; // stop holding; we've captured the ratchet near the cap
        }
        holdStep(n - 1);
      });
    };
    cy.then(() => holdStep(HOLD_SAMPLES));
  });
});
