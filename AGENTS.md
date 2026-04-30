# Agent Instructions

This file is the primary instruction surface for agents contributing to Busola. It is injected into your context on every interaction.

## Project Identity

Busola is a web-based UI for managing Kubernetes resources, with optional Kyma-specific extensions. It is a monorepo containing a React/TypeScript frontend, a Node.js/Express backend proxy, and Kyma extensibility configuration.

**Stack:** React 18, TypeScript, Vite, React Router 7, Jotai, SAP UI5 WebComponents (@ui5/webcomponents-react), Express 5, Vitest, Cypress.

**Requirements:** Node 24.x, npm 11.x.

## Setup

```bash
npm install   # Installs root and backend deps (postinstall runs cd backend && npm install automatically)
```

## Commands

### Development

```bash
npm start                          # Frontend (port 8080) + backend (port 3001) concurrently
npm run busola                     # Frontend only
npm run backend                    # Backend only with hot-reload
```

### Build

```bash
npm run build                      # Frontend only (Vite)
npm run build:docker               # Frontend build with IS_DOCKER=true
cd backend && npm run build        # Backend webpack bundle (separate step; automated via Dockerfile)
```

### Testing

```bash
npm test                           # Unit tests (Vitest, jsdom)
npm run component-test             # Cypress component tests (interactive)
npm run component-test-headless    # Cypress component tests (CI)
cd backend && npm test             # Backend unit tests (Vitest, Node env)
```

Integration tests (Cypress, require a running cluster) live in `tests/integration/`:

```bash
cd tests/integration
npm run test:cluster               # Cluster-scoped + extensibility + companion tests
npm run test:namespace             # Namespace-scoped resource tests
npm run test:kyma-e2e              # Kyma-specific end-to-end tests
npm run test:accesibility          # Accessibility tests
```

These are the most important tests in the project — run them against a real cluster before merging changes that affect Kubernetes resource handling, routing, or UI flows.

### Linting

```bash
npm run eslint-check               # ESLint (src/ + backend/)
npm run eslint-fix                 # Auto-fix ESLint issues
npm run lint-check                 # Prettier check
npm run lint-fix                   # Auto-fix Prettier
```

## Architecture

### Frontend → Backend → Kubernetes

The browser loads the React SPA. All Kubernetes API calls go through the Express backend, which forwards them to the connected cluster's API server. The cluster connection token is stored **in memory only** (no cookies) and sent as a Bearer token.

### State Management — Jotai

Global state lives in `/src/state/` as individual Jotai atom files (`*Atom.ts`). Each concern is isolated (e.g., `clusterAtom`, `activeNamespaceIdAtom`, `themeAtom`, `extensionsAtom`). Always set `debugLabel` on atoms. Use `useAtomValue`, `useSetAtom`, or `useAtom` from `jotai` in components.

### Routing — React Router 7

Routes are defined in `/src/resources/` — one folder per Kubernetes resource type. Each resource's `index.tsx` exports config values (`resourceType`, `namespaced`, `apiGroup`, `apiVersion`, `category`, `List`, `Details`, `Create`). The root `/src/resources/index.tsx` maps these modules through `createResourceRoutes()` — a route builder function in `src/resources/createResourceRoutes.tsx` that returns `<Route>` elements for list/details/create.

There are two distinct routing trees: `ClusterRoutes.jsx` for cluster-scoped resources and `NamespaceRoutes` for namespaced resources. The `namespaced` boolean export on each resource's `index.tsx` determines which tree it lands in. The URL pattern for namespaced resources is `/cluster/:currentClusterName/namespaces/:namespaceId/[resource-type]`. Sidebar navigation is driven by `extensionsAtom` (not hard-coded).

### UI — SAP UI5 WebComponents

All UI components come from `@ui5/webcomponents-react` (SAP Fiori design system). Themes are loaded from `public/themes/`. The `copy-themes` script populates `public/themes/@sap-theming/` from node modules. Available themes: `light_dark` (system-adaptive default), `sap_horizon`, `sap_horizon_dark`, `sap_horizon_hcw`, `sap_horizon_hcb`. Icons from `@ui5/webcomponents-icons`.

### Backend Proxy

`backend/index.js` sets up the Express middleware chain: body-parser → (optional gzip) → (dev-only CORS) → pino logger → routes. The `/proxy` route handles external HTTPS proxying with rate limiting. Kubernetes API requests are handled separately by the `/backend` route via `backend/kubernetes/handler.js`. Special routes include `/backend/ai-chat/` (streaming AI companion) and `/backend/kubeconfig`.

`backend/config.js` merges feature flags from three YAML sources. The intended order (highest priority last) is:

1. `backend/settings/defaultConfig.yaml` (base defaults)
2. `backend/config/config.yaml` (when the file exists — in production this file is mounted from a Kubernetes ConfigMap)
3. `backend/environments/{ENVIRONMENT}/config.yaml` (when `ENVIRONMENT` env var is set; should win over all)

Note: the current code applies env config before config.yaml (steps 2 and 3 are swapped), which is a known bug.

There is also a separate `public/defaultConfig.yaml` that configures frontend storage defaults (e.g. `sessionStorage` vs `localStorage`). This is distinct from the backend config and is patched by the Dockerfile via `yq`.

### Extensibility

Extensions are loaded **client-side** in `src/state/navigation/extensionsAtom.ts` by fetching YAML files from the static asset path: `/extensions/extensions.yaml`, `/extensions/statics.yaml`, `/extensions/wizards.yaml`. Built-in extension definitions live in `public/extensions/`. Kyma-specific extensions live in `kyma/extensions/`.

Relevant feature flags (checked via `useFeature()`):

- `EXTENSIBILITY` — master toggle; **disabled by default** in `defaultConfig.yaml`, enabled in Kyma environment configs (`kyma/environments/*/config.yaml`)
- `EXTENSIBILITY_INJECTIONS` — controls injection points
- `EXTENSIBILITY_CUSTOM_COMPONENTS` — controls custom components
- `EXTENSIBILITY_WIZARD` — controls wizard extensions

### Feature Flags

Feature flags are defined in `backend/settings/defaultConfig.yaml` and consumed in **both** the backend and frontend:

- **Backend:** accessed directly via `config.features?.FLAG_NAME?.isEnabled` after `require('./config.js')`. Example: `config.features?.GZIP?.isEnabled` in `backend/index.js`.
- **Frontend:** accessed via the `useFeature('FLAG_NAME')` hook. Flags absent from config default to `isEnabled: false`.

Examples: `KYMA_COMPANION`, `GZIP`, `ALLOW_PRIVATE_IPS`, `EXTENSIBILITY`.

### Internationalization

Translation source files live at `public/i18n/[lang].yaml`. At runtime they are served and loaded from `/i18n/{{lng}}.yaml` via the i18next HTTP backend. Use the `useTranslation()` hook. Namespace separator is `::`.

## Adding a New Resource Type

1. Create `/src/resources/[ResourceType]/` with `[ResourceType]List.tsx`, `[ResourceType]Details.tsx`, `[ResourceType]Create.tsx`, and `index.tsx`.
2. `index.tsx` exports `resourceType`, `namespaced`, `apiGroup`, `apiVersion`, `category`, `List`, `Details`, `Create` (lazy-loaded), `ResourceDescription`, `i18nDescriptionKey`, `docsURL`, and optionally `resourceGraphConfig()` (graph relations to other resource types). It does **not** call `createResourceRoutes()` directly.
3. Add the module to the `resources` array in `/src/resources/index.tsx`; `createResourceRoutes()` is called there via `.map(createResourceRoutes)`.
4. The `namespaced` boolean determines whether the resource appears under `ClusterRoutes.jsx` or `NamespaceRoutes.tsx` — set it correctly or the resource will silently end up in the wrong routing tree.

## Testing Conventions

- Unit tests: `*.test.[jt]s?(x)` next to the source file (Vitest + Testing Library).
- Component tests: `*.cy.{js,jsx,ts,tsx}` (Cypress, Vite devserver).
- Backend tests: `backend/**/*.test.js` (Vitest, Node environment).

## Security Guidelines

- **XSRF:** Never store auth tokens as cookies; send as bearer tokens only. State-changing operations (`POST`/`PUT`/`DELETE`) must only trigger on explicit user actions — not during view navigation.
- **XSS:** Sanitize all user input before DOM insertion. Do not allow `unsafe-eval` in Content-Security-Policy headers.

## Commits

Use Conventional Commits: `<type>(<scope>): <description>`.  
Common types: `feat`, `fix`, `chore`, `refactor`, `test`, `ci`, `docs`.  
Never mention Claude or any AI tool in commit messages.

## Key Files

| File                                     | Purpose                                                         |
| ---------------------------------------- | --------------------------------------------------------------- |
| `src/index.tsx`                          | App bootstrap: i18next, router, theme provider                  |
| `src/components/App/App.tsx`             | Root layout, auth, cluster setup                                |
| `src/components/App/ClusterRoutes.jsx`   | Cluster-scoped routing tree                                     |
| `src/components/App/NamespaceRoutes.tsx` | Namespace-scoped routing tree                                   |
| `src/resources/index.tsx`                | Aggregates all resource modules, calls `createResourceRoutes()` |
| `src/resources/createResourceRoutes.tsx` | Route builder function for resource CRUD                        |
| `backend/index.js`                       | Express app and middleware chain                                |
| `backend/kubernetes/handler.js`          | Kubernetes API handler                                          |
| `backend/config.js`                      | Feature flag / config loader (3-source YAML merge)              |
| `public/defaultConfig.yaml`              | Frontend storage config (patched by Dockerfile)                 |
| `vite.config.mts`                        | Frontend bundler config                                         |
| `tsconfig.json`                          | TypeScript config (`baseUrl: src` enables path aliases)         |
| `eslint.config.ts`                       | ESLint flat config                                              |
