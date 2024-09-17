# Kyma Dashboard

## Overview
The directory contains the configuration of Kyma extensibility for Busola and tools to prepare the configuration for building Kyma dashboard using Busola.

Files structure:
```
./extensions/
├── ...
./environments/
├── dev
│   ├── config.yaml
│   ├── extensions.json
│   ├── statics.json
│   └── wizards.json
├── prod
│   ├── config.yaml
│   ├── extensions.json
│   ├── statics.json
│   └── wizards.json
└── stage
    ├── config.yaml
    ├── extensions.json
    ├── statics.json
    └── wizards.json

3 directories, 12 files
```

The `environments` directory contains configuration per environment. 
The environment configuration contains `config.yaml` for Busola and `extensions.json`, `statics.json`, and `wizards.json` with a list of extensibility configurations.
The entries for extensibility can be `relative path to Kyma directory` or `URL to extension yaml`.

The `extensions` directory contains a general extensibility configuration to avoid duplication in each environment configuration directory.

## Prerequisites

- [`npm`](https://www.npmjs.com/) in version 10.x
- [Node.js](https://nodejs.org/en/) in version 20.x
- [Make](https://www.gnu.org/software/make/)

## Installation

```bash
npm clean-install
```

## Usage

To prepare the final configuration for Busola, run:
```bash
make prepare-all-configuration
```

This target fetches and copies the configuration file to the `temp` directory.
Then, all the files are merged and moved to the final `build` directory.
