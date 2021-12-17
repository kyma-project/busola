# Busola

## Overview

Busola is a web-based UI for managing resources within Kyma or any Kubernetes cluster. It consists of separate frontend applications.

### Components

Busola project consists of the following UI projects:

- [`Core`](./core) - The main frame
- [`Service-Catalog-UI`](./service-catalog-ui) - The UI layer for Service Catalog, Instances and Brokers
- [`Backend`](./backend) - A kind of a proxy between Busola and the Kubernetes cluster
- [`Tests`](./tests) - Acceptance and end-to-end tests

## Prerequisites

- [`npm`](https://www.npmjs.com/): >= 6.14.12
- [`node`](https://nodejs.org/en/): >= 14.16.1

## Installation

To install dependencies for the root and all UI projects, and to prepare symlinks for local libraries within this repository, run the following command:

```bash
npm run bootstrap:ci
```

> **NOTE:** The `npm run bootstrap:ci` command:
>
> - Installs root dependencies provided in the [`package.json`](./package.json) file.
> - Installs dependencies for the [libraries](#components).
> - Builds all the [libraries](#components).

Visit [Install Kyma Dashboard manually](docs/install_dashboard_manually.md) to learn how to install the Dashboard with Istio Ingress and how to install it on a Kyma cluster.

## Configuration

Learn about the [default configuration](#default-configuration) in Busola and [how to change it](#change-the-configuration).

### Default Configuration

Busola is delivered with the following default settings:

| Parameter                  | Comment                                                                                                                                           | Default Value                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hiddenNamespaces`         | A list of Namespace names that are considered system, and are hidden by default.                                                                  | default list: `compass-system`, `istio-system`, `kube-public`, `kube-system`, `kyma-backup`, `kyma-installer`, `kyma-integration`, `kyma-system`, `natss`, `kube-node-lease`, `kubernetes-dashboard`, `serverless-system` |
| `features`                 | Switches a set of Busola features on and off. Use selectors to configure conditions for the features. To switch them off, set `isEnabled=false`.  | `isEnabled=true`                                                                                                                                                                                                          |
| `navigation.disabledNodes` | Array of IDs of navigation nodes that are hidden from navigation. Format: `<category>.<nodeName>` or `<namespace>.<category>.<nodeName>`)         | empty                                                                                                                                                                                                                     |
| `navigation.externalNodes` | A nested list of links to external websites. `category`, `icon`: a category name and optional icon / `children`: a list of pairs (label and link) | category: `Learn more` / children: `Kyma Documentation`, `Our Slack`, `Github`                                                                                                                                            |
| `version`                  | Configuration version. Don’t edit this. Can be empty.                                                                                             | the most recent release                                                                                                                                                                                                   |

### Configuration sources

Busola configuration is the product of gathering and merging the configurations from several individual sources. The following list presents the sources in the order of precedence:

- Built-in, hardcoded defaults.
- Busola cluster configuration, available on the Busola cluster in ConfigMap "busola/busola-config" under the key "config". This data is mounted to the Busola `web` pod, and during the local development, the [config.json](core/src/assets/config/config.json) file is used.
- Target cluster configuration, available on the target cluster in ConfigMap "kube-public/busola-config" under the key "config". Busola performs a request for that resource during the bootstrap process.

### Change the Configuration

If you have the required authorizations and access to the kubeconfig, you can change the settings for the Busola cluster configuration and the target cluster configuration.

With the `feature` toggles, you can switch each Busola feature on or off and configure them to fit your needs.
Features comprise the following elements:

- `FEATURE_ID`: Unique identifier, as defined in the Busola source code
- `selector`: The k8s resources that can activate the feature
- `isEnabled`: Activates or deactivates the feature, overwriting the status set by `selector`
- `config`: Provides additional configuration options as needed for each feature. For details, see the README in the specific component or feature.

See the available Busola [feature flags](docs/features.md) for more information.

## Development

### Start all views

Use the following command to run Busola with the [`core`](./core) and all other views locally:

```bash
npm run start
```

After a while, open the [http://localhost:8080](http://localhost:8080) address in your browser, and provide your kubeconfig in the **Connect cluster** wizard.

Once you started Busola locally, you can begin the development. All modules have the hot-reload feature enabled, therefore, you can edit the code in real-time and see the changes in your browser.

The apps you started run at the following addresses:

- `Core` - [http://localhost:8080](http://localhost:8080)
- `Core-UI` - [http://localhost:8889](http://localhost:8889)
- `Service-Catalog-UI` - [http://localhost:8000](http://localhost:8000)
- `Backend` - [http://localhost:3001](http://localhost:3001)

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

## Busola in Docker: adding a cluster via kubeconfig ID

1. If you run Busola in Docker, you can mount your kubeconfig as a bind mount for Busola container. Execute the following command:

   ```bash
   docker run --rm -it -p 3001:3001 -v <path to your kubeconfig>:/app/core/kubeconfig/<your kubeconfig file name> --pid=host --name busola eu.gcr.io/kyma-project/busola:latest
   ```

2. When you open Busola in your browser, go to `http://localhost:3001?kubeconfigID={YOUR_KUBECONFIG_FILE_NAME}`. Busola will try to download that file and add it for your Busola instance.

## Troubleshooting

> **TIP:** To solve most of the problems with Busola development, clear the browser cache or do a hard refresh of the website.

### Symptom

You are experiencing connectivity problems with Busola in Docker against a k3d cluster.

### Cause

When the k3d cluster's API server is exposed on the `0.0.0.0` address on you machine, Busola in Docker interprets `0.0.0.0` as its internal Docker address, routing the requests to the wrong endpoint.

### Remedy

- For Docker Desktop for Mac and Windows, pass `DOCKER_DESKTOP_CLUSTER=true` on dockerized Busola startup. This way, `0.0.0.0` is automatically replaced with `host.docker.internal`.

  ```bash
  docker run --rm -it -p 3001:3001 -e DOCKER_DESKTOP_CLUSTER=true --pid=host --name busola eu.gcr.io/kyma-project/busola:latest
  ```

- For Linux, run Busola with `--net=host` (omitting the `-p` parameter).

  ```bash
  docker run --rm -it --net=host --pid=host --name busola eu.gcr.io/kyma-project/busola:latest
  ```
