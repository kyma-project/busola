# Tests

## Overview

This project contains smoke, integration UI, accessibility and Kyma-related tests for Busola.

## Prerequisites

Before testing, you need to copy your cluster's kubeconfig file to `fixtures/kubeconfig.yaml`.

For tests that start with `kyma-`, run Busola using Docker, PR number, and - optionally - your desired environment:

```bash
PR_NUMBER={YOUR_PR_NUMBER} ENV={DESIRED_ENV} npm run run-docker
```

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

## Accessibility Tests

## Prerequisites

Before testing, copy your cluster's kubeconfig file to `fixtures/kubeconfig.yaml`.

Also you need `ACC_AMP_TOKEN` to submit your generated accessibility report to AMP Prtal.

### Run Accessibility Tests in the Headless Mode

To run the tests, pointing to a `local Busola` instance, use this command:

```bash
ACC_AMP_TOKEN={YOUR_AMP_TOKEN} npm run test:accesibility:local
```

### Run Accessibility tests in the test runner mode

To open the `tests runner`, pointing to a `local Busola` instance, use this command:

```bash
ACC_AMP_TOKEN={YOUR_AMP_TOKEN} npm run start:local
```
