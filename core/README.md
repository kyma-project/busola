# Busola Core

## Overview

This is the application responsible for hosting all the views inside the [Luigi](https://luigi-project.io/) main frame. It provides the configuration for [Luigi-Core](https://github.com/SAP/luigi/tree/master/core) which combines static configuration with the data from the cluster (e.g. `Microfrontends`).

## Installation

To install Core together with Busola, run the `npm run bootstrap:ci` command in the root directory.

You can also install dependencies just for this app using the `npm ci` command.

## Usage

Run the `npm start` command in the root folder (../) to start Core along with other apps (which altogether form Busola).

You can also start this app individually by running the `npm start` command. The app will be available at the [http://localhost:8080](http://localhost:8080) address.

### Code style

Your contributions must match the style guide used in Busola. Busola uses [Prettier](https://prettier.io) for code formatting. For convenience, [husky](https://github.com/typicode/husky) installs the Git pre-commit hook, so you do not need to perform any additional work. Remember to run `npm ci` in the root folder (../) of this repository to install both tools.
