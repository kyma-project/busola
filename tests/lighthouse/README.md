# Busola Lighthouse tests

This directory contains two independent performance test suites that run
against a production build of Busola connected to a real (k3d) cluster.

## Suite 1 — Lighthouse audits (`lighthouse.spec.js` + `performance.spec.js`)

Runs Chrome via Playwright, drives Lighthouse, and reports structured scores.

| Check                          | File                  | CI behaviour                                   |
| ------------------------------ | --------------------- | ---------------------------------------------- |
| Accessibility & Best Practices | `lighthouse.spec.js`  | Threshold-gated — a regression fails the build |
| Performance audits             | `performance.spec.js` | **Reporting-only** — never gates the build     |

The performance audit collects FCP, LCP, TBT, CLS, and Performance score for
`/clusters` and the connected cluster overview. It writes per-sample JSON
reports and a median summary to `test-results/lighthouse-performance/`, then
fails only if an audit errors or a measurement is missing/invalid.

## Suite 2 — User-flow performance measurements (`performance/`)

Measures application-readiness and interaction-responsiveness timings for three
user journeys against a production build:

1. **Cluster overview readiness** — navigation + async API + stats/charts render.
2. **Resource list** — `load`, `search`, and `sort` on a large (1 000-item) list,
   each measured separately.
3. **Monaco YAML editor readiness** — editor + worker initialisation (no save).

Each metric is measured in-page from an injected start timestamp to a polled
readiness predicate that checks real content — never fixed sleeps or
`networkidle`. The Kubernetes API responses are mocked via Playwright route
interception so dataset sizes are exact and repeatable; k3d and the production
build still serve the app and the cluster-connection flow.

Results are written to `test-results/performance/`.

## Layout

| Path                          | Purpose                                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| `lighthouse.spec.js`          | Accessibility + Best Practices audits (threshold-gated)             |
| `performance.spec.js`         | Reporting-only Lighthouse performance audits                        |
| `lib/metrics.js`              | Extract + validate the five Lighthouse metrics from an audit result |
| `lib/aggregate.js`            | Median / per-metric summary across samples                          |
| `lib/report.js`               | Metadata, per-sample & summary reports, report sanitization         |
| `performance/scenarios/`      | User-flow performance scenarios (Suite 2)                           |
| `performance/helpers.spec.js` | Shared fixtures and helpers for Suite 2                             |
| `fixtures/kubeconfig.yaml`    | The cluster both suites connect to (git-ignored)                    |

This suite runs two kinds of Lighthouse checks against a production build of
Busola connected to a real (k3d) cluster:

Both suites run in `.github/workflows/pull-lighthouse.yml`:

- **Suite 1 (Lighthouse audits):** `npm run test` — gating step, 10 min timeout.
  Performance audits run together with user-flow tests via `npm run test:performance`
  in a separate non-gating step (`continue-on-error: true`).
- **Suite 2 (user-flow):** `npm run test:performance` — same non-gating step.

## Running locally

### Suite 1 — Lighthouse audits (need a running Busola + cluster)

Audits run against a **production build**, matching CI. Bring one up (from the
repo root — this mirrors `.github/scripts/setup_local_busola.sh`):

```bash
npm ci && npm run build
cp -r build backend/core-ui
(cd backend && npm run build && IS_DOCKER=true npm run start:prod &)   # serves http://localhost:3001
```

Copy your kubeconfig:

```bash
cp ~/.kube/config tests/lighthouse/fixtures/kubeconfig.yaml
cd tests/lighthouse && npm ci
```

Run all Lighthouse audits (accessibility + performance):

```bash
npm run test:local                            # accessibility + best-practices only
LIGHTHOUSE_SAMPLES=2 npm run test:performance:local  # Lighthouse performance audits (default 3 samples)
```

### Suite 2 — User-flow performance measurements

```bash
cd tests/lighthouse
npm run test:performance:local                  # runs both suites (Lighthouse perf + user-flow)
PERF_SAMPLES=5 npm run test:performance:local   # configurable sample count for user-flow scenarios
npm run test:performance:trace                  # heavy tracing for user-flow (debugging only — perturbs timings)
```

## Reading the reports

**Lighthouse performance** (`test-results/lighthouse-performance/`):

- `<page>-sample-N.sample.json` — per-sample metrics (FCP, LCP, TBT, CLS, score)
- `summary.json` — median table across all samples for both audited pages
- `<page>-sample-N.html` — full Lighthouse HTML report for each sample

**User-flow performance** (`test-results/performance/`):

- `performance.json` — per-sample timings, medians, dataset sizes, and the build
  version (git sha) + browser version
- `summary.md` — a median table by scenario × metric × cold vs warm

**Cold** is a fresh browser context (empty HTTP cache, fresh JS runtime) with
cluster config pre-seeded in localStorage; the measured navigation is the first
ever visit to that URL. **Warm** is a repeat in the same context (HTTP cache
primed, React still running) using in-app navigation — a sidebar click handled
by React Router — so no JS context is torn down. They are reported as separate
series and never averaged together.

A failed scenario, or any missing/invalid (`NaN`/`≤ 0`) measurement, fails the
run. Timing budgets are intentionally not enforced yet — these tests establish
baselines and catch gross regressions, not fixed thresholds.

## Credentials and security

`fixtures/kubeconfig.yaml` is git-ignored and never under an uploaded artifact
path. The Lighthouse performance audit scrubs any credential values extracted
from the kubeconfig (tokens, certificate data) from every report file before
upload, and fails the run if any credential survives redaction.

Tracing is disabled in all measurement configs (`trace: 'off'`) to prevent
network headers and injected localStorage values (which include the cluster
kubeconfig and bearer token) from being captured in trace archives that would
otherwise be uploaded as CI artifacts.
