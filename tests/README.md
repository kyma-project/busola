# Tests

## Overview

This project contains smoke and integration UI tests for Busola. Copy your cluster's kubeconfig file to [`fixtures/kubeconfig.yaml`](fixtures/kubeconfig.yaml).

## Installation

To install dependencies, run the `npm install` command.

## Development

### Run Cypress UI tests in the headless mode

To run Cypress UI tests using a Chrome browser in `headless mode`,
pointing to `remote Busola` cluster with default `local.kyma.dev` domain, use this command:

```bash
npm test
```

Pointing to `remote Busola` cluster with `custom` domain, use this command:

```bash
CYPRESS_DOMAIN={YOUR_DOMAIN} npm test
```

Pointing to `local Busola` instance, use this command:

```bash
npm run test:local
```

### Run Cypress UI tests in the test runner mode

To open Cypress UI `tests runner`,
pointing to `remote Busola` cluster with default `local.kyma.dev` domain, use this command:

```bash
npm run start
```

Pointing to `remote Busola` cluster with `custom` domain, use this command:

```bash
CYPRESS_DOMAIN={YOUR_DOMAIN} npm start
```

Pointing to `local Busola` instance, use this command:

```bash
npm run start:local
```
