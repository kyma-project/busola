# Busola Core-UI

## Overview

This is the application responsible for serving most of the views for Busola. It's based on the [ReactJS](https://reactjs.org/) library.

## Installation

To install Core-UI together with Busola, run the `npm run bootstrap:ci` command in the root directory.

You can also install dependencies just for this app via the `npm ci` command.

## Usage

Run the `npm start` command in the root folder (../) to start Core along with other apps (which forms Busola altogether).

You can also start this app individually by performing `npm start` command. The app will be available at the [http://localhost:8889](http://localhost:8889) address.

### Code style

Your contributions must match the style guide used in Busola. Busola uses [Prettier](https://prettier.io) for code formatting. For convenience, [husky](https://github.com/typicode/husky) installs the Git pre-commit hook, so you do not need to perform any additional work. Remember to run `npm ci` in the root folder (../) of this repository, to install both tools.
