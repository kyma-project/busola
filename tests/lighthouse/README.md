# Busola Lighthouse regression tests

## Running on CI

```bash
npm run test
```

## Running locally

Make sure your kubeconfig is copied as `fixtures/kubeconfig.yaml`.

```bash
npm run test:local
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

The run writes to `test-results/performance/`:

- `performance.json` — per-sample timings, medians, dataset sizes, and the build
  version (git sha) + browser version.
- `summary.md` — a median table by scenario × metric × cold vs warm.

**Cold** is a fresh session (cleared storage/cache, first navigation); **warm**
is a repeat in the same primed session. They are reported as separate series and
never averaged together.

A failed scenario, or any missing/invalid (`NaN`/`≤ 0`) measurement, fails the
run. Timing budgets are intentionally not enforced yet — these tests establish
baselines and catch gross regressions, not fixed thresholds.

Artifacts exclude credentials: `fixtures/kubeconfig.yaml` is never under an
uploaded path, and the report writer scrubs any `token`/`authorization`/
`kubeconfig` keys before writing.
