# Gardener "paste a gardenlogin kubeconfig & connect" — design (POC)

- **Status:** approved design, POC scope
- **Date:** 2026-10-07
- **Epic:** kyma-project/busola#5339 (Revive and modernize Gardener login); research #5340
- **Author:** (busola)

## Goal

Let a user paste the **gardenlogin shoot kubeconfig** they download from the Gardener
dashboard into Busola's **Add Cluster** wizard, click through, and get connected to that
shoot — no CLI, no manual kubeconfig assembly.

A gardenlogin kubeconfig is a _pointer_, not a credential: its user block is
`exec: kubectl-gardenlogin get-client-certificate` and it carries a cluster `extension`
with `shootRef` + `gardenClusterIdentity`. The browser cannot run that plugin, and the file
holds no garden-cluster credentials. So Busola must do what the plugin does: reach the
**garden cluster**, authenticate the user, and `POST AdminKubeconfigRequest` to mint a
client-cert admin kubeconfig for that one shoot, then connect it.

## Scope (POC)

- Add the paste-a-gardenlogin-shoot flow to the existing Add Cluster wizard.
- Garden resolution = **prompt the user to paste their garden kubeconfig** (no admin map).
- Single shoot, taken from `shootRef` on the `current-context` cluster.
- **Coexist** with the dormant garden-wide `/gardener-login` flow (left as-is, still
  disabled); the two share one `AdminKubeconfigRequest` helper.

### Non-goals (deferred)

- Admin-configured landscape map (`gardenClusterIdentity → garden URL + OIDC client`).
  This is the future home for any per-landscape redirect-URI / OIDC-client registration.
- Replacing/removing the dormant garden-wide flow (planned "later" per product).
- Full Cypress integration suite required by #5340 DoD.
- `viewerkubeconfig` / read-only mode.

## Flow

1. **Paste** kubeconfig — existing `KubeconfigUpload` step, unchanged.
2. **Detect** gardenlogin. Match **both** emitted forms (confirmed against gardener/gardenlogin):
   - `exec.command === 'kubectl-gardenlogin'` (the form in the sample file), **or**
   - `exec.command === 'kubectl'` with `exec.args` containing `'gardenlogin'` (the canonical
     dashboard-issued form, e.g. args `['gardenlogin', 'get-client-certificate']`).
     Resolve the `current-context` → its cluster → `extensions[].extension.shootRef`
     (`{namespace, name}`) + `gardenClusterIdentity`. If a gardenlogin command is present but no
     `shootRef` extension is found, show "unsupported gardenlogin kubeconfig" and stop.
3. **Garden step** (new): "Gardener shoot `<name>` (landscape `<identity>`) — paste your
   garden kubeconfig to connect." Normal (non-gardenlogin) kubeconfigs skip this entirely.
4. **Authenticate to the garden** using the pasted garden kubeconfig's first user —
   static `token` if present, else OIDC via `parseOIDCparams` → `createUserManager` →
   `signinRedirect` (identical branching to today's `GardenerLogin.tsx`). Yields a garden
   bearer token.
5. **Mint** the shoot kubeconfig — shared helper
   `requestAdminKubeconfig({ gardenServer, token, namespace, shootName })` POSTs
   `authentication.gardener.cloud/v1alpha1` `AdminKubeconfigRequest` to
   `…/apis/core.gardener.cloud/v1beta1/namespaces/<namespace>/shoots/<shootName>/adminkubeconfig`,
   decodes `status.kubeconfig`. We set `spec.expirationSeconds` explicitly (gardenlogin's own
   default is only 900s/15min) and read back `status.expirationTimestamp` as the source of truth.
6. **Connect** — the minted kubeconfig may contain **multiple clusters** (external/internal);
   select the user/cluster by **matching the cluster `server` URL** (as gardenlogin does), not
   blindly by `current-context`. Hand the resulting client-cert kubeconfig to the normal connect
   path (`addCluster`); `createHeaders.ts` already sends `X-Client-Certificate-Data` + CA.

All garden/shoot calls go through the Busola backend proxy (`X-Cluster-Url` +
`X-K8s-Authorization`), as today. Assumes the garden & shoot API servers are public
(backend `localIpFilter`) with publicly-trusted TLS (backend falls back to `certs.pem`).

## Components

**New**

- `gardenlogin-detect.ts` — `isGardenloginKubeconfig(kubeconfig)` + `extractShootRef(kubeconfig)`
  (`{ namespace, name, gardenClusterIdentity }` from the current-context cluster's extension).
- `requestAdminKubeconfig.ts` — the single-shoot `AdminKubeconfigRequest` helper
  (returns a `ValidKubeconfig`), used by both the wizard flow and the dormant flow.
- A wizard "Gardener" step component (paste garden kubeconfig + run login + mint + report).

**Modified**

- `AddClusterWizard.tsx` — branch after `KubeconfigUpload`: gardenlogin → Gardener step;
  otherwise unchanged.
- `useGardenerLoginFunction.tsx` — refactor `getKubeconfigs` to call `requestAdminKubeconfig`
  (shared code; behavior preserved).
- `public/i18n/en.yaml` — new keys for the step title, prompt, and error messages.

**Reused as-is:** `KubeconfigUpload`, `ContextChooser`, `AuthForm`, `oidc-params.ts`,
`createUserManager`, `createHeaders.ts`, `addCluster`.

## Error states

- No garden kubeconfig pasted → block "Next".
- OIDC/redirect failure → surface the IdP error; hint that the garden OIDC client must allow
  Busola's `redirect_uri` (its origin).
- `AdminKubeconfigRequest` 403 → "your garden user lacks adminkubeconfig rights on this shoot".
- Shoot 404 → wrong garden/landscape for this shoot.
- Minted token is short-lived → read `status.expirationTimestamp` rather than assuming 3h.

## Testing (POC-light)

- Unit: `isGardenloginKubeconfig` / `extractShootRef` (incl. the external/internal two-cluster
  file and the "command but no shootRef" case); `requestAdminKubeconfig` with mocked fetch
  (request body + base64/YAML decode).
- Manual E2E against a canary shoot.
- Full Cypress integration deferred (see non-goals / #5340 DoD).

## Open risk (owned by product)

Garden browser-OIDC requires the garden's OIDC client to allow Busola's `redirect_uri`
(its origin + path). **Prior-art note:** Headlamp and Kubernetes Dashboard do _not_ demonstrate
in-browser gardenlogin — Headlamp runs the exec plugin in its local Go backend, and Kubernetes
Dashboard is bearer-token-only. The valid browser precedent is the **Gardener Dashboard**, which
does browser OIDC and mints shoot kubeconfigs via the same `AdminKubeconfigRequest`. It is a
_confidential_ server-side client (client-secret + session cookie) and enforces a redirect_uri
**allow-list**; Busola instead is a _public_ PKCE client (no secret, redirect_uri = its own
origin, token in browser memory). So the achievability is real, but the garden IdP must register
Busola's redirect_uri — confirmation / per-landscape registration is tracked outside this POC and
lands in the future admin landscape-map.

## Future work

- Admin landscape map for true one-paste (no garden-kubeconfig prompt) + redirect-URI config.
- Replace the dormant garden-wide flow with this one.
- Full integration tests per #5340.
