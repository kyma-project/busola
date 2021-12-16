---
title: Install Kyma Dashboard manually
---

The document describes how to install Kyma Dashboard with Istio Ingress. It also specifies how to install the Dashboard on a Kyma cluster.

> NOTE: In both cases you need to export KUBECONFIG as an environment variable, so it points to the kubeconfig file, which you want to use.

1. **Install Kyma Dashboard with Istio Ingress**

> NOTE: To install Kyma Dashboard manually with Istio Ingress you need to have Istio configured on your cluster. See [Istio Getting Started](https://istio.io/latest/docs/setup/getting-started/) for more information.

- Create a Namespace for Kyma Dashboard:

  `kubectl create namespace {NAMESPACE_NAME}`

  Example

  `kubectl create namespace busola`

* Go to `resources` and provide your **{DOMAIN}** and **{NAMESPACE}**.

  `./apply-resources-istio.sh <DOMAIN> <NAMESPACE_NAME>`

  Example

  `./apply-resources-istio.sh busola.local.kyma.dev busola`

- Wait a minute for the Dashboard to start.
- The Dashboard is available under your **{DOMAIN}** (e.g. `https://busola.local.kyma.dev/`)

2. Install Kyma Dashboard on a Kyma cluster

Kyma cluster comes with the Istio already configured. All you need to do is to follow steps 1-4 from Istio Ingress section, to have your Dashboard installed.
In case of k3d your **{DOMAIN}** must end with `.local.kyma.dev`.
