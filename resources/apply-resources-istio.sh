#!/bin/bash
set -e

if [ -z "$1" ] ; then
    echo "No domain passed as first argument, aborting." 
    exit 1
fi

export DOMAIN=$1
export NAMESPACE=${2:-busola}
export ENVIRONMENT=$3
TMP_DIR="../temp/resources"

./apply-resources.sh "$@"

envsubst < "${TMP_DIR}"/istio/virtualservice-busola.tpl.yaml > "${TMP_DIR}"/istio/virtualservice-busola.yaml

kubectl apply -k "${TMP_DIR}"/istio --namespace=$NAMESPACE
