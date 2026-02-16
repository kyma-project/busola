# Busola backend

## Overview

This is a REST proxy for Busola

## Prerequisites

- Node.js v12
- npm or Yarn

## Installation

To install the backend together with Busola, run the `npm run bootstrap:ci` command in the root directory.

You can also install dependencies just for this app using the `npm ci` command.

## Usage

The primary usage of this component is to run it together with Busola using the `npm start` command in the root directory. However, you can run it separately if needed.

To start Busola backend without the hot-reload feature, run `npm start`.

Another way to start Busola backend is by using the hot-reload feature that is useful for the development process. See the [Development](#development) section for details.

You can also use the `docker build` command to use the backend as an image of a Kubernetes Pod.

## Development

Use the `npm run watch` command to run the backend in the unsafe mode (no TLS certificate) and with the hot-reload feature.

## Configuration

### Feature Flags

The backend supports feature flags configured via YAML files. Configuration is loaded in this order:

1. `settings/defaultConfig.yaml` (base configuration)
2. `environments/{ENVIRONMENT}/config.yaml` (environment-specific overrides, when ENVIRONMENT is set)
3. `config/config.yaml` (Kubernetes cluster-level overrides, mounted as ConfigMap in production)

**For local development:** Edit `settings/defaultConfig.yaml` directly (avoid committing local changes). The `config/config.yaml` file is a symlink used only in Kubernetes deployments.

#### Available Feature Flags

Backend feature flags include:

- **GZIP** - Response compression (default: enabled)
- **KYMA_COMPANION** - Kyma Companion AI assistant configuration
- **ALLOW_PRIVATE_IPS** - Control private IP access for local development (default: disabled, secure)

**For detailed configuration, defaults, and security considerations, see [docs/features.md](../docs/features.md#features-list-for-backend).**
