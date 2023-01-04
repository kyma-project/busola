# Tests

## Overview

This project contains smoke and integration UI tests for Busola.

## Prerequisites

Before testing, you need to copy your cluster's kubeconfig file to `fixtures/kubeconfig.yaml`.

## Installation

To install dependencies, run the `npm install` command.

## Development

### Run Cypress UI tests in the headless mode

To run Cypress UI tests using a Chrome browser in `headless mode`,
pointing to a `remote Busola` cluster with the default `local.kyma.dev` domain, use this command:

```bash
npm test
```

To run the tests, pointing to a `remote Busola` cluster with `custom` domain, use this command:

```bash
CYPRESS_DOMAIN={YOUR_DOMAIN} npm test
```

To run the tests, pointing to a `local Busola` instance, use this command:

```bash
npm run test:local
```

### Run Cypress UI tests in the test runner mode

To open Cypress UI `tests runner`,
pointing to a `remote Busola` cluster with the default `local.kyma.dev` domain, use this command:

```bash
npm run start
```

To open the `tests runner`, pointing to a `remote Busola` cluster with `custom` domain, use this command:

```bash
CYPRESS_DOMAIN={YOUR_DOMAIN} npm start
```

To open the `tests runner`, pointing to a `local Busola` instance, use this command:

```bash
npm run start:local
```

### Login via OIDC to a cluster (optional)

If a cluster requires an OIDC authentication, include these additional arguments while lunching tests, for example:

```bash
CYPRESS_OIDC_PASS={YOUR_PASSWORD} CYPRESS_OIDC_USER={YOUR_USERNAME} npm start
```
