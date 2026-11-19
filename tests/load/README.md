# Busola backend load tests (Vegeta)

Repeatable, bounded HTTP load tests for the Busola backend's Kubernetes
proxy (`/backend/...`), driven by [Vegeta](https://github.com/tsenart/vegeta).
Tests run against the **real production backend** (`start:prod`) and a
**controlled Kubernetes-shaped upstream** so measurements are reproducible and
proxy overhead can be told apart from Kubernetes API latency.

Results are **reporting-only** (no performance pass/fail gates). But an
invalid run — bad config, empty results, unexpected status codes, timeouts, or
transport failures — **fails execution** and is never reported as a successful
baseline.

## Setup

- **Node 26.x / npm 11.x** (same as the repo).
- **Vegeta** on `PATH`, or a local binary at `tests/load/.bin/vegeta`. Pinned
  version: **v12.12.0**.

  ```bash
  cd tests/load && mkdir -p .bin
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m); case "$ARCH" in arm64|aarch64) ARCH=arm64;; x86_64) ARCH=amd64;; esac
  curl -sSL "https://github.com/tsenart/vegeta/releases/download/v12.12.0/vegeta_12.12.0_${OS}_${ARCH}.tar.gz" \
    | tar -xz -C .bin vegeta
  ```

- **openssl** (used once to generate the self-signed cert for the HTTPS
  upstream, cached under the git-ignored `.certs/`).

The backend must be running and reachable at `backendUrl` (default
`http://localhost:3001`). Because the controlled upstream listens on
`127.0.0.1`, start the backend with `ALLOW_PRIVATE_IPS=true` (a
deployer-only env var; committed defaults are unchanged):

```bash
# from repo root, mirrors .github/scripts/setup_local_busola.sh plus the flag
export ALLOW_PRIVATE_IPS=true
.github/scripts/setup_local_busola.sh    # builds + starts start:prod on :3001
```

## Execution

All commands run from `tests/load/`. For synthetic-upstream runs the CLI
starts and stops the controlled upstream itself — you only need the backend up.

```bash
npm run preflight                  # status + shape check for every endpoint
npm test                           # warm-up + measured run (synthetic upstream)
npm run rejection                  # K8s 2000/min rejection workload (isolated)
npm run test:local                 # measured run against a real cluster (k3d)
npm run upstream                   # start the controlled upstream standalone
```

Pick the workload with `--workload=<name>` or `LOAD_WORKLOAD=<name>`
(default `list-small`). Workloads: `list-{small,medium,large}`,
`detail-{small,medium,large}`.

```bash
npm test -- --workload=list-large
LOAD_WORKLOAD=detail-medium npm test
```

### Bounded settings

Defaults live in `config/default.json`; per-workload files in `workloads/`
override payload size and endpoints. Every value is validated against the hard
caps in `config/caps.js` (`ratePerMinute ≤ 1800`, `durationSec ≤ 120`,
`warmupSec ≤ 30`, `maxWorkers ≤ 200`, `timeoutMs ≤ 30000`). Out-of-bounds
config aborts before any traffic.

Override at runtime (still re-validated against the caps):

| Env var                    | Meaning                                     |
| -------------------------- | ------------------------------------------- |
| `LOAD_RATE_PER_MINUTE`     | request rate (kept under 2000/min)          |
| `LOAD_DURATION_SEC`        | measured phase length                       |
| `LOAD_WARMUP_SEC`          | warm-up phase length                        |
| `LOAD_MAX_WORKERS`         | concurrency cap                             |
| `LOAD_TIMEOUT_MS`          | per-request timeout                         |
| `LOAD_UPSTREAM_LATENCY_MS` | latency injected by the controlled upstream |

## Authentication

Reproduces Busola's proxy contract. Modes (`authMode` in config):

- **token** — `x-k8s-authorization: Bearer <token>` + base64 CA.
- **cert** — base64 `x-client-certificate-data` / `x-client-key-data` + CA
  (mTLS; the controlled upstream serves HTTPS so this path is really exercised).
- **sso** — token headers **plus** `Authorization: Bearer <sso-jwt>` (validated
  by the backend's JWT check when enabled).

Credentials come from env vars / files, never committed. For synthetic runs a
placeholder token is enough (the upstream does not validate auth). For a real
cluster:

| Env var                                          | Meaning                                                   |
| ------------------------------------------------ | --------------------------------------------------------- |
| `LOAD_CLUSTER_URL`                               | real API server URL (switches off the synthetic upstream) |
| `LOAD_K8S_TOKEN`                                 | bearer token (token/sso modes)                            |
| `LOAD_CA_FILE`                                   | PEM CA file                                               |
| `LOAD_CLIENT_CERT_FILE` / `LOAD_CLIENT_KEY_FILE` | client cert/key (cert mode)                               |
| `LOAD_SSO_JWT`                                   | SSO JWT (sso mode)                                        |

### Deferred: SSO 300/min rejection test

The SSO 300/min-per-subject limiter only exists when `JWT_CHECK_CONFIG` is
enabled, and `JWT_CHECK_BYPASS=true` disables both the JWT check **and** the
limiter together — so a real SSO 429 can only be produced with a valid RS256
JWT. A follow-up would stand up a mock JWKS issuer + RS256 signer and a full
`JWT_CHECK_CONFIG` (issuer/jwksUri/non-empty clientId), then drive >300/min for
one subject. This iteration ships SSO _headers_ and keeps SSO measured traffic
under 300/min, but not the SSO rejection test.

## Reports

Written to the git-ignored `reports/` directory, two files per phase:

- `reports/<workload>-<mode>-<timestamp>.warmup.{json,txt}` — warm-up, reported
  separately and never merged into the baseline.
- `reports/<workload>-<mode>-<timestamp>.measured.{json,txt}` — the baseline.
- `reports/rejection-k8s-<mode>-<timestamp>.rejection.{json,txt}` — rejection
  workload, isolated from baselines.

Each report carries metrics and run metadata (workload, endpoint, auth mode,
app revision, Vegeta version, execution settings) and **no secrets or response
bodies**. Latency fields: p50/p95/p99/mean/max in **milliseconds**; requested
vs achieved throughput; request count; status-code histogram; errors; timeouts.

## Troubleshooting

- **`preflight ... got 400`** — the path isn't whitelisted by the backend
  (`/api`, `/apis`, …) or the request method isn't GET.
- **`got 502`** — the backend couldn't reach the upstream. Check the upstream
  is running and that the backend trusts its cert (synthetic runs pass the
  self-signed cert as base64 CA automatically).
- **All requests fail with a private-IP error** — start the backend with
  `ALLOW_PRIVATE_IPS=true`.
- **Rejection workload sees no 429s** — the limiter counts per credential in a
  60s window; make sure the burst uses one credential and exceeds 2000.
- **`failed to spawn vegeta`** — install Vegeta (see Setup) or put it on `PATH`.
- **TLS errors from the upstream** — delete `.certs/` to regenerate the
  self-signed cert.
