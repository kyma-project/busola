#!/bin/bash

set -e
export CYPRESS_DOMAIN=http://localhost:3000
export NO_COLOR=1
export KUBECONFIG="$GARDENER_KYMA_PROW_KUBECONFIG"
OS="$(uname -s)"
ARCH="$(uname -m)"

function deploy_k3d_kyma (){
echo "Provisioning k3d cluster"
k3d cluster create k3dCluster

k3d kubeconfig get k3dCluster > tests/integration/fixtures/kubeconfig.yaml
k3d kubeconfig get k3dCluster > tests/integration/fixtures/kubeconfig-k3s.yaml
}

function build_and_run_busola() {
npm ci && npm run build
npm i -g serve 
serve -s build > $ARTIFACTS/busola.log &

pushd backend
npm start > $ARTIFACTS/backend.log &
popd

echo "waiting for server to be up..."
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' "$CYPRESS_DOMAIN")" != "200" ]]; do sleep 5; done
sleep 10
}

deploy_k3d_kyma  &> $ARTIFACTS/kyma-alpha-deploy.log &
build_and_run_busola  &> $ARTIFACTS/busola-build.log &

echo 'Waiting for deploy_k3d_kyma and build_and_run_busola'
wait -n
echo "First process finished"
wait -n
echo "Second process finished"

cd tests/integration
npm ci && npm run "test:$SCOPE"