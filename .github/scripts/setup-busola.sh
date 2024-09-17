#!/bin/bash

set -e
export KYMA_DASHBOARD_IMG="k3d-registry.localhost:5000/kyma-dashboard"

echo "Build local image"
docker build -t "${KYMA_DASHBOARD_IMG}" -f Dockerfile.local.kyma .
echo "Running kyma-dashboard... with ${ENV} configuration"
docker run -d --rm --net=host --pid=host --name kyma-dashboard --env ENVIRONMENT="${ENV}" "${KYMA_DASHBOARD_IMG}"

echo "waiting for server to be up..."
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' "http://localhost:3001")" != "200" ]]; do sleep 5; done
sleep 10

ENV_RESPONSE=$(curl "http://localhost:3001/active.env")
echo $ENV_RESPONSE

ACTIVE_ENV=${ENV_RESPONSE/ENVIRONMENT=}
ACTIVE_ENV=$(echo "${ACTIVE_ENV}" | tr -d '\n')
echo "Active env: ${ACTIVE_ENV}"

if [ "$ENV" != "$ACTIVE_ENV" ]; then
  echo "Active env: ${ACTIVE_ENV} is not the same as desired: ${ENV}"
  exit 1
fi
echo "Active env matches the desired env"
