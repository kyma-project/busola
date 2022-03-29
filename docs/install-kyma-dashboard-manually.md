---
title: Install Kyma Dashboard manually
---

To run Kyma Dashboard manually on a cluster, you must install it together with Istio Ingress. Follow this document to learn how to do so.

## Prerequisites

- Export KUBECONFIG as an environment variable that points to the kubeconfig file.
- If you install Kyma Dashboard on a cluster other than the Kyma cluster, you must have [Istio configured](https://istio.io/latest/docs/setup/getting-started/). On Kyma clusters, Istio is already configured by default.

## Install Kyma Dashboard with Istio Ingress

1. Create a Namespace for Kyma Dashboard:
   ```bash
   kubectl create namespace {NAMESPACE_NAME}
   ```
   For example:
   ```bash
   kubectl create namespace busola
   ```
2. Go to the `resources` folder and run the `apply-resources-istio.sh` script that deploys Kyma Dashboard under the given domain along with the Services and configuration. When running the script, make sure to provide your domain and Namespace name:

   ```bash
   ./apply-resources-istio.sh {DOMAIN} {NAMESPACE_NAME}
   ```

   > **NOTE:** In the case of k3d, your domain must end with `.local.kyma.dev`.

   For example:

   ```bash
   ./apply-resources-istio.sh busola.local.kyma.dev busola
   ```

3. Wait a minute for the Dashboard to start.
4. The Dashboard is available under your domain (for example, `https://busola.local.kyma.dev/`).

## Enable SSL on the backend service

Generate a CA Certificate and corresponding tls key & tls cert.  
Then set the following environment variables:

```bash
BUSOLA_SSL_ENABLED=1
BUSOLA_SSL_KEY_FILE=/path/to/tls.key
BUSOLA_SSL_CRT_FILE=/path/to/tls.crt
```
