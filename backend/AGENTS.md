# Backend Agent Instructions

This file provides backend-specific guidance for agents working in `backend/`. For project-wide instructions see the root [`AGENTS.md`](../AGENTS.md).

## Architecture

### Backend Proxy

`index.js` sets up the Express middleware chain: `express.raw()` (body parsing) → (optional gzip) → (dev-only CORS) → pino logger → slow request logger → routes. The `/proxy` route handles external HTTPS proxying with rate limiting. Kubernetes API requests are handled separately by the `/backend` route via `kubernetes/handler.js`. Special routes include `/backend/ai-chat/` (streaming AI companion), `/backend/modules` (community modules), and `/backend/kubeconfig`.

### Config and Feature Flags

`config.js` merges feature flags from three YAML sources. The intended order (highest priority last) is:

1. `settings/defaultConfig.yaml` (base defaults)
2. `config/config.yaml` (when the file exists — in production mounted from a Kubernetes ConfigMap)
3. `environments/{ENVIRONMENT}/config.yaml` (when `ENVIRONMENT` env var is set; should win over all)

Note: the current code applies env config before config.yaml (steps 2 and 3 are swapped), which is a known bug.

Feature flags are consumed in the backend by accessing the loaded config directly:

```js
const config = require('./config.js');
const gzipEnabled = config.features?.GZIP?.isEnabled;
```

Backend-only flags (cannot be overridden via the cluster ConfigMap): `GZIP` (response compression), `ALLOW_PRIVATE_IPS` (disables SSRF protection for private IPs — only for trusted dev environments), `KYMA_COMPANION` (configures the Kyma Companion API location).

There is also a separate `public/defaultConfig.yaml` that configures frontend storage defaults (e.g. `sessionStorage` vs `localStorage`). This is distinct from the backend config and is patched by the Dockerfile via `yq`.

## Testing Conventions

- Backend tests: `**/*.test.js` next to the source file (Vitest, Node environment).

```bash
npm test   # run from the backend/ directory
```

## Key Files

| File                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `index.js`              | Express app and middleware chain                 |
| `config.js`             | Feature flag / config loader (3-source YAML merge) |
| `kubernetes/handler.js` | Kubernetes API handler                           |
| `settings/defaultConfig.yaml` | Base feature flag definitions              |
