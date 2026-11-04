# Adobe Analytics Integration

## Executive Summary

This SPIKE researches what it would take to integrate Adobe Analytics into the Kyma Dashboard (Busola). The recommended approach is:

- **SDK/tag choice:** Adobe Launch/Tags (Experience Platform Tags) with dynamic script injection gated by a feature flag — matching the existing Sentry integration pattern
- **Event model:** Anonymous route-level page views and coarse-grained feature-usage events; no PII, no resource content, no cluster data
- **Gating:** A new `ADOBE_ANALYTICS` feature flag, defaulting to `isEnabled: false`, enabled exclusively via the `busola-config` ConfigMap in SAP-managed deployments
- **Privacy:** IP anonymization enabled, ECID/demdex tracking avoided, no consent banner required if no cookies are set (cookieless mode via `localStorage` FPID)

---

## 1. SAP Adobe Analytics Tenant & Onboarding

### SAP's Adobe Experience Cloud footprint

SAP operates a corporate Adobe Analytics tenant within the **SAP Adobe Experience Cloud org** (tenant alias `sapwebanalytics`). New products are onboarded by requesting:

1. A **report suite** — the container for your product's data. Report suites are scoped to a product/property and control date retention, currency settings, and access.
2. An **Adobe Experience Platform Tags property** — the tag management container that holds the Adobe Analytics extension and all data-collection rules. The property produces an **embed code** (a `<script>` tag) that is pasted into the application.

> **Internal gap:** The exact report suite name, Tags property ID, and embed code for a Kyma Dashboard report suite do not exist yet and must be provisioned. Contact @mrCherry97 (or the SAP Analytics Hub team) to initiate the onboarding request. The provisioning process typically takes 1–2 weeks.

### Integration model SAP mandates

SAP's standard for managed-product analytics is **Adobe Experience Platform Tags** (formerly Adobe Launch, formerly DTM). Under this model:

- SAP's Analytics Hub manages a shared Tags **organization**; individual product teams own their own **property** within it.
- The Tags property delivers the **Adobe Analytics extension** (AppMeasurement-based) and any custom rules via a CDN-hosted script at `assets.adobedtm.com`.
- Product teams embed a single async `<script>` tag (the property's embed code) in their HTML; the Tags runtime loads the analytics extension and fires configured rules.

This means Busola's code change is small: embed the script (conditionally), add route-change tracking hooks, and configure rules in the Tags UI.

---

## 2. Technical Integration Approaches

Three approaches are viable. They are evaluated against Busola's constraints: feature-flag gating, no-cookie architecture, React 18 + Vite SPA, and OSS distribution.

### Approach A — Adobe Launch/Tags embed code (external script)

The Launch embed `<script>` tag is added statically to `index.html`, always loading the Tags runtime from `assets.adobedtm.com`.

```html
<!-- index.html — added to <head> -->
<script
  src="https://assets.adobedtm.com/XXXX/launch-XXXX.min.js"
  async
></script>
```

SPA page views are tracked in React by calling `_satellite.track('page-view', { pageName: ... })` on route changes.

|          |                                                                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pros** | Simplest code change; Tags rules managed outside the codebase by the Analytics Hub team                                                                                 |
| **Cons** | Script loads for **all** users including OSS deployments — cannot be gated by feature flag; CSP must always allow `assets.adobedtm.com` even when analytics is disabled |

**Not recommended** — violates the requirement that analytics is off by default for OSS/self-hosted users.

---

### Approach B — Adobe Web SDK (alloy.js) via npm package

Install `@adobe/alloy` and initialize it programmatically inside a `useAdobeAnalytics` hook. Full XDM/Experience Data Model event schema.

```ts
import { createInstance } from '@adobe/alloy';
const alloy = createInstance({ name: 'alloy' });
alloy('configure', { datastreamId: '...', orgId: '...' });
alloy('sendEvent', {
  xdm: { web: { webPageDetails: { name: '...', URL: '...' } } },
});
```

|          |                                                                                                                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pros** | Fully programmatic; feature-flag gatable; testable; no external CDN dependency at runtime                                                                                                                                   |
| **Cons** | ~200 KB bundle size addition; requires an **Adobe Experience Platform Datastream** (separate provisioning from a classic report suite); more complex XDM schema; Analytics Hub may not support Web SDK yet for SAP products |

**Viable as a future path** once SAP's Analytics Hub migrates to Experience Platform. Not recommended as the first implementation — too much provisioning overhead and uncertain SAP support.

---

### Approach C — Dynamic Launch embed with feature-flag gate ✅ **Recommended**

The Launch embed script is injected into the DOM **only when the `ADOBE_ANALYTICS` feature flag is enabled**. This mirrors how Sentry already works in Busola ([src/hooks/useSentry.js](src/hooks/useSentry.js)).

```ts
// src/hooks/useAdobeAnalytics.ts
export function useAdobeAnalytics() {
  const feature = useFeature(configFeaturesNames.ADOBE_ANALYTICS);

  useEffect(() => {
    if (!feature?.isEnabled || !feature?.config?.embedUrl) return;
    const script = document.createElement('script');
    script.src = feature.config.embedUrl;
    script.async = true;
    document.head.appendChild(script);
  }, [feature]);
}
```

SPA route tracking is a separate `useAdobePageView` hook that listens to React Router's `useLocation` and fires `_satellite.track()` on each route change.

|          |                                                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pros** | Feature-flag gated (OSS deployments load no analytics script); Tags rules managed outside the codebase; minimal bundle size impact; familiar pattern (mirrors Sentry) |
| **Cons** | `assets.adobedtm.com` still needed in CSP (but the `connect-src` and `img-src` changes are conditional on feature-flag enablement at runtime)                         |

---

### Comparison summary

|                                         | Approach A | Approach B | **Approach C** |
| --------------------------------------- | ---------- | ---------- | -------------- |
| Feature-flag gatable                    | ✗          | ✓          | **✓**          |
| Bundle size                             | ~0 KB      | +200 KB    | **~0 KB**      |
| SDK managed by Analytics Hub            | ✓          | ✗          | **✓**          |
| Works with SAP tenant today             | ✓          | ?          | **✓**          |
| No external CDN in CSP (disabled state) | ✗          | ✓          | ✗ (CSP static) |
| Programmatic event control              | ✗          | ✓          | **partial**    |

---

## 3. SPA Route-Change Tracking

React Router 7 does not fire traditional page loads on navigation. Adobe Analytics will only record the initial HTML load unless Busola explicitly fires tracking events on route changes.

### Implementation pattern

```ts
// src/hooks/useAdobePageView.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useFeature } from './useFeature';
import { configFeaturesNames } from 'state/types';

export function useAdobePageView() {
  const location = useLocation();
  const feature = useFeature(configFeaturesNames.ADOBE_ANALYTICS);

  useEffect(() => {
    if (!feature?.isEnabled) return;
    if (typeof window._satellite === 'undefined') return;

    const pageName = buildPageName(location.pathname);
    window._satellite.track('page-view', { pageName });
  }, [location.pathname, feature?.isEnabled]);
}

function buildPageName(pathname: string): string {
  // Replace resource names/IDs with type markers to avoid capturing PII/resource content
  return pathname
    .replace(/\/namespaces\/[^/]+/g, '/namespaces/{namespace}')
    .replace(
      /\/(pods|deployments|services|configmaps|secrets)\/[^/]+/g,
      '/$1/{name}',
    );
}
```

This hook would be called in `App.tsx` alongside the existing `useSentry()` call.

### What the `buildPageName` sanitiser does

The path sanitiser strips concrete namespace and resource names before they are sent to Adobe Analytics. The resulting `pageName` values look like:

- `/cluster/namespaces/{namespace}/pods` → resource list view
- `/cluster/namespaces/{namespace}/pods/{name}` → resource detail view
- `/cluster/overview` → cluster overview

This ensures no Kubernetes resource names or namespace names are ever transmitted.

---

## 4. Event Model

### Recommended trackable events

All events must be non-PII, non-sensitive, and representable at the resource-type level.

| Event                     | Data sent                                            | Trigger                               |
| ------------------------- | ---------------------------------------------------- | ------------------------------------- |
| `page-view`               | Sanitised path (see §3), referrer (same origin only) | Every React Router route change       |
| `feature-terminal-open`   | Feature name only                                    | User opens the integrated terminal    |
| `feature-companion-open`  | Feature name only                                    | User opens Kyma Companion / AI chat   |
| `feature-companion-query` | Feature name only                                    | User submits a companion query        |
| `resource-create`         | Resource kind (e.g. `Deployment`)                    | User completes a Create Resource form |
| `resource-delete`         | Resource kind                                        | User confirms deletion                |
| `resource-yaml-edit`      | Resource kind                                        | User opens the YAML editor            |
| `resource-validate`       | Feature name                                         | User triggers validation              |
| `error-page-view`         | Error type (generic, no stack)                       | App-level error boundary fires        |

### Explicitly excluded

- Resource names, namespace names, labels, annotations, or any resource content
- Auth tokens, kubeconfig contents, or credentials
- Cluster API server URLs or cluster identifiers
- User email addresses, usernames, or any identity data
- Query/prompt text sent to Kyma Companion

---

## 5. Content Security Policy Changes

The current CSP in [index.html](index.html) does not allow any external analytics domains. All CSP directives live in the static `<meta http-equiv="Content-Security-Policy">` tag in `index.html` and must be updated at build time — they are not toggleable at runtime.

**Required additions:**

```html
<!-- script-src: add Adobe Launch CDN -->
script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' blob:
https://*.sapdas.cloud.sap https://assets.adobedtm.com;

<!-- connect-src: new directive — not currently present in the CSP -->
connect-src 'self' https://*.omtrdc.net https://dpm.demdex.net;

<!-- img-src: new directive — not currently present in the CSP -->
img-src 'self' data: https://*.omtrdc.net;
```

> **Note:** `connect-src` and `img-src` directives do not currently exist in the CSP header. Without `connect-src`, all XHR/fetch/beacon requests to Adobe's collection servers (`*.omtrdc.net`) will be blocked regardless of the feature flag. Similarly, without `img-src`, pixel-based beacon fallback tracking will be blocked. Both directives must be added for analytics to function.

> **Risk note:** Adding `assets.adobedtm.com` to `script-src` means a compromised Adobe CDN could inject arbitrary JavaScript into Busola for _all_ users — including those in OSS deployments where analytics is disabled. Mitigations: use the property's **SRI hash** embed URL (Adobe Launch supports Subresource Integrity); restrict to the staging property for non-production clusters. The existing `unsafe-eval` in the CSP is a broader trust concern; this addition is within the same risk tier but adds a new external trust anchor.
>
> The `dpm.demdex.net` domain enables Adobe ECID (visitor ID) using a third-party cookie. See §6 for how to avoid this while maintaining the no-cookie model.

---

## 6. Privacy, Consent & GDPR

### Data that Adobe Analytics collects by default

- IP address (used for geolocation, then optionally anonymized)
- Browser/OS/device fingerprint
- Page URL and referrer
- Time-on-page, click paths
- A visitor ID cookie (`s_vi` or `s_fid`)

### Conflicts with Busola's no-cookie model

Busola deliberately stores no cookies and keeps auth tokens in memory only (see [AGENTS.md](AGENTS.md) security guidelines). Adobe Analytics' default visitor identification uses `s_vi` (a first-party cookie with a 2-year TTL), which would introduce a cookie for the first time.

**Resolution options:**

1. **Cookieless mode (`s_fid` / FPID):** Adobe Analytics falls back to `s_fid`, a fingerprint-based short-lived ID stored in `localStorage`, when `s_vi` is blocked or disabled. This can be forced by configuring `cookieDomainPeriods=0` in the AppMeasurement config. No cookie is set. Visitor continuity is session-scoped.

2. **Disable ECID (demdex.net):** Setting `visitor.disableThirdPartyCookies = true` in the Tags extension config prevents ECID from calling `dpm.demdex.net`. This eliminates the cross-domain visitor identification cookie but also limits audience segmentation.

3. **IP anonymization:** Adobe Analytics supports `[IP] anonymize last octet` per report suite. This should be enabled at the report suite level during provisioning to comply with GDPR data minimisation.

**Recommendation:** Use cookieless mode (option 1) + disable ECID (option 2) + IP obfuscation. This keeps the no-cookie model intact, satisfies GDPR data minimisation, and avoids the need for a consent banner (no cookies = no cookie law trigger under ePrivacy Directive Article 5(3) for strictly analytics-functional identifiers stored in `localStorage`).

> **Legal gap:** SAP's DPP (Data Protection and Privacy) team should confirm that `localStorage`-based FPID tracking without a consent banner is acceptable under SAP's privacy posture for BTP-hosted products. Contact your DPP business partner before enabling analytics in production. The DPP review is estimated to take 1–2 weeks.

### Air-gapped / offline deployments

When the `ADOBE_ANALYTICS` feature flag is `isEnabled: false` (the default), no analytics script is loaded and no network requests to Adobe servers are made. Air-gapped deployments are unaffected.

If the feature flag is somehow enabled in an air-gapped environment, the Launch script fetch will fail silently (no retries, no error surfaced to the user). All analytics calls will be no-ops since `window._satellite` will not be defined — the `useAdobePageView` hook guards on `typeof window._satellite === 'undefined'`.

---

## 7. OSS vs. SAP-Managed Deployment Scope

### Default: OFF for all deployments

The `ADOBE_ANALYTICS` feature will have `isEnabled: false` in [public/defaultConfig.yaml](public/defaultConfig.yaml). This means:

- Open-source Busola self-hosted by any community user → no analytics, zero data sent
- SAP-managed Kyma Dashboard on BTP → analytics enabled only if SAP operations team adds it to the `busola-config` ConfigMap in `kube-public`

### Enabling for SAP-managed deployments

The existing `busola-config` mechanism (a ConfigMap in `kube-public` namespace, read by [src/state/configuration/configurationAtom.ts](src/state/configuration/configurationAtom.ts)) already supports per-cluster feature overrides. The SAP operations team would add:

```yaml
# busola-config ConfigMap, data.config
config:
  features:
    ADOBE_ANALYTICS:
      isEnabled: true
      config:
        embedUrl: https://assets.adobedtm.com/XXXX/launch-XXXX.min.js
```

No code change is needed to toggle analytics on a per-cluster basis.

### PROTECTED_CONFIG_FEATURES consideration

The `ADOBE_ANALYTICS` feature should **not** be added to `PROTECTED_CONFIG_FEATURES` in [src/state/types.ts](src/state/types.ts). Protected features are installation-only (cannot be overridden via ConfigMap). Analytics is a per-cluster operational concern — each SAP-managed cluster should be able to opt in independently.

---

## 8. Required Changes & Risk Assessment

| Change                                                | Location                                                         | Effort   | Risk                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------- | -------- | --------------------------------------------------- |
| Add `ADOBE_ANALYTICS` to `configFeaturesNames`        | [src/state/types.ts](src/state/types.ts)                         | 0.5h     | Negligible                                          |
| Add default config entry (`isEnabled: false`)         | [public/defaultConfig.yaml](public/defaultConfig.yaml)           | 0.5h     | Negligible                                          |
| Implement `useAdobeAnalytics` hook (script injection) | [src/hooks/useAdobeAnalytics.ts](src/hooks/useAdobeAnalytics.ts) | 2h       | Low                                                 |
| Implement `useAdobePageView` hook (route tracking)    | [src/hooks/useAdobePageView.ts](src/hooks/useAdobePageView.ts)   | 3h       | Low                                                 |
| Wire hooks into App.tsx                               | [src/components/App/App.tsx](src/components/App/App.tsx)         | 0.5h     | Negligible                                          |
| Update CSP in index.html                              | [index.html](index.html)                                         | 0.5h     | **Medium** — adds external script-src domain        |
| Add custom event tracking for key features            | Multiple files                                                   | 2–3 days | Low–Medium (requires audit of feature touch points) |
| Unit/component tests for new hooks                    | [src/hooks/](src/hooks/)                                         | 1 day    | Low                                                 |
| DPP review & consent decision                         | Org-level                                                        | external | **High** — blocker for production use               |
| Adobe Analytics tenant provisioning                   | Org-level                                                        | external | **High** — blocker; contact @mrCherry97             |

**Total code effort:** ~5–6 days  
**External blockers:** 2–3 weeks (tenant provisioning + DPP review)

---

## 9. Answers to Open Questions

**Is Adobe Analytics appropriate for an open-source product?**  
Yes, with the feature-flag gating approach. The OSS version ships with analytics disabled. The SDK/tag is never loaded unless explicitly enabled by the deployment operator. This is the same model used by Sentry in Busola today.

**Does introducing analytics weaken CSP hardening?**  
Modestly. Adding `assets.adobedtm.com` to `script-src` introduces a new external script trust anchor. The existing `unsafe-eval` in the current CSP is a more significant concern. The risk is mitigated by using Adobe's SRI-capable embed URLs and restricting to the specific property hash where possible.

**Consent UX — is a cookie/consent banner acceptable?**  
It is not needed if cookieless mode is used (localStorage FPID only, no `s_vi` cookie, ECID disabled). The DPP team must confirm this position. If cookies are required, a consent banner integrated into Busola's initial load would be needed — a significantly larger UX and legal scope increase.

---

## 10. Next Steps

1. **Org-level (blocking):** Contact @mrCherry97 to initiate Adobe Analytics tenant/report-suite provisioning with SAP Analytics Hub.
2. **Org-level (blocking):** Engage DPP business partner to confirm cookieless-mode FPID tracking is permissible without a consent banner.
3. **Implementation:** Proceed with Steps from §8 (code changes are small and can start in parallel with provisioning):
   - Add feature flag
   - Implement `useAdobeAnalytics` and `useAdobePageView` hooks
   - Update CSP and defaultConfig.yaml
4. **Testing PoC:** Once a Launch embed code is available (even a sandbox/staging property), run a local test to confirm `_satellite.track()` fires correctly on route changes and events appear in the Adobe Analytics debugger.
5. **Event catalogue:** Define the full event catalogue with the product team before implementation — what actions are worth tracking, naming conventions, and classification taxonomy.
6. **DPP sign-off:** Obtain written DPP approval before enabling in any production cluster.

---

## 11. References

- [Adobe Experience Platform Tags documentation](https://experienceleague.adobe.com/docs/experience-platform/tags/home.html)
- [Adobe Analytics SPA tracking guide](https://experienceleague.adobe.com/docs/analytics/implementation/vars/page-vars/pagename.html)
- [Adobe Web SDK (alloy.js)](https://experienceleague.adobe.com/docs/experience-platform/web-sdk/home.html)
- [Adobe Analytics cookieless tracking (s_fid)](https://experienceleague.adobe.com/docs/core-services/interface/data-collection/cookies/analytics.html)
- [ECID service and demdex.net](https://experienceleague.adobe.com/docs/id-service/using/intro/cookies.html)
- [CSP and third-party scripts (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- Related issue: [#4186 — Count Kyma Dashboard users via Cloud Run Logs](https://github.com/kyma-project/busola/issues/4186) — alternative telemetry approach via server-side log analytics (no CSP changes, no consent required)

---

## Appendix: Minimal PoC — Page-View Tracking End to End

This PoC can be run locally once a Launch staging embed code is available. No production tenant is needed for the code structure.

**Step 1 — Local `index.html` test** (bypass feature flag for isolated PoC):

```html
<!-- Temporarily add to index.html for PoC only -->
<script
  src="https://assets.adobedtm.com/STAGING_PROPERTY_EMBED.min.js"
  async
></script>
```

**Step 2 — Enable Adobe Analytics Extension Debugger** in Chrome: install the [Adobe Experience Platform Debugger](https://chrome.google.com/webstore/detail/adobe-experience-platform/bfnnokhpnncpkdmbokanobigaccjkpob) extension.

**Step 3 — Add a temporary tracking call** to `App.tsx`:

```ts
// Temporary PoC — remove before merging
useEffect(() => {
  if (typeof window._satellite !== 'undefined') {
    window._satellite.track('page-view', {
      pageName: window.location.pathname,
    });
  }
}, []);
```

**Step 4 — Verify** in the Adobe Debugger that a `page-view` event appears in the Events tab with the correct `pageName`.

This confirms the Integration pipeline is working before investing in the full implementation.
