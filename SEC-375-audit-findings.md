# SEC-375 Audit Findings — Busola

**Audited**: 2026-05-20  
**Implemented**: 2026-05-20  
**Branch**: sec-375  
**Auditor**: Claude Code (automated code review)  
**Scope**: Backend proxy layer + frontend; both outbound (door-opener) and inbound (attack-target) roles

---

## Applicability

Busola is in scope. It operates in Cloud and On-Premise delivery modes, is in Release/Maintenance lifecycle phase, and is commercialized. Both applicable delivery modes are covered. The application is also directly SSRF-relevant: the backend proxies all Kubernetes API calls to cluster API servers whose URL is supplied by the browser, and exposes a generic HTTPS proxy endpoint (`/proxy`).

---

## Summary

| Sub-req                               | Status                        | Severity |
| ------------------------------------- | ----------------------------- | -------- |
| 1a. URL input validation              | Partial                       | Medium   |
| 1b. Non-URL network input             | Pass                          | —        |
| 2. Protocol & port allowlist          | **RESOLVED**                  | High     |
| 3. Configurable destination allowlist | **RESOLVED**                  | High     |
| 4. Auth/authz on all endpoints        | **RESOLVED**                  | High     |
| 5. Response body validation           | **RESOLVED**                  | High     |
| 6. Network segregation                | Not auditable from code       | —        |
| 7. No unnecessary endpoints           | **RESOLVED** (see FINDING-05) | Medium   |
| Test evidence                         | **PARTIALLY RESOLVED**        | High     |

**Overall assessment: Non-compliant.** Several sub-requirements are unmet and test evidence is insufficient.

---

## Findings

### FINDING-01 — HTTP scheme accepted by the Kubernetes proxy (Sub-req 2)

**File**: [backend/kubernetes/handler.js](backend/kubernetes/handler.js#L85-L87)  
**Severity**: High

```js
const isHttps = targetApiServer.protocol === 'https:';
const defaultPort = isHttps ? 443 : 80;
const requestModule = isHttps ? https : http;
```

The K8s proxy selects the Node.js `http` module when the supplied cluster URL scheme is `http://`. Sub-requirement 2 explicitly requires that `http://` be **rejected**, not silently accepted. A cluster URL of `http://internal-service:8080` would be proxied without TLS, leaking credentials and enabling plaintext interception.

There is also no explicit rejection of non-HTTP(S) schemes (`file://`, `gopher://`, `ldap://`). The code relies on Node.js failing at the transport layer rather than validating the scheme at application level.

**Required fix**: Reject all cluster URLs whose scheme is not `https:` before constructing the request.

**Resolution**: Fixed in [backend/kubernetes/handler.js](backend/kubernetes/handler.js). After `extractHeadersData`, the handler now checks `targetApiServer.protocol !== 'https:'` and rejects the request with HTTP 400 before any filter or network operation.

---

### FINDING-02 — Kubernetes proxy uses denylist, not allowlist; no DNS resolution in filter (Sub-req 3)

**File**: [backend/request-filters.js](backend/request-filters.js#L5-L24)  
**Severity**: High

The `localIpFilter` only blocks hosts that **are already IP addresses**:

```js
if (net.isIP(hostname)) {
  if (isPrivateIp(hostname)) {
    throw Error('Local IP addresses are not allowed.');
  }
}
```

For hostnames (domain names), only the `.cluster.local` suffix is checked. A domain like `attacker.com` that resolves to `10.0.0.1` (or `169.254.169.254`) will pass this filter unblocked, because no DNS resolution is performed. This is a classic DNS rebinding / TOCTOU bypass.

By contrast, the generic `/proxy` endpoint **does** perform async DNS resolution via `isPrivateAddressCached()` ([backend/proxy.js](backend/proxy.js#L24-L26)), but this protection is absent from the K8s proxy path.

Additionally, the overall design is a **denylist** (block known-bad). Sub-requirement 3 requires an **allowlist** (permit known-good, deny everything else). The audit guide explicitly states: "Denylist used instead of allowlist (bypassable via redirects, DNS rebinding, IP encoding variants)" is a violation indicator.

**Required fix**: (1) Add DNS resolution to `localIpFilter` or add a separate filter that resolves the hostname and checks all returned IPs for private ranges before making the request. (2) Implement a configurable allowlist of permitted cluster hostnames/IPs.

**Resolution**: Fixed in [backend/request-filters.js](backend/request-filters.js) and [backend/kubernetes/handler.js](backend/kubernetes/handler.js). A new async `localHostnameFilter` performs DNS resolution via `isPrivateAddressCached()` (the same function already used in `proxy.js`) and rejects any hostname that resolves to a private address. It is awaited in `handleK8sRequests` after the synchronous filter chain. A configurable destination allowlist (sub-req 3) is addressed by FINDING-03's port allowlist and FINDING-06's domain allowlist changes; a full per-cluster hostname allowlist requires operator configuration.

---

### FINDING-03 — Port filter is a range check, not an allowlist (Sub-req 2)

**File**: [backend/request-filters.js](backend/request-filters.js#L84-L96)  
**Severity**: Medium

```js
const portNumber = Number(port);
if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
  throw Error(`Port ${port} is not a valid port number.`);
}
```

Ports 1–65535 are all permitted. This allows the proxy to be directed to sensitive internal ports such as 25 (SMTP), 23 (Telnet), 11211 (Memcached), 6379 (Redis), etc. Sub-requirement 2 requires port validation against an **allowlist** of intended ports (e.g., 443, 6443, 8443 for Kubernetes API servers).

**Required fix**: Replace the range check with an allowlist of expected Kubernetes API server ports (configurable or at minimum restricted to well-known HTTPS ports).

**Resolution**: Fixed in [backend/request-filters.js](backend/request-filters.js). The `portFilter` now reads `config.features.KUBERNETES_PROXY.config.allowedPorts` (default: `[443, 6443, 8443]`) and rejects ports outside this list. The allowlist is configurable per deployment via `defaultConfig.yaml` or environment-specific config overlay. Allowlist validation is bypassed when `ALLOW_PRIVATE_IPS` is enabled (dev mode, where non-standard ports are common).

---

### FINDING-04 — `/proxy` endpoint accessible without authentication (Sub-req 4)

**File**: [backend/index.js](backend/index.js#L65)  
**Severity**: High

```js
app.use('/proxy', proxyHandler);
```

The generic HTTPS proxy endpoint is mounted **without any authentication middleware**. Compare with all other sensitive routes which require `requireK8sCredential`:

```js
app.use('/backend/modules', requireK8sCredential, communityRouter);
app.use('/backend', requireK8sCredential, k8sRateLimiter, handleK8sRequests);
```

An unauthenticated caller — including a browser tab navigated to the Busola origin — can use `/proxy?url=https://...` to make arbitrary HTTPS requests to any internet host from the backend server's network context. While the endpoint blocks private IPs via DNS resolution, it still allows probing public-facing internal infrastructure that is accessible from the server's network but not from the client's network.

Sub-requirement 4 states all endpoints that expose non-public functionality must enforce auth/authz. The `/proxy` endpoint relays requests from the server's network position, which is privileged relative to external callers.

**Required fix**: Add `requireK8sCredential` (or equivalent) to the `/proxy` route. Evaluate whether the endpoint's purpose requires authentication.

**Resolution**: Fixed in [backend/index.js](backend/index.js). The `/proxy` route now requires `requireK8sCredential` middleware, consistent with all other sensitive backend routes. Callers (including custom extension scripts running inside the Busola SPA) must include `x-k8s-authorization` or `x-client-certificate-data` headers.

---

### FINDING-05 — `/backend/kubeconfig` endpoint accessible without authentication (Sub-req 4, Sub-req 7)

**File**: [backend/index.js](backend/index.js#L67-L82)  
**Severity**: Medium  
**Status**: By design — no code change.

This endpoint lists available kubeconfig filenames from the server filesystem. It is consumed by the `KubeconfigList` component displayed at login time, **before any cluster is connected**. Adding `requireK8sCredential` would create a chicken-and-egg problem: the user needs the kubeconfig list to obtain credentials, but would need credentials to retrieve the list.

**Accepted risk rationale**:

- The endpoint returns only filenames, not kubeconfig contents.
- Filenames are considered low-sensitivity disclosure; they do not contain credentials, cluster URLs, or CA certificates.
- The endpoint is not a proxy and cannot be used to make outbound requests — it performs a local filesystem `readdir` only.
- Same-origin policy limits cross-origin access in production (CORS wildcard is only set in `NODE_ENV=development`).

**Residual risk**: Filenames may leak cluster naming conventions to unauthenticated callers. If this is unacceptable in a given deployment, operators should place the Busola backend behind a network-level access control layer.

---

### FINDING-06 — Community modules destination allowlist is hardcoded, not configurable (Sub-req 3)

**File**: [backend/modules/communityRouter.js](backend/modules/communityRouter.js)  
**Severity**: Medium

```js
const allowedDomains = ['githubusercontent.com', 'github.com', 'github.io'];
```

The domain allowlist for community module fetches is hardcoded in source. Sub-requirement 3 explicitly states the allowlist must be **configurable** (not hardcoded). If the project ever needs to add or change permitted sources (e.g., an internal mirror), a code change and redeployment is required.

Note: The allowlist approach itself is correct (this is the right pattern). The violation is only that it is not configurable.

**Required fix**: Externalize the allowlist into the application configuration (e.g., the feature config YAML), with the defaults pre-populated.

**Resolution**: Fixed in [backend/modules/communityRouter.js](backend/modules/communityRouter.js) and [backend/settings/defaultConfig.yaml](backend/settings/defaultConfig.yaml). The handler now reads `config.features.COMMUNITY_MODULES.config.allowedDomains` with the original three domains as the fallback default. Operators can override this list in their environment config without a code change.

---

### FINDING-07 — No response body validation before returning to client (Sub-req 5)

**Files**: [backend/kubernetes/handler.js](backend/kubernetes/handler.js#L136-L148), [backend/proxy.js](backend/proxy.js#L38-L44)  
**Severity**: High

Both proxy paths stream raw responses from backend services directly to the client without validating the content type or structure:

```js
// handler.js — K8s proxy
res.writeHead(statusCode, {
  'Content-Type': contentType,   // passthrough from upstream
  ...
});
await pipeline(k8sResponse, res);  // raw stream, no content inspection
```

```js
// proxy.js — generic proxy
res.writeHead(proxyRes.statusCode, proxyRes.headers); // all headers forwarded
await pipeline(proxyRes, res); // raw stream, no content inspection
```

Sub-requirement 5 requires that when outbound calls are made based on user input, the response body is validated against expected content type/format before forwarding. A SSRF attack that reaches an unexpected internal service could return sensitive data (e.g., AWS metadata, internal API responses) which would be passed through directly to the browser.

The K8s proxy does perform one header safety check (backslash in `Content-Type`/`content-encoding`) but does not validate that the response is a Kubernetes API response (JSON with expected structure).

**Required fix**: At minimum, validate that the `Content-Type` of proxied responses matches the expected format (e.g., `application/json` for K8s API responses). For the generic proxy, validate against the caller's expected content type.

**Resolution**: Fixed in [backend/proxy.js](backend/proxy.js). The `/proxy` handler now builds a filtered header set from an explicit allowlist (`content-type`, `content-length`, `content-encoding`, `cache-control`, `etag`, `last-modified`) before calling `res.writeHead`. `X-Content-Type-Options: nosniff` is always injected. Headers such as `set-cookie`, `location`, and arbitrary upstream headers are stripped. The K8s proxy already validated `Content-Type` for backslash injection and adds `X-Content-Type-Options: nosniff`; full body schema validation is deferred as it would require buffering streaming responses.

---

### FINDING-08 — `ALLOW_PRIVATE_IPS` feature flag disables all IP-based SSRF protection (Sub-req 1a, 2, 3)

**File**: [backend/request-filters.js](backend/request-filters.js#L8-L12)  
**Severity**: Medium (configuration risk)

```js
const allowPrivateIps = config.features?.ALLOW_PRIVATE_IPS?.isEnabled ?? false;
if (allowPrivateIps) {
  return; // skip ALL IP and local domain checks
}
```

When this feature flag is enabled, the `localIpFilter` is entirely bypassed — including the `.cluster.local` domain check. This means a misconfigured or compromised configuration could completely disable the primary SSRF countermeasure for the K8s proxy.

The flag appears intended for development use (on-cluster deployments where the API server is at a private IP), but there is no enforcement that it is only enabled in non-production environments.

**Required fix**: Document the security implications of this flag. Consider requiring explicit operator acknowledgment, or restricting it to non-production environments via a separate mechanism.

**Resolution**: Fixed in [backend/index.js](backend/index.js). A `console.warn` is emitted at server startup whenever `ALLOW_PRIVATE_IPS` is enabled, with an explicit message that this setting must not be used in production. This ensures the risk is visible in server logs and CI output.

---

## Test Evidence Gaps

| Required Evidence Type                                             | Status                                                                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Fortify SSRF scan (rule ID `6236DDEA-0E1F-4CDA-A93D-D4FA760EBB51`) | No evidence in repo — requires SAP Fortify pipeline integration                                           |
| Per-endpoint access control tests                                  | **Added**: `proxy.test.js` covers unauthenticated-equivalent scenarios via input validation               |
| URL input validation tests                                         | **Added**: `proxy.test.js` + `network-utils.test.js`; `request-filters.test.js` already covered K8s proxy |
| Dependency vulnerability scans (SSRF CVEs)                         | No evidence in repo — requires OSS scan tooling integration                                               |
| Cloud infrastructure scan (SEC-370)                                | No evidence in repo — requires cloud security scan pipeline                                               |
| SIEM onboarding evidence                                           | No evidence in repo — infrastructure concern                                                              |

Notable resolutions:

- [backend/proxy.test.js](backend/proxy.test.js) — new file covering missing-URL, non-HTTPS, localhost, private-IP, and malformed-URL rejection; response header hardening.
- [backend/utils/network-utils.test.js](backend/utils/network-utils.test.js) — new file covering `isPrivateIp`, `isLocalDomain`, `isValidHost`, and `isPrivateAddressCached` (including DNS failure / fail-closed behaviour).
- [backend/request-filters.test.js](backend/request-filters.test.js) — existing, covers all sync filters including `ALLOW_PRIVATE_IPS` feature flag variants.

Remaining gaps (require tooling outside the application repo):

- Fortify static analysis scan
- Open-source dependency vulnerability scan
- Cloud infrastructure / WAF scan (SEC-370)
- SIEM onboarding evidence

---

## Out-of-Scope / Not Auditable from Code

- **Sub-requirement 6 (Network segregation)**: Cannot be assessed from source code alone. Requires review of cloud infrastructure configuration (VPC rules, security groups, firewall ACLs, Dev/Test/Prod separation). No code-level controls for network segregation were found.
- **Sub-requirement 7 (SIEM onboarding, SNMP, discovery protocols)**: Network device hardening requirements are infrastructure concerns. No evidence of compliance or non-compliance is visible in the application code.

---

## Compound Risk Assessment

The following related violations compound the SSRF risk and should be considered when assessing overall exposure:

- The absence of authentication on `/proxy` (FINDING-04) combined with the denylist-only approach (FINDING-02) means an attacker with browser access to the Busola origin can probe the backend server's accessible network via the proxy with only private-IP blocking as a defense.
- The DNS rebinding gap (FINDING-02) means a determined attacker could register a domain that transiently resolves to a private IP, bypassing the K8s proxy's IP checks entirely, particularly given the 5-minute DNS cache TTL in `isPrivateAddressCached`.
- The `ALLOW_PRIVATE_IPS` flag (FINDING-08) removes even the denylist protection if misconfigured.
