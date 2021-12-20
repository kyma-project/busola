---
title: Install Kyma Dashboard manually
---

This document describes how to install Kyma Dashboard with Istio Ingress. It also provides instructions on how to install the Dashboard on a Kyma cluster.

> **NOTE**: In both cases, you must export KUBECONFIG as an environment variable that points to the kubeconfig file you want to use.

## Install Kyma Dashboard with Istio Ingress

> **NOTE**: To install Kyma Dashboard manually with Istio Ingress, you must have Istio configured on your cluster. See [Istio Getting Started](https://istio.io/latest/docs/setup/getting-started/) for more information.

1. Create a Namespace for Kyma Dashboard:

   ```bash
   kubectl create namespace {NAMESPACE_NAME}
   ```

   Example

   ```bash
   kubectl create namespace busola
   ```

2. Go to the `resources` folder and provide your domain and Namespace name:

   ```bash
   ./apply-resources-istio.sh {DOMAIN} {NAMESPACE_NAME}
   ```

   The `apply-resources-istio.sh` script deploys Kyma Dashboard under the given domain along with the Services and configuration.

   Example

   ```bash
   ./apply-resources-istio.sh busola.local.kyma.dev busola
   ```

3. Wait a minute for the Dashboard to start.
4. The Dashboard is available under your domain (for example, `https://busola.local.kyma.dev/`).

## Install Kyma Dashboard on a Kyma cluster

Kyma cluster comes with Istio already configured. All you need to do is to follow all steps from the Istio Ingress section, to have your Dashboard installed.
In the case of k3d, your domain must end with `.local.kyma.dev`.
