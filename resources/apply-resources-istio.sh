#!/bin/bash
set -e

if [ -z "$1" ] ; then
    echo "No domain passed as first argument, aborting." 
    exit 1
fi

export DOMAIN=$1
export NAMESPACE=${2:-default}
TMP_DIR="../temp/resources"


mkdir -p "${TMP_DIR}"
cp -rf . "${TMP_DIR}"
#./apply-resources.sh "$@"

envsubst < "${TMP_DIR}"/istio/gateway.tpl.yaml > "${TMP_DIR}"/istio/gateway.yaml
envsubst < "${TMP_DIR}"/istio/http_route.tpl.yaml > "${TMP_DIR}"/istio/http_route.yaml

kubectl apply -k "${TMP_DIR}"/istio --namespace=$NAMESPACE
