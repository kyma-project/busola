# Tests

## Overview

This project contains integration and smoke UI tests for Kyma-Dashboard.

## Prerequisites

Before testing, you need to copy your cluster's kubeconfig file to `fixtures/kubeconfig.yaml`.

You need to have ran Kyma-Dashboard using docker and PR number:

```bash
PR_NUMBER={YOUR_PR_NUMBER} npm run run-docker
```

## Installation

To install dependencies, run the `npm install` command.

## Development

### Run Cypress UI tests in the headless mode

To run Cypress UI tests using a Chrome browser in `headless mode`,
pointing to a `remote Kyma-Dashboard` cluster with the default `local.kyma.dev` domain, use this command:

```bash
npm test
```

To run the tests, pointing to a `remote Kyma-Dashboard` cluster with `custom` domain, use this command:

```bash
CYPRESS_DOMAIN={YOUR_DOMAIN} npm test
```

To run the tests, pointing to a `local Kyma-Dashboard` instance, use this command:

```bash
npm run test:local
```

### Run Cypress UI tests in the test runner mode

To open Cypress UI `tests runner`,
pointing to a `remote Kyma-Dashboard` cluster with the default `local.kyma.dev` domain, use this command:

```bash
npm run start
```

To open the `tests runner`, pointing to a `remote Kyma-Dashboard` cluster with `custom` domain, use this command:

```bash
CYPRESS_DOMAIN={YOUR_DOMAIN} npm run start
```

To open the `tests runner`, pointing to a `local Kyma-Dashboard` instance, use this command:

```bash
npm run start:local
```

### Smoke tests

To run smoke tests, pointing to a local Kyma-Dashboard instance, use this command:

```bash
test:smoke-extensions
```

### Login via OIDC to a cluster (optional)

If a cluster requires an OIDC authentication, include these additional arguments while lunching tests, for example:

```bash
CYPRESS_OIDC_PASS={YOUR_PASSWORD} CYPRESS_OIDC_USER={YOUR_USERNAME} npm start
```
