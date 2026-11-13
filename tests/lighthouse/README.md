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

Pure helper logic (metric extraction/validation, median aggregation, report
assembly, sanitization) lives in `lib/` and is covered by Vitest unit tests.

## Layout

| Path                       | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `lighthouse.spec.js`       | Accessibility + Best Practices audits (unchanged thresholds) |
| `performance.spec.js`      | Reporting-only performance audits                            |
| `lib/metrics.js`           | Extract + validate the five metrics from a Lighthouse result |
| `lib/aggregate.js`         | Median / per-metric summary across samples                   |
| `lib/report.js`            | Metadata, per-sample & summary reports, report sanitization  |
| `lib/*.test.js`            | Vitest unit tests for the helpers                            |
| `fixtures/kubeconfig.yaml` | The cluster the audits connect to (git-ignored)              |

## Running locally

### 1. Unit tests (no cluster needed)

```bash
cd tests/lighthouse
npm install
npm run test:unit
```

### 2. Browser audits (need a running Busola + cluster)

Audits run against a **production build**, matching CI. Bring one up (from the
repo root — this mirrors `.github/scripts/setup_local_busola.sh`):

```bash
npm ci && npm run build
cp -r build backend/core-ui
(cd backend && npm run build && IS_DOCKER=true npm run start:prod &)   # serves http://localhost:3001
```

Provide the cluster the audits connect to:

```bash
k3d cluster create k3dCluster --agents 1 --wait
k3d kubeconfig get k3dCluster > tests/lighthouse/fixtures/kubeconfig.yaml
```

Then run the audits:

```bash
cd tests/lighthouse
npm ci && npx playwright install --with-deps
npm run test              # accessibility + best practices
npm run test:performance  # reporting-only performance
```

To point at a dev server (`http://localhost:8080`) instead of the production
backend, use the `:local` variants (`npm run test:local`,
`npm run test:performance:local`). Note performance numbers from a dev server
are not comparable to production — use production builds for any real reading.

### Sample count

Three samples per page are collected by default. Override with a positive
integer:

```bash
LIGHTHOUSE_SAMPLES=5 npm run test:performance
```

Invalid values (`0`, negatives, non-integers) fail immediately before any
audit runs.

## Fixtures & authentication

The performance suite connects the cluster **once** through the UI (upload
`fixtures/kubeconfig.yaml` → choose _Local storage_ → _Connect Cluster_). When
"Local storage" is chosen, Busola persists the cluster — including its
credentials — in two `localStorage` keys: `busola.clusters` and
`busola.current-cluster-name`. The suite snapshots those two keys after the
connect flow and re-injects them (via `page.addInitScript`) into a fresh,
isolated browser profile for **every** sample, so each sample measures the same
authenticated state. The connected cluster's real name (e.g. `k3d-k3dCluster`)
is read back from that snapshot and used to build the overview URL
(`/cluster/<name>/overview`) — it is never hard-coded.

Each sample runs serially in its own temporary profile directory with the HTTP
cache explicitly cleared (cold cache, preserved auth).

## Metrics

| Key                | Audit                           | Unit     |
| ------------------ | ------------------------------- | -------- |
| `fcp`              | First Contentful Paint          | ms       |
| `lcp`              | Largest Contentful Paint        | ms       |
| `tbt`              | Total Blocking Time             | ms       |
| `cls`              | Cumulative Layout Shift         | unitless |
| `performanceScore` | Lighthouse Performance category | 0–100    |

Audits use explicit desktop settings: `formFactor: desktop`, desktop
`screenEmulation`, and the Lighthouse desktop throttling preset
(`throttlingMethod: simulate`, 40 ms RTT, 10 Mbps, 1× CPU).

## Reports & CI artifacts

All performance reports are written to
`test-results/lighthouse-performance/` and uploaded by the PR Lighthouse CI
workflow as artifacts:

- `<page>-sample-<n>.html` — the native Lighthouse report for each sample.
- `<page>-sample-<n>.sample.json` — extracted metrics **plus metadata**:
  audited URL, revision, tool versions (lighthouse/playwright/node), settings.
- `summary.json` — the interpretation entry point: metadata plus, per page, all
  samples and their **median** for each metric.

`summary.json` is the file to read first. Example shape:

```jsonc
{
  "schema": "busola-lighthouse-summary",
  "revision": "<git sha or 'unknown'>",
  "toolVersions": { "lighthouse": "...", "playwright": "...", "node": "..." },
  "settings": { "formFactor": "desktop", "throttling": { ... }, "samples": 3, ... },
  "pages": [
    { "name": "clusters", "url": "...", "samples": [ ... ], "median": { "fcp": ..., "lcp": ..., "tbt": ..., "cls": ..., "performanceScore": ... } },
    { "name": "cluster-overview", "url": "...", "samples": [ ... ], "median": { ... } }
  ]
}
```

The native HTML report inherently shows the audited URL, Lighthouse version and
emulation/throttling settings; the full metadata set (including revision and
playwright/node versions) lives in the JSON reports and `summary.json`.

### Sanitisation

Credentials must never reach a CI artifact. This is enforced in three layers:

1. Every file under `test-results/lighthouse-performance/` is scrubbed of
   cluster credentials (kubeconfig token, client cert/key and CA data, and the
   serialized cluster state) — this runs in a `finally` block, so even a
   partial/failed run is sanitized before upload.
2. After scrubbing, the suite asserts no credential survived in any report
   file (`assertNoSecrets`); a redaction gap **fails the run** instead of
   leaking.
3. Playwright tracing is disabled (`trace: 'off'`) and the CI workflow uploads
   only the report directories — never the Playwright per-test output. A
   `trace.zip` is a compressed archive that string-based scrubbing cannot
   reach, so it is kept out of artifacts entirely rather than sanitized.

## Troubleshooting

| Symptom                                  | Likely cause / fix                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `invalid sample count` and no tests run  | `LIGHTHOUSE_SAMPLES` is not a positive integer.                                                                                                           |
| Audit hangs or `port 9222` errors        | A previous Chromium left the debug port open; the suite runs serially so only one profile uses 9222 at a time — kill stray `chrome`/`chromium` processes. |
| Overview audit times out at verification | Cluster content ("Nodes (N)") didn't load — the cluster is unreachable or still starting. Check the backend/cluster, not the audit.                       |
| `failed to capture cluster auth state`   | The connect-cluster flow didn't finish; usually a missing/invalid `fixtures/kubeconfig.yaml`.                                                             |
| Metrics fail with "invalid measurement"  | Lighthouse returned an errored/partial trace (often flakiness under load). Re-run; a genuinely broken audit is meant to fail.                             |

## Measurement limitations

- **CI-runner variance.** Shared CI runners add noise; treat single-run numbers
  as indicative, not exact. The median over samples reduces, but does not
  eliminate, this. This is why performance is reporting-only for now.
- **Simulated throttling** approximates a mid-tier desktop; it is not a real
  device and not directly comparable to field data.
- **Single-navigation audits.** Each audit is a cold load of one URL; it does
  not capture in-app navigation, warm-cache behaviour, or long sessions.
- **Dev vs. production.** The `:local` variants hit an unminified dev server and
  will report worse, non-comparable numbers. Only production builds are
  meaningful.
