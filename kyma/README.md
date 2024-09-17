# Kyma dashboard

## Overview
The directory contains configuration of kyma extensibility for busola and tools to prepare configuration to build Kyma-dashboard using busola.

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

The **environments** directory contains configuration per environment. 
The environment configuration contains **config.yaml** for busola and **extensions.json**, **statics.json**, **wizards.json** with list of extensibility configuration.
The entries for extensibility can be **relative path to kyma** directory or **URL to extension yaml**.

The **extensions** directory contains general extensibility configuration to avoid duplication in each environment configuration dir.

## Prerequisites

- [`npm`](https://www.npmjs.com/) in version 10.x
- [`node`](https://nodejs.org/en/) in version 20.x
- [`make`](https://www.gnu.org/software/make/)

## Installation

```bash
npm clean-install
```

## Usage

To prepare final configuration for busola run:
```bash
make prepare-all-configuration
```

This target fetches and copies configuration file to **temp** directory.
Then all the files are merged and moved to final **build** directory.
