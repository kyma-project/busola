#!/bin/bash

#  Installs busola on k8s

# standard bash error handling
set -o nounset  # treat unset variables as an error and exit immediately.
set -o errexit  # exit immediately when a command fails.
set -E          # needs to be set if we want the ERR trap
set -o pipefail # prevents errors in a pipeline from being masked

trap print_k8s_resources EXIT

print_k8s_resources()
{
  kubectl get all
  kubectl get deployment -oyaml
  kubectl get pod -oyaml
  kubectl logs deployments/busola
}

ENV=${ENV?"env is not set"}
IMG=$1

kubectl delete configmap environment --ignore-not-found=true
kubectl create configmap environment --from-literal=ENVIRONMENT="${ENV}"
echo "### Deploying busola from: ${IMG}"

cd resources
(cd base && kustomize edit set image busola="${IMG}")
kustomize build base/ | kubectl apply -f-

kubectl apply -f ingress/ingress.yaml

# wait for busola to be deployed
kubectl wait --for=condition=Available deployment/busola

# return ip address busola and save it to output
kubectl wait --for=jsonpath='{.status.loadBalancer.ingress}' ingress/busola
IP=$(kubectl get ingress busola -ojson | jq .status.loadBalancer.ingress[].ip | tr -d '/"')
echo "IP address: ${IP}"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "IP=${IP}" >> "${GITHUB_OUTPUT}"
  echo "IP saved"
  fi;
