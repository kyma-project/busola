[![REUSE status](https://api.reuse.software/badge/github.com/kyma-project/busola)](https://api.reuse.software/info/github.com/kyma-project/busola)

# Busola

## Overview

Busola is a web-based UI for managing resources within a Kubernetes cluster. It's based on the [ReactJS](https://reactjs.org/) library.

### Subcomponents

Busola project contains additional sub-projects:

- [`Backend`](./backend) - A kind of a proxy between Busola and the Kubernetes cluster
- [`Tests`](./tests) - Acceptance, regression and integration tests
- [`Kyma`](./kyma) - Kyma specific configuration for Busola

## Prerequisites

- [`npm`](https://www.npmjs.com/) in version 10.x
- [`node`](https://nodejs.org/en/) in version 22.x

## Installation

To install dependencies for the root and backend projects, and to prepare symlinks for local libraries within this repository, run the following command:

```bash
npm install
```

Read [Install Kyma Dashboard manually](docs/install-kyma-dashboard-manually.md) to learn how to install the Dashboard with Istio Ingress and how to install it on a Kyma cluster.

## Configuration

For more information on the Busola configuration, see [Configuration](docs/contributor/configuration.md)

## Usage

Run the `npm start` command.

## Contributing

See the [Contributing Rules](CONTRIBUTING.md).

## Code of Conduct

See the [Code of Conduct](CODE_OF_CONDUCT.md) document.

## Licensing

See the [license](./LICENSE) file.
