[![REUSE status](https://api.reuse.software/badge/github.com/kyma-project/busola)](https://api.reuse.software/info/github.com/kyma-project/busola)

# Busola

## Overview

Busola is a web-based UI for managing resources within a Kubernetes cluster. It's based on the [ReactJS](https://reactjs.org/) library.

### Subcomponents

Busola project contains additional sub-projects:

- [`Backend`](./backend) - A kind of a proxy between Busola and the Kubernetes cluster
- [`Tests`](./tests) - Acceptance, regression and integration tests
- [`Kyma`](./kyma) - Kyma specific configuration for busola

## Prerequisites

- [`npm`](https://www.npmjs.com/) in version 10.x
- [`node`](https://nodejs.org/en/) in version 20.x

Busola supports:

- [Kyma](https://kyma-project.io/) in version 2.4.2 or higher
- [Istio](https://istio.io/) in version `v1beta1`

## Installation

To install dependencies for the root and backend projects, and to prepare symlinks for local libraries within this repository, run the following command:

```bash
npm install
```

Read [Install Kyma Dashboard manually](docs/install-kyma-dashboard-manually.md) to learn how to install the Dashboard with Istio Ingress and how to install it on a Kyma cluster.

## Usage

Run the `npm start` command.

## Configuration

Learn about the [default configuration](#default-configuration) in Busola and [how to change it](#change-the-configuration).

### Default Configuration

Busola is delivered with the following default settings:

| Parameter  | Comment                                                                                                                                          | Default Value           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `features` | Switches a set of Busola features on and off. Use selectors to configure conditions for the features. To switch them off, set `isEnabled=false`. | `isEnabled=true`        |
| `version`  | Configuration version. Don’t edit this. Can be empty.                                                                                            | the most recent release |

### Configuration sources

Busola configuration is the product of gathering and merging the configurations from several individual sources. The following list presents the sources in the order of precedence:

**Backend:**

- Busola backend default cluster configuration, acquired from the [defaultConfig.yaml](backend/settings/defaultConfig.yaml) file.
- Busola cluster configuration, available on the Busola cluster in the ConfigMap "busola/busola-config" under the key "config".
  This data is mounted to the Busola `web` and `backend` Pods, and during the local development,
  the [defaultConfig.yaml](backend/settings/defaultConfig.yaml) file is used.

**Frontend:**

- Built-in, hardcoded defaults.
- Busola frontend default cluster configuration, acquired from the [defaultConfig.yaml](public/defaultConfig.yaml) file.
- Busola cluster configuration, available on the Busola cluster in the ConfigMap "busola/busola-config" under the key "config".
  This data is mounted to the Busola `web` and `backend` Pods, and during the local development,
  the [defaultConfig.yaml](public/defaultConfig.yaml) file is used.
- Target cluster configuration, available on the target cluster in ConfigMap "kube-public/busola-config" under the key "config". Busola performs a request for that resource during the bootstrap process.
- Custom configuration with `extensibility` and `config` located in [public/environemnt](./public/environments),[read more](#environment-specific-settings).

### Change the Configuration

If you have the required authorizations and access to the kubeconfig, you can change the settings for the Busola cluster configuration and the target cluster configuration.

With the `feature` toggles, you can switch each Busola feature on or off and configure them to fit your needs.
Features comprise the following elements:

- `FEATURE_ID`: Unique identifier, as defined in the Busola source code
- `selector`: The k8s resources that can activate the feature
- `isEnabled`: Activates or deactivates the feature, overwriting the status set by `selector`
- `config`: Provides additional configuration options as needed for each feature. For details, see the README in the specific component or feature.

See the available Busola [feature flags](docs/features.md) for more information.

#### Environment specific settings

You can provide override to the default configuration with your own environment specific settings.
Custom environment directory structure should look and be placed in **public/environments**.

```
custom-env/
├── config
│   └── config.yaml
└── extensions
    ├── extensions.yaml
    └── wizards.yaml
```

> **Important:** Files `extensions.yaml`, `statics.yaml`, `wizards.yaml` and `config.yaml` are required to make busola work properly.

To activate environment configuration you have to create or edit `active.env` file located in [public](./public).
The `active.env` file should look like that:

```dotenv
ENVIRONMENT=your-environment-name
```

When the `ENVIRONMENT` is set to `my-env`, the busola looks for custom configuration in **public/environemnt/my-env**
If the `ENVIRONMENT` is not set busola fetch default configuration which has the same structure as custom configuration located in [public](./public)

In case of docker image, the file `active.env` is created from `ENVIRONMENT` env at the startup to image.

## Development

### Start all views

Use the following command to run Busola locally:

```bash
npm start
```

After a while, open the [http://localhost:8080](http://localhost:8080) address in your browser, and provide your kubeconfig in the **Connect cluster** wizard.

Once you started Busola locally, you can begin the development. All modules have the hot-reload feature enabled, therefore, you can edit the code in real-time and see the changes in your browser.

The apps you started run at the following addresses:

- `Busola` - [http://localhost:8080](http://localhost:8080)
- `Backend` - [http://localhost:3001](http://localhost:3001)

### Security countermeasures

When developing new features in Busola, adhere to the following rules. This will help you to mitigate any security-related threats.

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
   docker run --rm -it -p 3001:3001 -v <path to your kubeconfig>:/app/core-ui/kubeconfig/<your kubeconfig file name> --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
   ```

2. When you open Busola in your browser, go to `http://localhost:3001?kubeconfigID={YOUR_KUBECONFIG_FILE_NAME}`. Busola will try to download that file and add it for your Busola instance.

## Troubleshooting

> **TIP:** To solve most of the problems with Busola development, clear the browser cache or do a hard refresh of the website.

### Connectivity Issues with Busola Against a k3d Cluster

#### Symptom

You are experiencing connectivity problems with Busola in Docker against a k3d cluster.

#### Cause

When the k3d cluster's API Server is exposed on the `0.0.0.0` address on your machine, Busola in Docker interprets `0.0.0.0` as its internal Docker address, routing the requests to the wrong endpoint.

#### Remedy

- For Docker Desktop for Mac and Windows, pass `DOCKER_DESKTOP_CLUSTER=true` on dockerized Busola startup. This way, `0.0.0.0` is automatically replaced with `host.docker.internal`, which is resolved to 'routable' IP address of a Docker Desktop virtual machine.

  ```bash
  docker run --rm -it -p 3001:3001 -e DOCKER_DESKTOP_CLUSTER=true --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
  ```

- For Linux, run Busola with `--net=host` (omitting the `-p` parameter).

  ```bash
  docker run --rm -it --net=host --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
  ```

### SSL Certificate Issue While Connecting to the API Server

#### Symptom

When you run Busola in Docker on macOS, it can't connect to the k3d cluster. The container log contains the following errors:

```
Error [ERR_TLS_CERT_ALTNAME_INVALID]: Hostname/IP does not match certificate's altnames: Host: host.docker.internal. is not in the cert's altnames: DNS:k3d-k3s-default-server-0, DNS:k3d-k3s-default-serverlb, DNS:kubernetes, DNS:kubernetes.default, DNS:kubernetes.default.svc, DNS:kubernetes.default.svc.cluster.local, DNS:localhost, IP Address:0.0.0.0, IP Address:10.43.0.1, IP Address:127.0.0.1, IP Address:172.28.0.3, IP Address:0:0:0:0:0:0:0:1
```

#### Cause

Busola run in a Docker container with the environment variable `DOCKER_DESKTOP_CLUSTER=true` replaces the IP `0.0.0.0` in the API Server URL with `host.docker.internal`. Kubernetes is not aware of that host name, so its API Server doesn't have it in the SSL certificate, which results in the above error.

Furthermore, this behavior has changed in the recent k3d versions, which is a result of [this fix](https://github.com/k3s-io/k3s/commit/aa76942d0fcb23dd02c25aa7a0dfb96b6b915fa5) for [this security issue](https://github.com/k3s-io/k3s/security/advisories/GHSA-m4hf-6vgr-75r2).

Clusters created by [k3d](https://k3d.io/) use a [listener](https://github.com/rancher/dynamiclistener) that extracts [SNI](https://en.wikipedia.org/wiki/Server_Name_Indication) host names from requests sent to the API server. If a new host name is requested, then the SSL certificate is regenerated, and the new host name is added to the list of Subject Alternative Names. Unfortunately, the security fix limits this mechanism only to the expected host names, like those related to Kubernetes nodes. This makes it useless for the `host.docker.internal` case.

#### Remedy

Provide the `host.docker.internal` host name upfront during [k3d](https://k3d.io/) cluster creation:

```
k3d cluster create kyma --k3s-arg '--tls-san=host.docker.internal@server:*'
```

A cluster created in such a way has the `host.docker.internal` set as Subject Alternative Name in the SSL Certificate of the API Server since the very beginning.

## Contributing

See the [Contributing Rules](CONTRIBUTING.md).

## Code of Conduct

See the [Code of Conduct](CODE_OF_CONDUCT.md) document.

## Licensing

See the [license](./LICENSE) file.
