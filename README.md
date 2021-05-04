# Busola

## Overview

Busola is a web-based UI for managing resources within Kyma or any Kubernetes cluster. It consists of separate frontend applications.

### Components

Busola project consists of the following UI projects:

- [`Core`](./core) - The main frame
- [`Service-Catalog-UI`](./service-catalog-ui) - The UI layer for Service Catalog, Instances and Brokers
- [`Log UI`](./logging) - The logs view
- [`Backend`](./backend) - A kind of a proxy between Busola and the Kubernetes cluster
- [`Tests`](./tests) - Acceptance and end-to-end tests

## Prerequisites

- [`npm`](https://www.npmjs.com/): >= 6.4.0
- [`node`](https://nodejs.org/en/): >= 12.0.0

## Installation

> **CAUTION:** You don't have to perform any manual installation steps to use Busola in the NPX mode. See the [Usage](#usage) section for details.

To install dependencies for the root and all UI projects, and to prepare symlinks for local libraries within this repository, run the following command:

```bash
npm run bootstrap:ci
```

> **NOTE:** The `npm run bootstrap:ci` command:
>
> - Installs root dependencies provided in the [`package.json`](./package.json) file.
> - Installs dependencies for the [libraries](#components).
> - Builds all the [libraries](#components).

## Usage

### Usage with NPX

This mode has no hot-reload feature so it's not designed for the development. Hovewer, it gives you the ability to run Busola in a few seconds with one command.

To run Busola in the `npx` mode from the latest release you have to provide `KUBECONFIG` environment variable pointing to a valid KUBECONFIG file, then type `npx @kyma-project/busola@latest` in your terminal. That's it, your default browser should open Busola within a few seconds.

### Usage without NPX

See the [Development](#development) section.

## Development

### Start all views

Use the following command to run Busola with the [`core`](./core) and all other views locally:

```bash
npm run start
```

After a while, open the [http://localhost:4200](http://localhost:4200) address in your browser, and add your **init params** to the address to make it look like `http://localhost:4200?init=yourInitParams`. You can generate the params with [this generator](http://enkode.surge.sh/).

Once you started Busola locally, you can begin the development. All modules have the hot-reload feature enabled, therefore, you can edit the code in real-time and see the changes in your browser.

The apps you started run at the following addresses:

- `Core` - [http://localhost:4200](http://localhost:4200)
- `Core-UI` - [http://localhost:8889](http://localhost:8889)
- `Log UI` - [http://localhost:4400](http://localhost:4400)
- `Service-Catalog-UI` - [http://localhost:8000](http://localhost:8000)
- `Backend` - [http://localhost:3001](http://localhost:3001)

### Build the NPX package of Busola

To build and run Busola for the `npx` mode:

- Run `npm run build` in `/shared`.
- Run `npm run build:npx` in `/core`, `/core-ui` and `/backend`.
- Export a kubeconfig in your terminal.
- Run `node index-npx.js` in `/backend` to start the app.

### Security countermeasures

When developing new features in Busola UI, adhere to the following rules. This will help you to mitigate any security-related threats.

1. Prevent cross-site request forgery (XSRF).

   - Do not store the authentication token as a cookie. Make sure the token is sent to Busola backend as a bearer token.
   - Make sure that the state-changing operations (`POST`, `PUT`, `DELETE`, and `UPDATE` requests) are only triggered upon explicit user interactions, such as form submissions.
   - Keep in mind that UI rendering in response to the user navigating between views is only allowed to trigger read-only operations (`GET` requests) without any data mutations.

2. Protect against cross-site scripting (XSS).

   - It is recommended to use JS frameworks that have built-in XSS prevention mechanisms, such as [ReactJS](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks), [Vue.js](https://vuejs.org/v2/guide/security.html#What-Vue-Does-to-Protect-You), or [Angular](https://angular.io/guide/security#angulars-cross-site-scripting-security-model).
   - As a rule of thumb, you cannot perceive user input to be 100% safe. Get familiar with prevention mechanisms included in the framework of your choice. Make sure the user input is sanitized before it is embedded in the DOM tree.
   - Get familiar with the most common [XSS bypasses and potential dangers](https://stackoverflow.com/questions/33644499/what-does-it-mean-when-they-say-react-is-xss-protected). Keep them in mind when writing or reviewing the code.
   - Enable the `Content-security-policy` header for all new micro frontends to ensure in-depth XSS prevention. Do not allow for `unsafe-eval` policy.

### Run tests

For the information on how to run tests and configure them, go to the [`tests`](tests) directory.

## Troubleshooting

> **TIP:** To solve most of the problems with Busola development, clear the browser cache or do a hard refresh of the website.
