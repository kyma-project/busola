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
