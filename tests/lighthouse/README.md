# Busola Lighthouse tests

This suite runs two kinds of Lighthouse checks against a production build of
Busola connected to a real (k3d) cluster:

- **Accessibility & Best Practices** (`lighthouse.spec.js`) — threshold-gated;
  a regression below a threshold fails the build.
- **Performance** (`performance.spec.js`) — **reporting-only**. It collects
  FCP, LCP, TBT, CLS and the Performance score for `/clusters` and the
  connected cluster overview, writes per-sample and median reports, and fails
  only on a broken audit or an invalid/missing measurement — never on a slow
  score. Performance-budget gates are intentionally deferred.

## Layout

| Path                       | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `lighthouse.spec.js`       | Accessibility + Best Practices audits (unchanged thresholds) |
| `performance.spec.js`      | Reporting-only performance audits                            |
| `lib/metrics.js`           | Extract + validate the five metrics from a Lighthouse result |
| `lib/aggregate.js`         | Median / per-metric summary across samples                   |
| `lib/report.js`            | Metadata, per-sample & summary reports, report sanitization  |
| `fixtures/kubeconfig.yaml` | The cluster the audits connect to (git-ignored)              |

## Running locally

### Browser audits (need a running Busola + cluster)

Audits run against a **production build**, matching CI. Bring one up (from the
repo root — this mirrors `.github/scripts/setup_local_busola.sh`):

```bash
npm ci && npm run build
cp -r build backend/core-ui
(cd backend && npm run build && IS_DOCKER=true npm run start:prod &)   # serves http://localhost:3001
```

# Performance tests

Measures application-readiness and interaction-responsiveness timings for three
user journeys against a production build:

1. **Cluster overview readiness** — navigation + async API + stats/charts render.
2. **Resource list** — `load`, `search`, and `sort` on a large (1000-item) list,
   each measured separately.
3. **Monaco YAML editor readiness** — editor + worker initialisation (no save).

Each metric is measured in-page from an injected start timestamp to a polled
readiness predicate that checks real content — never fixed sleeps or
`networkidle`. The Kubernetes API responses are mocked via Playwright route
interception so dataset sizes are exact and repeatable; k3d and the production
build still serve the app and the cluster-connection flow.

## Running on CI

Runs automatically in the PR Lighthouse workflow (`.github/workflows/pull-lighthouse.yml`):

```bash
npm run test:performance
```

## Running locally

Copy your kubeconfig to `fixtures/kubeconfig.yaml`, start Busola, then:

```bash
npm run test:performance:local                  # 3 samples per metric (default)
PERF_SAMPLES=5 npm run test:performance:local    # configurable sample count
npm run test:performance:trace                   # heavy tracing (debugging only)
```

Tracing perturbs timings, so it lives in a separate config/command and is never
used for measurement.

## Reading the report

`npm run test:performance` writes to `test-results/performance/`:

- `performance.json` — per-sample timings, medians, dataset sizes, and the build
  version (git sha) + browser version.
- `summary.md` — a median table by scenario × metric × cold vs warm.

**Cold** is a fresh browser context (empty HTTP cache, fresh JS runtime) with
cluster config pre-seeded in localStorage; the measured navigation is the first
ever visit to that URL. **Warm** is a repeat in the same context (HTTP cache
primed, React still running) using in-app navigation — a sidebar click handled
by React Router — so no JS context is torn down. They are reported as separate
series and never averaged together.

A failed scenario, or any missing/invalid (`NaN`/`≤ 0`) measurement, fails the
run. Timing budgets are intentionally not enforced yet — these tests establish
baselines and catch gross regressions, not fixed thresholds.

Artifacts exclude credentials: `fixtures/kubeconfig.yaml` is never under an
uploaded path, and the report writer scrubs any `token`/`authorization`/
`kubeconfig` keys before writing.
