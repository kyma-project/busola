#!/bin/bash

set -e
export CYPRESS_DOMAIN=http://localhost:3001
export NO_COLOR=1
export REPO_IMG_DEV="k3d-registry.localhost:5000/kyma-dashboard"
export TAG="test-dev"
OS="$(uname -s | tr 'A-Z' 'a-z')"
ARCH="$(uname -m)"

APPLICATION_CONNECTOR_VERSION="1.1.3"

apt-get update -y 
apt-get install -y gettext-base

function deploy_k3d_kyma (){
echo "Using OS:" ${OS}
curl -Lo kyma https://storage.googleapis.com/kyma-cli-unstable/kyma-${OS}
chmod +x ./kyma

echo "Provisioning k3d cluster for Kyma"
k3d registry create kyma-registry --port 5001

# kyma alpha deploy command expects a cluster with an internal k3d registry, so we provide one
k3d cluster create kyma --kubeconfig-switch-context -p 80:80@loadbalancer -p 443:443@loadbalancer --registry-use kyma-registry
kubectl create ns kyma-system

./kyma alpha deploy

echo "Apply and enable keda module"
kubectl apply -f https://github.com/kyma-project/keda-manager/releases/latest/download/keda-manager.yaml
kubectl apply -f https://github.com/kyma-project/keda-manager/releases/latest/download/keda-default-cr.yaml

echo "Apply and enable serverless module"
kubectl apply -f https://github.com/kyma-project/serverless-manager/releases/latest/download/serverless-operator.yaml
kubectl apply -f https://github.com/kyma-project/serverless-manager/releases/latest/download/default-serverless-cr.yaml

echo "Apply api-gateway"
kubectl apply -f https://github.com/kyma-project/api-gateway/releases/latest/download/api-gateway-manager.yaml
kubectl apply -f https://github.com/kyma-project/api-gateway/releases/latest/download/apigateway-default-cr.yaml

echo "Apply istio"
kubectl apply -f https://github.com/kyma-project/istio/releases/latest/download/istio-manager.yaml
kubectl apply -f https://github.com/kyma-project/istio/releases/latest/download/istio-default-cr.yaml

echo "Apply application connector"
kubectl apply -f https://github.com/kyma-project/application-connector-manager/releases/download/${APPLICATION_CONNECTOR_VERSION}/application-connector-manager.yaml
kubectl apply -f https://github.com/kyma-project/application-connector-manager/releases/download/${APPLICATION_CONNECTOR_VERSION}/default_application_connector_cr.yaml

echo "Apply eventing"
kubectl apply -f https://github.com/kyma-project/eventing-manager/releases/latest/download/eventing-manager.yaml

echo "Apply module templates"
kubectl apply -f ./extensions/modules/api-gateway-regular.yaml
kubectl apply -f ./extensions/modules/eventing-fast.yaml
kubectl apply -f ./extensions/modules/eventing-regular.yaml

if [[ ${JOB_NAME} =~ .*smoke.* ]]; then
    echo "Apply and enable telemetry module"
    kubectl apply -f https://github.com/kyma-project/telemetry-manager/releases/latest/download/telemetry-manager.yaml
    kubectl apply -f https://github.com/kyma-project/telemetry-manager/releases/latest/download/telemetry-default-cr.yaml -n kyma-system
fi

echo "Apply gardener resources"
echo "Certificates"
kubectl apply -f https://raw.githubusercontent.com/gardener/cert-management/master/pkg/apis/cert/crds/cert.gardener.cloud_certificates.yaml
echo "DNS Providers"
kubectl apply -f https://raw.githubusercontent.com/gardener/external-dns-management/master/pkg/apis/dns/crds/dns.gardener.cloud_dnsproviders.yaml
echo "DNS Entries"
kubectl apply -f https://raw.githubusercontent.com/gardener/external-dns-management/master/pkg/apis/dns/crds/dns.gardener.cloud_dnsentries.yaml
echo "Issuers"
kubectl apply -f https://raw.githubusercontent.com/gardener/cert-management/master/pkg/apis/cert/crds/cert.gardener.cloud_issuers.yaml

echo "Apply OAuth2 Hydra CRD"
kubectl apply -f https://raw.githubusercontent.com/ory/hydra-maester/master/config/crd/bases/hydra.ory.sh_oauth2clients.yaml

k3d kubeconfig get kyma > tests/fixtures/kubeconfig.yaml
}

function build_and_run_busola() {
echo "Create k3d registry..."
k3d registry create registry.localhost --port=5000

echo "Make release-dev..."
make release-dev

echo "Running kyma-dashboard..."
docker run -d --rm --net=host --pid=host --name kyma-dashboard "$REPO_IMG_DEV-local-dev:$TAG"

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

cd tests
npm ci && npm run "test:$SCOPE"
