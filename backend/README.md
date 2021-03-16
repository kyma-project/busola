# Busola backend

## Overview

This is a REST proxy for the Busola

## Prerequisites

- Node.js v12
- npm or Yarn

## Installation

To install backend together with the Busola, run the `npm run bootstrap` command in the root directory.

## Usage

Run the `npm run watch` or `npm start` command to use the backend locally. To do so, you must provide the KUBECONFIG environment variable. You can also use the `docker build` command to use backend as an image of a Kubernetes Pod.

## Development

Use `npm run watch` command to run backend in the unsafe mode (no TLS certificate) and with the _watch_ mode on.
To do so, the KUBECONFIG environment variable **must be provided**.
