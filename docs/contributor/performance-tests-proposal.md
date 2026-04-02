# Performance Tests Proposal

## Overview

This document proposes a performance testing strategy for Busola, covering both the **frontend** (React SPA) and the **backend** (Node.js/Express proxy). The goal is to catch performance regressions early in the development cycle and give the team measurable, automated signals on every pull request.

Busola already has Lighthouse audits (`tests/lighthouse/`) for accessibility and best-practices, and a `slowRequestLogger` middleware on the backend. This proposal builds on top of that foundation.

---

## Current State

| Area       | Tool                       | What is measured               | Gap                                                                     |
| ---------- | -------------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| Frontend   | Playwright + Lighthouse    | Accessibility, best-practices  | **Performance score, Core Web Vitals, and bundle size are not tracked** |
| Backend    | `slowRequestLogger` (Pino) | Requests > 4 000 ms at runtime | **No automated load / throughput / latency benchmarks**                 |
| Unit tests | Vitest                     | Correctness                    | No timing assertions                                                    |

---

## Frontend Performance Tests

### Proposed tool: Playwright + Lighthouse (extension of existing setup)

The existing `tests/lighthouse/lighthouse.spec.js` already boots a browser with a remote-debug port and calls `playAudit`. Extending it to capture **performance** metrics requires only adding the `performance` threshold to the `playAudit` calls and enabling additional Lighthouse categories.

#### What to measure

| Metric                         | Target     |
| ------------------------------ | ---------- |
| Lighthouse Performance score   | ≥ 70       |
| First Contentful Paint (FCP)   | ≤ 2 000 ms |
| Largest Contentful Paint (LCP) | ≤ 3 000 ms |
| Total Blocking Time (TBT)      | ≤ 300 ms   |
| Cumulative Layout Shift (CLS)  | ≤ 0.1      |
| Speed Index                    | ≤ 4 000 ms |

#### Proposed file: `tests/lighthouse/lighthouse.spec.js` (extended)

```js
await playAudit({
  page,
  port: 9222,
  thresholds: {
    performance: 70, // ← new
    accessibility: 80,
    'best-practices': 100,
  },
  reports: {
    formats: { html: true, json: true },
    directory: 'lighthouse-reports',
    name: `clusters-${Date.now()}`,
  },
});
```

Enabling `reports` lets us upload the HTML/JSON artifacts in CI so developers can inspect individual audits without re-running locally.

#### Bundle size tracking

Add a Vite build step that outputs `build/stats.json` via `rollup-plugin-visualizer` (already a common Vite plugin). A lightweight Node script then asserts that no individual chunk exceeds a set threshold:

```
tests/bundle-size/
├── bundle-size.test.js   # Vitest test reading build/stats.json
└── thresholds.json       # { "index": 600, "vendor": 1800 }  (kB)
```

This test runs in the existing `pull-unit-tests` workflow without extra infrastructure.

#### Proposed CI workflow changes (`pull-lighthouse.yml`)

- Upload `tests/lighthouse/lighthouse-reports/` as artifacts (already partially done for busola.log).
- Fail the job only when a threshold is breached, not on every Lighthouse warning (current behavior is already correct).
- Add a summary step that posts metric values as a PR comment using the Lighthouse JSON report.

---

## Backend Performance Tests

### Proposed tool: [autocannon](https://github.com/mcollina/autocannon)

`autocannon` is a lightweight Node.js HTTP benchmarking tool with no additional binary dependencies. It fits naturally in the existing npm/Node 24 stack and does not require a running Kubernetes cluster — the backend can be started against a mock kubeconfig.

#### Alternative considered: k6

k6 is a powerful load-testing tool with a rich scripting API (JavaScript), Grafana integration, and cloud execution. It is better suited when the team needs sustained, high-concurrency load scenarios or Grafana dashboards. The trade-off is that it requires an additional binary installation in CI.

**Recommendation**: Start with `autocannon` for PR-level micro-benchmarks; graduate to k6 if the team needs full load/soak tests in a dedicated environment.

#### What to measure

| Scenario                                   | Metric       | Target   |
| ------------------------------------------ | ------------ | -------- |
| `GET /backend/healthz` (health check)      | Requests/sec | ≥ 500    |
| `GET /backend/healthz`                     | p99 latency  | ≤ 20 ms  |
| `GET /backend/api/v1/namespaces` (proxied) | p99 latency  | ≤ 200 ms |
| `GET /backend/api/v1/namespaces`           | Error rate   | 0 %      |

#### Proposed directory structure

```
tests/performance/
├── package.json
├── backend/
│   ├── benchmark.js          # autocannon runner + assertion logic
│   └── scenarios/
│       ├── health.js         # health endpoint scenario
│       └── k8s-proxy.js      # proxied Kubernetes API scenario
└── README.md
```

#### Proposed `benchmark.js` skeleton

```js
import autocannon from 'autocannon';

const BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
const DURATION_SECONDS = 10;
const CONNECTIONS = 10;

async function run(scenario) {
  const result = await autocannon({
    url: `${BASE_URL}${scenario.path}`,
    connections: CONNECTIONS,
    duration: DURATION_SECONDS,
    headers: scenario.headers ?? {},
    method: scenario.method ?? 'GET',
  });

  const errors = result.errors + result.timeouts;
  const p99 = result.latency.p99;
  const rps = result.requests.average;

  console.log(
    `[${scenario.name}] RPS: ${rps} | p99: ${p99}ms | errors: ${errors}`,
  );

  if (errors > 0)
    throw new Error(`${scenario.name}: non-zero error count (${errors})`);
  if (scenario.minRps && rps < scenario.minRps)
    throw new Error(
      `${scenario.name}: RPS ${rps} below threshold ${scenario.minRps}`,
    );
  if (scenario.maxP99 && p99 > scenario.maxP99)
    throw new Error(
      `${scenario.name}: p99 ${p99}ms exceeds threshold ${scenario.maxP99}ms`,
    );
}

// scenarios are imported and run sequentially
import { healthScenario } from './scenarios/health.js';
await run(healthScenario);
```

#### Proposed CI workflow: `.github/workflows/pull-backend-performance.yml`

```yaml
name: PR Backend Performance Test

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    paths:
      - 'backend/**'
      - 'tests/performance/**'
      - '.github/workflows/pull-backend-performance.yml'

jobs:
  backend-perf:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Install backend dependencies
        run: npm ci
        working-directory: backend
      - name: Start backend (mock mode)
        run: node index.js &
        working-directory: backend
        env:
          KUBECONFIG: /dev/null
          PORT: 3001
      - name: Wait for backend to be ready
        run: npx wait-on http://localhost:3001/healthz --timeout 30000
      - name: Run performance benchmarks
        run: |
          cd tests/performance
          npm ci
          node backend/benchmark.js
      - name: Upload benchmark results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: backend-perf-results
          path: tests/performance/results/
          retention-days: 30
```

---

## Vitest Benchmark Tests (unit-level)

For pure algorithmic correctness and regression prevention on hot paths (e.g., resource list filtering, label selector parsing), Vitest has a built-in `bench` API:

```ts
// src/shared/utils/__benchmarks__/labelSelector.bench.ts
import { bench, describe } from 'vitest';
import { parseLabelSelector } from '../labelSelector';

describe('parseLabelSelector', () => {
  bench('simple selector', () => {
    parseLabelSelector('app=busola,env=prod');
  });
  bench('complex selector with many labels', () => {
    parseLabelSelector('app=busola,env=prod,tier=frontend,version=v1.2.3');
  });
});
```

Run with:

```bash
npx vitest bench
```

These benchmarks live alongside unit tests and run in the `pull-unit-tests` workflow with a separate `vitest bench` step. They do not assert thresholds by default but produce a report that can be compared across PRs using [`vitest-benchmark-reporter`](https://github.com/nicolo-ribaudo/vitest-benchmark-reporter) or similar.

---

## Implementation Plan

### Phase 1 — Extend Lighthouse (low effort, high value)

1. Add `performance: 70` threshold and `reports` output to `lighthouse.spec.js`.
2. Upload Lighthouse HTML/JSON artifacts in `pull-lighthouse.yml`.
3. Add a PR comment step summarising Core Web Vitals from the JSON report.

### Phase 2 — Bundle size guard (low effort)

1. Add `rollup-plugin-visualizer` to Vite config.
2. Create `tests/bundle-size/` with a Vitest test and `thresholds.json`.
3. Add bundle size check to `pull-unit-tests.yml`.

### Phase 3 — Backend benchmarks (medium effort)

1. Create `tests/performance/` with `autocannon`-based scenarios.
2. Create `.github/workflows/pull-backend-performance.yml`.
3. Define baseline thresholds from a clean `main` run.

### Phase 4 — Vitest `bench` for hot paths (medium effort)

1. Identify hot-path utility functions (label selectors, resource filtering).
2. Add `*.bench.ts` files alongside unit tests.
3. Add `vitest bench` step to `pull-unit-tests.yml`.

---

## Open Questions

1. **Thresholds**: Initial values above are informed guesses. They should be baselined from a `main` branch run before being enforced as PR gates.
2. **k6 vs autocannon**: If the team wants Grafana dashboards or long-running soak tests, k6 is the better long-term investment. Autocannon is lighter for PR-level gates.
3. **Mock kubeconfig**: The backend benchmarks need the backend to start in a degraded/mock mode (no real cluster). Should a dedicated `NODE_ENV=benchmark` mode be added that skips cluster connectivity checks?
4. **Performance budget ownership**: Who owns the thresholds? Recommend a `CODEOWNERS` entry on `tests/performance/thresholds.json` and `tests/bundle-size/thresholds.json`.
5. **Lighthouse flakiness**: Lighthouse scores can vary by ±5 points across runs. Setting thresholds conservatively (with ~10 % buffer) and running two consecutive audits (taking the higher score) would reduce false failures.
