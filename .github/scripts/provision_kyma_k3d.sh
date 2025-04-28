#!/bin/bash

set -e

echo "Provisioning k3d cluster for Kyma"
k3d registry create kyma-registry --port 5000

# kyma alpha deploy command expects a cluster with an internal k3d registry, so we provide one
k3d cluster create kyma --kubeconfig-switch-context -p 80:80@loadbalancer -p 443:443@loadbalancer --registry-use kyma-registry
