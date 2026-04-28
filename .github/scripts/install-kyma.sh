#!/bin/bash

# Deploys all Kyma related resources

set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

# Retry kubectl apply for remote URLs to handle transient network failures
kubectl_apply_url() {
  local url="$1"
  shift
  local attempt=0
  local max_attempts=10
  until kubectl apply -f "$url" "$@"; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "ERROR: kubectl apply -f $url failed after $max_attempts attempts"
      return 1
    fi
    echo "kubectl apply -f $url failed (attempt $attempt/$max_attempts), retrying in 10s..."
    sleep 10
  done
}

# Create if not exist
kubectl get ns kyma-system || kubectl create ns kyma-system
kubectl get ns kcp-system || kubectl create ns kcp-system

echo "Apply and enable keda module"
kubectl_apply_url https://github.com/kyma-project/keda-manager/releases/latest/download/keda-manager.yaml
kubectl_apply_url https://github.com/kyma-project/keda-manager/releases/latest/download/keda-default-cr.yaml

echo "Apply and enable serverless module"
kubectl_apply_url https://github.com/kyma-project/serverless-manager/releases/latest/download/serverless-operator.yaml
kubectl_apply_url https://github.com/kyma-project/serverless-manager/releases/latest/download/default-serverless-cr.yaml

echo "Apply api-gateway"
kubectl_apply_url https://github.com/kyma-project/api-gateway/releases/latest/download/api-gateway-manager.yaml
kubectl_apply_url https://github.com/kyma-project/api-gateway/releases/latest/download/apigateway-default-cr.yaml

echo "Apply istio"
kubectl_apply_url https://github.com/kyma-project/istio/releases/latest/download/istio-manager.yaml
kubectl_apply_url https://github.com/kyma-project/istio/releases/latest/download/istio-default-cr.yaml

echo "Apply application connector"
APPLICATION_CONNECTOR_VERSION="1.1.3"
kubectl_apply_url https://github.com/kyma-project/application-connector-manager/releases/download/${APPLICATION_CONNECTOR_VERSION}/application-connector-manager.yaml
kubectl_apply_url https://github.com/kyma-project/application-connector-manager/releases/download/${APPLICATION_CONNECTOR_VERSION}/default_application_connector_cr.yaml

echo "Apply eventing"
kubectl_apply_url https://github.com/kyma-project/eventing-manager/releases/latest/download/eventing-manager.yaml

echo "Apply and enable telemetry module"
kubectl_apply_url https://github.com/kyma-project/telemetry-manager/releases/latest/download/telemetry-manager.yaml
kubectl_apply_url https://github.com/kyma-project/telemetry-manager/releases/latest/download/telemetry-default-cr.yaml -n kyma-system

echo "Apply modules fixtures"
kubectl apply -f tests/integration/fixtures/module-templates-crd.yaml
kubectl apply -f tests/integration/fixtures/test-crd-kyma.yaml
until kubectl wait --for=condition=established --timeout=10s crd/kymas.operator.kyma-project.io 2>/dev/null; do
  echo "Waiting for kymas CRD to be established..."
  sleep 2
done
kubectl apply -f tests/integration/fixtures/modules
kubectl apply -f tests/integration/fixtures/community-modules

echo "Apply Kyma provision fixture"
kubectl apply -f tests/integration/fixtures/kyma-info-cm.yaml
kubectl apply -f tests/integration/fixtures/shoot-info-cm.yaml

echo "Apply gardener resources"
echo "Certificates"
kubectl_apply_url https://raw.githubusercontent.com/gardener/cert-management/master/pkg/apis/cert/crds/cert.gardener.cloud_certificates.yaml
echo "DNS Providers"
kubectl_apply_url https://raw.githubusercontent.com/gardener/external-dns-management/master/pkg/apis/dns/crds/dns.gardener.cloud_dnsproviders.yaml
echo "Apply Secret for DNS Providers"
kubectl apply -f tests/integration/fixtures/test-secret.yaml
echo "DNS Entries"
kubectl_apply_url https://raw.githubusercontent.com/gardener/external-dns-management/master/pkg/apis/dns/crds/dns.gardener.cloud_dnsentries.yaml
echo "Issuers"
kubectl_apply_url https://raw.githubusercontent.com/gardener/cert-management/master/pkg/apis/cert/crds/cert.gardener.cloud_issuers.yaml

echo "Apply OAuth2 Hydra CRD"
kubectl_apply_url https://raw.githubusercontent.com/ory/hydra-maester/master/config/crd/bases/hydra.ory.sh_oauth2clients.yaml
