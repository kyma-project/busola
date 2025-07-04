#!/bin/bash

# Prepares kubeconfig to be used on the same cluster with busola installed on it.

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

k3d kubeconfig get kyma > tests/integration/fixtures/kubeconfig.yaml

#To access kubernetes cluster inside the same cluster change the api server address to url available inside the cluster.
yq --inplace '.clusters[].cluster.server = "https://kubernetes.default.svc:443"' tests/integration/fixtures/kubeconfig.yaml
