[![REUSE status](https://api.reuse.software/badge/github.com/kyma-project/busola)](https://api.reuse.software/info/github.com/kyma-project/busola)

# Busola

## Overview

Busola is a web-based UI for managing resources within a Kubernetes cluster. It's based on the [ReactJS](https://reactjs.org/) library.

### Subcomponents

The Busola project contains additional sub-projects:

- [`Backend`](./backend) - A proxy between Busola and the Kubernetes cluster
- [`Tests`](./tests) - Acceptance, regression, and integration tests
- [`Kyma`](./kyma) - Kyma-specific configuration for Busola

## Prerequisites

- [`npm`](https://www.npmjs.com/) in version 10.x
- [`node`](https://nodejs.org/en/) in version 22.x

## Installation

To install dependencies for the root and backend projects, and to prepare symlinks for local libraries within this repository, run the following command:

```bash
npm install
```

To learn how to install the dashboard with Istio Ingress and install it in a Kyma cluster, see [Install Kyma Dashboard Manually](docs/install-kyma-dashboard-manually.md).

## Usage

Run the `npm start` command.

## Related Information

- For more information on the Busola configuration, see [Configuration](docs/operator/configuration.md).
- For more information on using Busola for development, see [Development](docs/contributor/development.md).
- To learn how to run Busola in Docker, see [Busola in Docker](docs/contributor/busola-docker.md).
- To learn how to deploy and access Busola in the Kubernetes cluster, see [Deploying and Accessing Busola in the Kubernetes Cluster](docs/operator/deploy-access-kubernetes.md).
- For more information on troubleshooting Busola, see [Troubleshooting](docs/contributor/troubleshooting.md).

## Contributing

See the [Contributing Rules](CONTRIBUTING.md).

## Code of Conduct

See the [Code of Conduct](CODE_OF_CONDUCT.md) document.

## Licensing

See the [license](./LICENSE) file.
