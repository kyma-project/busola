#!/bin/bash
set -e

if [ -z "$1" ] ; then
    echo "No domain passed as first argument, aborting." 
    exit 1
fi

export DOMAIN=$1
NAMESPACE=${2:-busola}
export ENVIRONMENT=$3
TMP_DIR="../temp/resources"


mkdir -p "${TMP_DIR}"
cp -rf . "${TMP_DIR}"

kubectl create namespace "${NAMESPACE}" || true
kubectl apply -k "${TMP_DIR}/environments/${ENVIRONMENT}" --namespace="${NAMESPACE}"

envsubst < "${TMP_DIR}"/ingress/ingress.tpl.yaml > "${TMP_DIR}"/ingress/ingress.yaml
kubectl apply -k "${TMP_DIR}"/ingress --namespace=$NAMESPACE
