#!/bin/bash

set -e

OS="$(uname -s | tr 'A-Z' 'a-z')"
echo "Using OS:" "${OS}"

if [ ! -f "./bin/kyma" ]; then
  echo "Kyma CLI Download is starting"
  mkdir -p ./bin
  curl -Lo ./bin/kyma https://storage.googleapis.com/kyma-cli-unstable/kyma-"${OS}"
  chmod +x ./bin/kyma
  echo "Kyma CLI Download finished"
fi

echo "Provisioning k3d cluster for Kyma"
k3d registry create kyma-registry.localhost --port 5000

# kyma alpha deploy command expects a cluster with an internal k3d registry, so we provide one
k3d cluster create kyma --kubeconfig-switch-context -p 80:80@loadbalancer -p 443:443@loadbalancer --registry-use kyma-registry.localhost:5000
