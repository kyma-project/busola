#!/bin/bash

set -e

APPLICATION_CONNECTOR_VERSION="1.1.3"

make --makefile ./.github/scripts/kyma.mk kyma

echo "Provisioning k3d cluster for Kyma"
k3d registry create kyma-registry --port 5001

# kyma alpha deploy command expects a cluster with an internal k3d registry, so we provide one
k3d cluster create kyma --kubeconfig-switch-context -p 80:80@loadbalancer -p 443:443@loadbalancer --registry-use kyma-registry

kubectl create ns kyma-system

./bin/kyma alpha deploy

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

echo "Apply and enable telemetry module"
kubectl apply -f https://github.com/kyma-project/telemetry-manager/releases/latest/download/telemetry-manager.yaml
kubectl apply -f https://github.com/kyma-project/telemetry-manager/releases/latest/download/telemetry-default-cr.yaml -n kyma-system

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
