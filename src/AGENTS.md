# Frontend Agent Instructions

This file provides frontend-specific guidance for agents working in `src/`. For project-wide instructions see the root [`AGENTS.md`](../AGENTS.md).

## Architecture

### State Management — Jotai

Global state lives in `state/` as individual Jotai atom files (`*Atom.ts`). Each concern is isolated (e.g., `clusterAtom`, `activeNamespaceIdAtom`, `themeAtom`, `extensionsAtom`). Always set `debugLabel` on atoms. Use `useAtomValue`, `useSetAtom`, or `useAtom` from `jotai` in components.

### Routing — React Router 7

Routes are defined in `resources/` — one folder per Kubernetes resource type. Each resource's `index.tsx` exports config values (`resourceType`, `namespaced`, `apiGroup`, `apiVersion`, `category`, `List`, `Details`, `Create`). The root `resources/index.tsx` maps these modules through `createResourceRoutes()` — a route builder function in `resources/createResourceRoutes.tsx` that returns `<Route>` elements for list/details/create.

There are two distinct routing trees: `components/App/ClusterRoutes.jsx` for cluster-scoped resources and `components/App/NamespaceRoutes.tsx` for namespaced resources. The `namespaced` boolean export on each resource's `index.tsx` determines which tree it lands in. The URL pattern for namespaced resources is `/cluster/:currentClusterName/namespaces/:namespaceId/[resource-type]`. Sidebar navigation is driven by `extensionsAtom` (not hard-coded).

### UI — SAP UI5 WebComponents

All UI components come from `@ui5/webcomponents-react` (SAP Fiori design system). Themes are served from `public/themes/` — this directory is populated at build time by the `copy-themes` script, which copies CSS from node modules into `public/themes/@sap-theming/`. Available themes: `light_dark` (system-adaptive default), `sap_horizon`, `sap_horizon_dark`, `sap_horizon_hcw`, `sap_horizon_hcb`. Icons from `@ui5/webcomponents-icons`.

### Feature Flags

Frontend feature flags are checked at runtime via the `useFeature('FLAG_NAME')` hook. Flag definitions are loaded from `public/defaultConfig.yaml` (served as `/defaultConfig.yaml` at runtime) — this is a frontend-only config file distinct from the backend config. A per-cluster override can also come from the `kube-public/busola-config` ConfigMap on the target cluster, which Busola fetches during bootstrap. Flags absent from config default to `isEnabled: false`. Examples: `KYMA_COMPANION`, `EXTENSIBILITY`.

### Extensibility

Extensions are loaded **client-side** in `state/navigation/extensionsAtom.ts` by fetching YAML files from the static asset path: `/extensions/extensions.yaml`, `/extensions/statics.yaml`, `/extensions/wizards.yaml`. Built-in extension definitions live in `public/extensions/`. Kyma-specific extensions live in `kyma/extensions/`.

Relevant feature flags (checked via `useFeature()`):

- `EXTENSIBILITY` — master toggle; **enabled by default** in `public/defaultConfig.yaml`
- `EXTENSIBILITY_INJECTIONS` — controls injection points
- `EXTENSIBILITY_CUSTOM_COMPONENTS` — controls custom components
- `EXTENSIBILITY_WIZARD` — controls wizard extensions

### Internationalization

Translation source files live at `public/i18n/[lang].yaml`. At runtime they are served and loaded from `/i18n/{{lng}}.yaml` via the i18next HTTP backend. Use the `useTranslation()` hook. Namespace separator is `::`.

## Adding a New Resource Type

1. Create `resources/[ResourceType]/` with `[ResourceType]List.tsx`, `[ResourceType]Details.tsx`, `[ResourceType]Create.tsx`, and `index.tsx`.
2. `index.tsx` exports `resourceType`, `namespaced`, `apiGroup`, `apiVersion`, `category`, `List`, `Details`, `Create` (lazy-loaded), `ResourceDescription`, `i18nDescriptionKey`, `docsURL`, and optionally `resourceGraphConfig()` (graph relations to other resource types). It does **not** call `createResourceRoutes()` directly.
3. Add the module to the `resources` array in `resources/index.tsx`; `createResourceRoutes()` is called there via `.map(createResourceRoutes)`.
4. The `namespaced` boolean determines whether the resource appears under `ClusterRoutes.jsx` or `NamespaceRoutes.tsx` — set it correctly or the resource will silently end up in the wrong routing tree.

## Testing Conventions

- Unit tests: `*.test.[jt]s?(x)` (Vitest + Testing Library). Most live next to the source file; some are grouped under a `test/` or `tests/` subdirectory within the same module.
- Component tests: `*.cy.{js,jsx,ts,tsx}` (Cypress, Vite devserver).

## Key Files

| File                                 | Purpose                                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| `index.tsx`                          | App bootstrap: i18next, router, theme provider                  |
| `components/App/App.tsx`             | Root layout, auth, cluster setup                                |
| `components/App/ClusterRoutes.jsx`   | Cluster-scoped routing tree                                     |
| `components/App/NamespaceRoutes.tsx` | Namespace-scoped routing tree                                   |
| `resources/index.tsx`                | Aggregates all resource modules, calls `createResourceRoutes()` |
| `resources/createResourceRoutes.tsx` | Route builder function for resource CRUD                        |
| `public/defaultConfig.yaml`          | Frontend storage config (patched by Dockerfile)                 |
| `vite.config.mts`                    | Frontend bundler config                                         |
| `tsconfig.json`                      | TypeScript config (`baseUrl: src` enables path aliases)         |
| `eslint.config.ts`                   | ESLint flat config                                              |
