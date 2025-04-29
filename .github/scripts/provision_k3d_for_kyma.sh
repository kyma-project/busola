#!/bin/bash

# Creates K3d with container registry on port 5000.

set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

echo "Provisioning k3d cluster for Kyma"
k3d registry create kyma-registry.localhost --port 5000

# kyma alpha deploy command expects a cluster with an internal k3d registry, so we provide one
k3d cluster create kyma --kubeconfig-switch-context -p 80:80@loadbalancer -p 443:443@loadbalancer --registry-use k3d-kyma-registry.localhost:5000
