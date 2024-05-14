#!/bin/bash

set -e
export CYPRESS_DOMAIN=http://localhost:3000
export NO_COLOR=1

function deploy_k3d (){
echo "Provisioning k3d cluster"
k3d cluster create k3dCluster

k3d kubeconfig get k3dCluster > tests/lighthouse/fixtures/kubeconfig.yaml
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

deploy_k3d  &> $ARTIFACTS/k3d-deploy.log &
build_and_run_busola  &> $ARTIFACTS/busola-build.log &

echo 'Waiting for deploy_k3d and build_and_run_busola'
wait -n
echo "First process finished"
wait -n
echo "Second process finished"

cd tests/lighthouse
npm ci && npx playwright install --with-deps && npm run "test"