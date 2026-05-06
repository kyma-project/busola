# Agent Instructions

This file is the primary instruction surface for agents contributing to Busola. It is injected into your context on every interaction.

For frontend-specific guidance see [`src/AGENTS.md`](src/AGENTS.md).
For backend-specific guidance see [`backend/AGENTS.md`](backend/AGENTS.md).

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
npm test                           # Frontend unit tests (Vitest, jsdom)
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

## Architecture Overview

The browser loads the React SPA. All Kubernetes API calls go through the Express backend, which forwards them to the connected cluster's API server. The cluster connection token is stored **in memory only** (no cookies) and sent as a Bearer token.

## Security Guidelines

- **XSRF:** Never store auth tokens as cookies; send as bearer tokens only. State-changing operations (`POST`/`PUT`/`DELETE`) must only trigger on explicit user actions — not during view navigation.
- **XSS:** Sanitize all user input before DOM insertion. Do not allow `unsafe-eval` in Content-Security-Policy headers.

## Commits

Use Conventional Commits: `<type>(<scope>): <description>`.  
Common types: `feat`, `fix`, `chore`, `refactor`, `test`, `ci`, `docs`.  
Never mention Claude or any AI tool in commit messages.
