# Tests

## Overview

This project contains UI smoke tests for Busola. Copy your cluster's kubeconfig file to [`fixtures/kubeconfig.yaml`](fixtures/kubeconfig.yaml).

## Installation

To install dependencies, run the `npm install` command.

## Development

To run UI tests inside a container in the cluster using a Chrome browser, use this command:

```bash
npm run test:cluster
```

To run UI tests on a cluster, use this command:

```bash
CYPRESS_DOMAIN={YOUR_DOMAIN} npm start
```

To run UI tests on a local instance, use this command:

```bash
npm run start:local
```
