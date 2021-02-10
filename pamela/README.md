# Pamela

## Overview

This is a REST proxy for the Console

## Prerequisites

- Node.js v12
- npm or Yarn

## Installation

To install Pamela together with the Console, run the `npm run bootstrap` command in the root directory.

## Usage

Run the `npm run watch` or `npm start` command to use Pamela locally. To do so, you must provide the KUBECONFIG environment variable. You can also use the `docker build` command to use Pamela as an image of a Kubernetes Pod.

## Development

Use `npm run watch` command to run Pamela in the unsafe mode (no TLS certificate) and with the _watch_ mode on.
To do so, the KUBECONFIG environment variable **must be provided**.
