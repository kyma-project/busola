#!/bin/bash

# This script install busola on k8s

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

IMG_TAG=$1

#kubectl create configmap ENV #TODO: Fix it

echo "### Deploying busola from: ${IMG_TAG}"

cd resources
(cd base/web && kustomize edit set image busola-web=europe-docker.pkg.dev/kyma-project/prod/busola-web:"${IMG_TAG}")
(cd base/backend && kustomize edit set image busola-backend=europe-docker.pkg.dev/kyma-project/prod/busola-backend:"${IMG_TAG}")
kustomize build base/ | kubectl apply -f-

kubectl apply -f ingress/ingress.yaml

# WAIT FOR busola to be deployed
kubectl wait --for=condition=Available deployment/web
kubectl wait --for=condition=Available deployment/backend

# return ip address busola and save it to output
IP=$(kubectl get ingress ingress-busola -ojson | jq .status.loadBalancer.ingress[].ip | tr -d '/"')

echo "IP address: ${IP}"

# check if busola is available with curl
curl --fail "${IP}"

if [[ ! -z "${GITHUB_OUTPUT:-}" ]]; then
  echo "IP=${IP}}" > "${GITHUB_OUTPUT}"
  fi;