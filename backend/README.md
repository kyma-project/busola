# Busola backend

## Overview

This is a REST proxy for Busola

## Prerequisites

- Node.js v12
- npm or Yarn

## Installation

To install backend together with Busola, run the `npm run bootstrap:ci` command in the root directory.

You can also install dependencies just for this app via the `npm ci` command.

## Usage

The primary usage of this component is to run it together with Busola (via the `npm start` command in the root directory). However, you can run it separately if needed.

To start Busola Backend without the hot-reload feature, simply run the `npm start`.

Another way to start Busola Backend uses the **hot-reload** feature (useful for the development process) - see the [Develompent](#development) section.

You can also use the `docker build` command to use backend as an image of a Kubernetes Pod.

## Development

Use `npm run watch` command to run backend in the unsafe mode (no TLS certificate) and with the _hot-reload_ feature.
