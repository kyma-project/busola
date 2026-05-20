# SEC-390 Audit Findings — Busola

**Branch:** sec-390  
**Audited:** 2026-05-20  
**Auditor:** Claude Code (automated code review)
**Standard:** SEC-390 (HTTP Security Response Headers)  
**Overall verdict:** Not fulfilled → **Partially remediated** — one hard fail remains open pending a code refactor; all other findings resolved

---

## Scope

The audit covers the two response-generating surfaces of the Busola stack:

1. **nginx static server** — `nginx/nginx.conf`, port 8080, serves the React SPA shell and static assets.
2. **Express backend** — `backend/index.js` and downstream handlers, port 3001, proxies Kubernetes API calls and serves companion/community-module endpoints.

The `index.html` Vite template is also reviewed because it carries a `<meta http-equiv="Content-Security-Policy">` tag that the browser applies in addition to any HTTP header CSP.

---

## HARD FAIL — Requirement Not Fulfilled

### HF-1 `unsafe-inline` in `style-src` — OPEN

**File:** [nginx/nginx.conf](nginx/nginx.conf)

The CSP contains `style-src 'self' 'unsafe-inline'`. This is an explicit hard-fail condition per Step 3. It nullifies CSS injection protection for the entire frontend.

**Root cause:** [src/web-components/createWebComponent.jsx:88-91](src/web-components/createWebComponent.jsx) creates a `<style>` element at runtime and appends it to the light DOM of each custom web component. Browsers block this when `unsafe-inline` is absent from `style-src`.

**Required steps to fix:**

1. **Extract inline styles to static CSS files.** The `styles` variable passed into `applyStyles()` is a static string known at build time. Move its content into a dedicated `.css` file co-located with the component. Import it normally (`import './component.css'`) so Vite bundles it as an external stylesheet loaded via `<link>`, which does not require `unsafe-inline`.

2. **Replace the `<style>` injection with a `<link>` element** pointing to the extracted CSS file, or rely on Vite's automatic CSS injection — whichever pattern is already used by the surrounding codebase.

3. **Audit for additional inline style injection.** Search the codebase for `createElement('style')`, `style.cssText =`, and `setAttribute('style', ...)` patterns outside of inline style attribute props, and apply the same extraction where found.

4. **Verify UI5 WebComponents React library compatibility.** Confirm that `@ui5/webcomponents-react` itself does not inject `<style>` elements that bypass the above fix. The library's Shadow DOM components use `adoptedStyleSheets` (Constructable Stylesheets) which do not require `unsafe-inline`. If a version upgrade is needed to enable that path, track it explicitly.

5. **Remove `unsafe-inline` from `style-src`** in [nginx/nginx.conf](nginx/nginx.conf) after the above changes are verified.

### HF-2 `wasm-unsafe-eval` in `script-src` — FIXED

**`wasm-unsafe-eval` was removed from the CSP** in [nginx/nginx.conf](nginx/nginx.conf) and [index.html](index.html). Investigation showed no actual WebAssembly runtime usage in the codebase: Monaco editor's TypeScript worker ([src/shared/components/MonacoEditorESM/autocompletion/useAutocompleteWorker.js](src/shared/components/MonacoEditorESM/autocompletion/useAutocompleteWorker.js)) ships only TypeScript type declarations for the WebAssembly API — no `WebAssembly.compile()` or `WebAssembly.instantiate()` calls exist. The directive was present preemptively and was not required.

### HF-3 `Referrer-Policy` header absent — FIXED

**Fix:** Added `add_header Referrer-Policy 'strict-origin-when-cross-origin';` to [nginx/nginx.conf](nginx/nginx.conf) and `res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')` to the Express security headers middleware in [backend/index.js](backend/index.js).

### HF-4 No testing evidence for security headers — FIXED

**Fix:** Added [backend/security-headers.test.js](backend/security-headers.test.js) with 20 tests covering nginx configuration review (header presence, CSP directives, forbidden headers) and Express middleware unit tests (all four security headers, `next()` invocation).

---

## Violations

### V-1 `Strict-Transport-Security` missing `includeSubDomains` — FIXED

**Fix:** Updated [nginx/nginx.conf](nginx/nginx.conf) to `max-age=31536000; includeSubDomains`.

### V-2 CSP missing `base-uri 'none'` — FIXED

**Fix:** Added `base-uri 'none'` to the CSP in [nginx/nginx.conf](nginx/nginx.conf).

### V-3 `Cross-Origin-Opener-Policy` absent — FIXED

**Fix:** Added `add_header Cross-Origin-Opener-Policy 'same-origin';` to [nginx/nginx.conf](nginx/nginx.conf) and `res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')` to the Express middleware in [backend/index.js](backend/index.js).

### V-4 `Cross-Origin-Resource-Policy` absent — FIXED

**Fix:** Added `add_header Cross-Origin-Resource-Policy 'same-site';` to [nginx/nginx.conf](nginx/nginx.conf) and `res.setHeader('Cross-Origin-Resource-Policy', 'same-site')` to the Express middleware in [backend/index.js](backend/index.js).

### V-5 Overly broad wildcards in `connect-src` and `img-src` — PARTIALLY FIXED (deviation required)

**File:** [nginx/nginx.conf](nginx/nginx.conf)

- `connect-src`: removed the bare `*`; the remaining `https://*` and `wss://*` wildcards are still broad but are operationally required — Busola must reach arbitrary user-supplied Kubernetes API server URLs and the cluster's websocket streams. A static allowlist is not feasible. **Requires deviation per Step 6.**
- `img-src`: narrowed from `*` to `https: data:`, eliminating plaintext HTTP image sources. Kubernetes module icons are loaded from arbitrary HTTPS URLs in resource metadata ([src/components/Modules/components/ModulesCard.tsx](src/components/Modules/components/ModulesCard.tsx)), so a static allowlist is not feasible. **Requires deviation per Step 6.**

### V-6 `cdn.jsdelivr.net` in HTML meta tag CSP `font-src` — FIXED

**Fix:** Removed `https://cdn.jsdelivr.net` from the meta tag's `font-src` in [index.html](index.html). Fonts are bundled from `@sap-theming/theming-base-content` and do not require a CDN at runtime.

### V-7 `unsafe-eval` in HTML meta tag CSP `script-src` — FIXED

**Fix:** Removed `'unsafe-eval'` from the meta tag's `script-src` in [index.html](index.html).

### V-8 Backend API responses served without security headers — FIXED

**Fix:**

- Added a security headers middleware to [backend/index.js](backend/index.js) that sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, and `Cross-Origin-Resource-Policy: same-site` on all Express responses.
- Added `Cache-Control: no-store` to the `writeHead` call for Kubernetes API proxy responses in [backend/kubernetes/handler.js](backend/kubernetes/handler.js).

### V-9 `Access-Control-Allow-Origin: *` on authenticated endpoint — FIXED

**Fix:** Removed `router.use(cors())` from [backend/modules/communityRouter.js](backend/modules/communityRouter.js). In the Docker production deployment the frontend and backend share the same Express origin; in development the global `cors({ origin: '*' })` middleware in [backend/index.js](backend/index.js) already covers cross-origin needs.

---

## Findings

### G-1 `X-XSS-Protection: 1; mode=block` set — FIXED

**Fix:** Removed the `add_header X-XSS-Protection` line from [nginx/nginx.conf](nginx/nginx.conf).

---

## Summary

| ID   | Summary                                                                             | Severity      | Status                       |
| ---- | ----------------------------------------------------------------------------------- | ------------- | ---------------------------- |
| HF-1 | `unsafe-inline` in `style-src`                                                      | Not fulfilled | OPEN — refactor required     |
| HF-2 | `wasm-unsafe-eval` in `script-src`                                                  | Not fulfilled | FIXED                        |
| HF-3 | `Referrer-Policy` absent                                                            | Not fulfilled | FIXED                        |
| HF-4 | No security header testing evidence                                                 | Not fulfilled | FIXED                        |
| V-1  | HSTS missing `includeSubDomains`                                                    | Violation     | FIXED                        |
| V-2  | CSP missing `base-uri 'none'`                                                       | Violation     | FIXED                        |
| V-3  | `Cross-Origin-Opener-Policy` absent                                                 | Violation     | FIXED                        |
| V-4  | `Cross-Origin-Resource-Policy` absent                                               | Violation     | FIXED                        |
| V-5  | Overly broad wildcards in `connect-src` / `img-src`                                 | Violation     | PARTIAL — deviation required |
| V-6  | `cdn.jsdelivr.net` in meta tag CSP `font-src`                                       | Violation     | FIXED                        |
| V-7  | `unsafe-eval` in meta tag CSP `script-src` (dev environment)                        | Violation     | FIXED                        |
| V-8  | Backend API responses lack security headers; no Cache-Control on sensitive K8s data | Violation     | FIXED                        |
| V-9  | `Access-Control-Allow-Origin: *` on authenticated `/backend/modules`                | Violation     | FIXED                        |
| G-1  | `X-XSS-Protection` set (deprecated)                                                 | Finding       | FIXED                        |
